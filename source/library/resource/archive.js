import Resource from '../resource'

const resourcePrototype = Resource.getResourcePrototype()
const archivePrototype = Object.create(resourcePrototype)

const Archive = Object.create(Resource)

Archive.createResource = function (path, connection, prototype = archivePrototype) {
  return Resource.createResource.call(this, path, connection, prototype)
}

Archive.getResourcePrototype = function () {
  return archivePrototype
}

Archive.isResource = function (archive) {
  return archivePrototype.isPrototypeOf(archive)
}

export default Archive
