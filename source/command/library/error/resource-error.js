import { Path } from '@virtualpatterns/mablung'

function ResourceError(message) {

  Error.call(this)
  Error.captureStackTrace(this, ResourceError)

  this.message = message

}

ResourceError.prototype = Object.create(Error.prototype)
ResourceError.prototype.constructor = ResourceError
ResourceError.prototype.name = ResourceError.name

function ResourceClassNotFoundError(path) {

  Error.call(this)
  Error.captureStackTrace(this, ResourceClassNotFoundError)

  this.message = `Unable to find a resource class for the file '${Path.basename(path)}'.`

}

ResourceClassNotFoundError.prototype = Object.create(ResourceError.prototype)
ResourceClassNotFoundError.prototype.constructor = ResourceClassNotFoundError
ResourceClassNotFoundError.prototype.name = ResourceClassNotFoundError.name

export { ResourceError, ResourceClassNotFoundError }
