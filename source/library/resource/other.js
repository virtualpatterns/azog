import { Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'

import Resource from '../resource'

const resourcePrototype = Resource.getResourcePrototype()
const otherPrototype = Object.create(resourcePrototype)

const Other = Object.create(Resource)

Other.createResource = function (path, connection, prototype = otherPrototype) {
  return Resource.createResource.call(this, path, connection, prototype)
}

Other.getResourcePrototype = function () {
  return otherPrototype
}

Other.isResource = function (other) {
  return otherPrototype.isPrototypeOf(other)
}

Other.isResourceClass = function (path) {
  return Configuration.extension.other.includes(Path.extname(path))
}

export default Other
