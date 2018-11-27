import Is from '@pwn/is'

import { Command } from '../../../configuration'

import { VideoError } from './video-error'

function EpisodeError(message) {

  Error.call(this)
  Error.captureStackTrace(this, EpisodeError)

  this.message = message

}

EpisodeError.prototype = Object.create(VideoError.prototype)
EpisodeError.prototype.constructor = EpisodeError
EpisodeError.prototype.name = EpisodeError.name

function SeriesNotFoundError (title, yearReleased) {

  Error.call(this)
  Error.captureStackTrace(this, SeriesNotFoundError)

  this.message = `Unable to find a series with the title '${title}'${Is.not.null(yearReleased) ? ` released in ${yearReleased}` : ''}.`

}

SeriesNotFoundError.prototype = Object.create(EpisodeError.prototype)
SeriesNotFoundError.prototype.constructor = SeriesNotFoundError
SeriesNotFoundError.prototype.name = SeriesNotFoundError.name

function EpisodeNotFoundError (series, seasonNumber, episodeNumber, dateAired) {

  Error.call(this)
  Error.captureStackTrace(this, EpisodeNotFoundError)

  if (Is.not.null(seasonNumber) &&
      Is.not.null(episodeNumber)) {
    this.message = `Unable to find an episode for the series '${series.title}', season ${seasonNumber}, and episode ${episodeNumber}.`
  }
  else if (Is.not.null(dateAired)) {
    this.message = `Unable to find an episode for the series '${series.title}' aired on '${dateAired.toFormat(Command.format.date)}'.`
  }
  else {
    this.message = `Unable to find an episode for the series '${series.title}'.`
  }

}

EpisodeNotFoundError.prototype = Object.create(EpisodeError.prototype)
EpisodeNotFoundError.prototype.constructor = EpisodeNotFoundError
EpisodeNotFoundError.prototype.name = EpisodeNotFoundError.name

export { EpisodeError, SeriesNotFoundError, EpisodeNotFoundError }
