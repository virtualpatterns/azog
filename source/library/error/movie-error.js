import Is from '@pwn/is'

import { VideoError } from './video-error'

function MovieError (message) {

  Error.call(this)
  Error.captureStackTrace(this, MovieError)

  this.message = message

}

MovieError.prototype = Object.create(VideoError.prototype)
MovieError.prototype.constructor = MovieError
MovieError.prototype.name = MovieError.name

function MovieNotFoundError (title, yearReleased) {

  Error.call(this)
  Error.captureStackTrace(this, MovieNotFoundError)

  this.message = `Unable to find a movie with the title '${title}'${Is.not.null(yearReleased) ? ` released in ${yearReleased}` : ''}.`

}

MovieNotFoundError.prototype = Object.create(MovieError.prototype)
MovieNotFoundError.prototype.constructor = MovieNotFoundError
MovieNotFoundError.prototype.name = MovieNotFoundError.name

export { MovieError, MovieNotFoundError }
