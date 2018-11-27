import { FileSystem, Log, Path } from '@virtualpatterns/mablung'
import Sanitize from 'sanitize-filename'

import { Command } from '../../configuration'

import { ResourceClassNotFoundError } from './error/resource-error'

const resourcePrototype = Object.create({})

resourcePrototype.process = function () {
  return this.copy()
}

resourcePrototype.getToPath = function () {

  let extension = Path.extname(this.fromPath)
  let name = Path.basename(this.fromPath, extension)

  name = Resource.transform(name)

  return Path.join(Command.path.processed, `${name}${extension}`)

}

resourcePrototype.copy = function () {
  return this.to(FileSystem.copy.bind(FileSystem), 'FileSystem.copy')
}

resourcePrototype.move = function () {
  return this.to(FileSystem.rename.bind(FileSystem), 'FileSystem.rename')
}

resourcePrototype.to = async function (fn, fnName) {

  let toPath = await this.getToPath()

  Log.debug(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
  await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })

  Log.debug(`${fnName}('${Path.basename(this.fromPath)}', '${Path.basename(toPath)}')`)
  await fn(this.fromPath, toPath)

  this.fromPath = toPath

}

const Resource = Object.create({})

Resource.resourceClasses = []

Resource.createResource = function (fromPath, prototype = resourcePrototype) {

  let resource = Object.create(prototype)

  resource.fromPath = fromPath

  return resource

}

Resource.getResourcePrototype = function () {
  return resourcePrototype
}

Resource.isResource = function (resource) {
  return resourcePrototype.isPrototypeOf(resource)
}

Resource.sanitize = function (value) {
  return Sanitize(value)
}

Resource.transform = function (value) {

  do {

    for (let replace of Command.transform.replace) {
      value = value.replace(replace.pattern, replace.with)
    }

    for (let pattern of Command.transform.remove) {
      value = value.replace(pattern, '')
    }
  
  } while ([
    Command.transform.replace.reduce((accumulator, replace) => accumulator || replace.pattern.test(value), false),
    Command.transform.remove.reduce((accumulator, pattern) => accumulator || pattern.test(value), false)
  ].reduce((accumulator, test) => accumulator || test, false))

  return value

}

Resource.isResourceClass = function () {
  return false
}

Resource.registerResourceClass = function(resourceClass = this) {
  this.resourceClasses.push(resourceClass)
}

Resource.selectResourceClass = function(path) {

  for (let resourceClass of this.resourceClasses) {
    if (resourceClass.isResourceClass(path)) {
      return resourceClass
    }
  }

  throw new ResourceClassNotFoundError(path)

}

Resource.selectResource = function (path) {

  let resourceClass = this.selectResourceClass(path)
  let resource = resourceClass.createResource(path)

  return resource
  
}

export default Resource
