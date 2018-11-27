import { Path } from '@virtualpatterns/mablung'

import { Command } from '../../../configuration'

import Resource from '../resource'

const resourcePrototype = Resource.getResourcePrototype()
const otherPrototype = Object.create(resourcePrototype)

const Other = Object.create(Resource)

Other.createResource = function (fromPath, prototype = otherPrototype) {
  return Resource.createResource.call(this, fromPath, prototype)
}

Other.getResourcePrototype = function () {
  return otherPrototype
}

Other.isResource = function (other) {
  return otherPrototype.isPrototypeOf(other)
}

Other.isResourceClass = function (path) {
  return Command.extension.other.includes(Path.extname(path))
}

export default Other
