import { Path } from '@virtualpatterns/mablung'

import { Command } from '../../../configuration'

import { MediaError } from './media-error'

function VideoError (message) {

  Error.call(this)
  Error.captureStackTrace(this, VideoError)

  this.message = message

}

VideoError.prototype = Object.create(MediaError.prototype)
VideoError.prototype.constructor = VideoError
VideoError.prototype.name = VideoError.name

function VideoDurationError (path, durationInMinutes, minimumDurationInMinutes) {

  Error.call(this)
  Error.captureStackTrace(this, VideoDurationError)

  this.message = `Unable to process the file '${Path.basename(path)}'. Its duration (${Command.conversion.toMinutes(durationInMinutes)}m) is less than the minimum (${Command.conversion.toMinutes(minimumDurationInMinutes)}m).`

}

VideoDurationError.prototype = Object.create(VideoError.prototype)
VideoDurationError.prototype.constructor = VideoDurationError
VideoDurationError.prototype.name = VideoDurationError.name

export { VideoError, VideoDurationError }
