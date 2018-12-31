import { FileSystem, Log, Path } from '@virtualpatterns/mablung'
import Sanitize from 'sanitize-filename'

import Configuration from '../configuration'

import { ResourceClassNotFoundError } from './error/resource-error'

const resourcePrototype = Object.create({})

resourcePrototype.process = function () {
  return this.copyTo(this.getToPath())
}

resourcePrototype.getToPath = function () {

  let extension = Path.extname(this.path)
  let name = Resource.transform(Path.basename(this.path, extension))

  return Path.join(Configuration.path.processed.other, `${name}${extension}`)

}

resourcePrototype.copyTo = async function (path) {

  let fromPath = this.path
  let fromExtension = Path.extname(fromPath)
  let fromName = Path.basename(fromPath, fromExtension)

  let toPath = path
  let toExtension = Path.extname(toPath)
  let toName = Path.basename(toPath, toExtension)
  
  // Log.debug(`Copying to '${Path.basename(toPath)}' ...`)

  Log.trace(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
  await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })

  Log.trace(`FileSystem.copy(fromPath, '${Path.basename(toPath)}', { 'overwrite': true })`)
  await FileSystem.copy(fromPath, toPath, { 'overwrite': true })

  await this.track(fromName, toName)

  return this.path = toPath

}

resourcePrototype.track = function (fromName, toName) {
  return this.connection.insertResource(fromName, toName)
}

const Resource = Object.create({})

Resource.resourceClasses = []

Resource.createResource = function (path, connection, prototype = resourcePrototype) {

  let resource = Object.create(prototype)

  resource.path = path
  resource.connection = connection

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

  // let fromValue = value
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

  // Log.trace(`Resource.transform ('${fromValue}') { return '${toValue}' }`)

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

Resource.selectResource = function (path, connection) {
  return this.selectResourceClass(path).createResource(path, connection)
}

export default Resource
