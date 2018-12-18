import { FileSystem, Log, Path } from '@virtualpatterns/mablung'
import Is from '@pwn/is'
import Sanitize from 'sanitize-filename'

import Configuration from '../configuration'

import { ResourceClassNotFoundError } from './error/resource-error'

const resourcePrototype = Object.create({})

resourcePrototype.process = function () {
  return this.copy()
}

resourcePrototype.getToPath = function () {

  let extension = Path.extname(this.path)
  let name = Resource.transform(Path.basename(this.path, extension))

  return Path.join(Configuration.path.processed.other, `${name}${extension}`)

}

resourcePrototype.copy = async function () {

  let fromPath = this.path
  let toPath = await this.getToPath()

  Log.debug(`Creating '${Path.relative(Configuration.path.processed.other, toPath)}' ...`)

  Log.trace(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
  await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })

  Log.trace(`FileSystem.copy(fromPath, '${Path.basename(toPath)}')`)
  await FileSystem.copy(fromPath, toPath)

  return this.path = toPath

}

const Resource = Object.create({})

Resource.resourceClasses = []

Resource.createResource = function (path, prototype = resourcePrototype) {

  let resource = Object.create(prototype)

  resource.path = path

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

  let fromValue = value
  let toValue = value

  do {

    for (let replace of Configuration.transform.replace) {
      toValue = toValue.replace(replace.pattern, replace.with)
    }

    for (let pattern of Configuration.transform.remove) {
      toValue = toValue.replace(pattern, '')
    }
  
  } while ([
    Configuration.transform.replace.reduce((accumulator, replace) => accumulator || replace.pattern.test(toValue), false),
    Configuration.transform.remove.reduce((accumulator, pattern) => accumulator || pattern.test(toValue), false)
  ].reduce((accumulator, test) => accumulator || test, false))

  Log.trace(`esource.transform ('${fromValue}') { return '${toValue}' }`)

  return toValue

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
