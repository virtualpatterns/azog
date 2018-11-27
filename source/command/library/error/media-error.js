import { Path } from '@virtualpatterns/mablung'
import { ResourceError } from './resource-error'

function MediaError (message) {

  Error.call(this)
  Error.captureStackTrace(this, MediaError)

  this.message = message

}

MediaError.prototype = Object.create(ResourceError.prototype)
MediaError.prototype.constructor = MediaError
MediaError.prototype.name = MediaError.name

function MediaConversionError (path) {

  Error.call(this)
  Error.captureStackTrace(this, MediaConversionError)

  this.message = `Unable to convert the file '${Path.basename(path)}'.`

}

MediaConversionError.prototype = Object.create(MediaError.prototype)
MediaConversionError.prototype.constructor = MediaConversionError
MediaConversionError.prototype.name = MediaConversionError.name

function MediaProbeError (path) {

  Error.call(this)
  Error.captureStackTrace(this, MediaProbeError)

  this.message = `Unable to probe the file '${Path.basename(path)}'.`

}

MediaProbeError.prototype = Object.create(MediaError.prototype)
MediaProbeError.prototype.constructor = MediaProbeError
MediaProbeError.prototype.name = MediaProbeError.name

export { MediaError, MediaConversionError, MediaProbeError }
