import Is from '@pwn/is'

import Configuration from '../../configuration'

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

function EpisodeNotFoundError (series) {

  Error.call(this)
  Error.captureStackTrace(this, EpisodeNotFoundError)

  this.message = `Unable to find an episode for the series '${series.title}'.`

}

EpisodeNotFoundError.prototype = Object.create(EpisodeError.prototype)
EpisodeNotFoundError.prototype.constructor = EpisodeNotFoundError
EpisodeNotFoundError.prototype.name = EpisodeNotFoundError.name

function EpisodeByDateAiredNotFoundError (series, dateAired) {

  Error.call(this)
  Error.captureStackTrace(this, EpisodeByDateAiredNotFoundError)

  this.message = `Unable to find an episode for the series '${series.title}' aired on '${dateAired.toFormat(Configuration.format.date)}'.`

}

EpisodeByDateAiredNotFoundError.prototype = Object.create(EpisodeNotFoundError.prototype)
EpisodeByDateAiredNotFoundError.prototype.constructor = EpisodeByDateAiredNotFoundError
EpisodeByDateAiredNotFoundError.prototype.name = EpisodeByDateAiredNotFoundError.name

function EpisodeByNumberNotFoundError (series, seasonNumber, episodeNumber) {

  Error.call(this)
  Error.captureStackTrace(this, EpisodeByNumberNotFoundError)

  this.message = `Unable to find an episode for the series '${series.title}', season ${seasonNumber}, and episode ${episodeNumber}.`

}

EpisodeByNumberNotFoundError.prototype = Object.create(EpisodeNotFoundError.prototype)
EpisodeByNumberNotFoundError.prototype.constructor = EpisodeByNumberNotFoundError
EpisodeByNumberNotFoundError.prototype.name = EpisodeByNumberNotFoundError.name

function EpisodeByTitleNotFoundError (series, episodeTitle) {

  Error.call(this)
  Error.captureStackTrace(this, EpisodeByTitleNotFoundError)

  this.message = `Unable to find an episode for the series '${series.title}' titled '${episodeTitle}'.`

}

EpisodeByTitleNotFoundError.prototype = Object.create(EpisodeNotFoundError.prototype)
EpisodeByTitleNotFoundError.prototype.constructor = EpisodeByTitleNotFoundError
EpisodeByTitleNotFoundError.prototype.name = EpisodeByTitleNotFoundError.name

export {
  EpisodeError, 
  SeriesNotFoundError, 
  EpisodeNotFoundError,
  EpisodeByDateAiredNotFoundError,
  EpisodeByNumberNotFoundError,
  EpisodeByTitleNotFoundError 
}