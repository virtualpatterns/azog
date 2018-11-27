import Is from '@pwn/is'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import TvDB from 'node-tvdb'

import { Command } from '../../../configuration'

import { SeriesNotFoundError, EpisodeNotFoundError } from '../error/episode-error'

import Video from './video'

const videoPrototype = Video.getResourcePrototype()
const episodePrototype = Object.create(videoPrototype)

episodePrototype.getToPath = async function () {

  let episode = await this.getEpisode()

  let series = Episode.sanitize(episode.seriesTitle)
  let season = `Season ${episode.seasonNumber.toString()}`
  let _episode = `${Episode.sanitize(episode.seriesTitle)} - ${episode.seasonNumber.toString()}x${episode.episodeNumber.toString().padStart(2, '0')} - ${Episode.sanitize(episode.episodeTitle)}`

  return Path.join(Command.path.processed, series, season, `${_episode}.mp4`)

}

episodePrototype.getEpisode = async function () {

  let seasonNumber = this.getSeasonNumber()
  let episodeNumber = this.getEpisodeNumber()
  let dateAired = this.getDateAired()

  let series = await this.getSeries()

  seasonNumber = Is.not.null(seasonNumber) ? seasonNumber : (Is.not.null(episodeNumber) ? 1 : null)

  let options = {}
  options.query = {}

  if (Is.not.null(seasonNumber) &&
      Is.not.null(episodeNumber)) {

    options.query.airedSeason = seasonNumber
    options.query.airedEpisode = episodeNumber

  }
  else if (Is.not.null(dateAired)) {
    options.query.firstAired = dateAired.toFormat(Command.format.date)
  }

  let data = null
  
  Log.debug({ options }, `TvDB.getEpisodesBySeriesId(${series.id}, options) ...`)
  let start = Process.hrtime()

  try {
    data = await Episode.tvDB.getEpisodesBySeriesId(series.id, options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.debug({ options, data }, `TvDB.getEpisodesBySeriesId(${series.id}, options) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)
 
  }

  if (data.length > 0) {

    let episode = data
      .map((episode) => { 

        return {
          'seasonNumber': episode.airedSeason,
          'episodeNumber': episode.airedEpisodeNumber,
          'episodeTitle': episode.episodeName
        }

      })
      .shift()

    episode = {
      'seriesTitle': series.title,
      'seasonNumber': episode.seasonNumber,
      'episodeNumber': episode.episodeNumber,
      'episodeTitle': episode.episodeTitle
    }

    return episode

  }
  else {
    throw new EpisodeNotFoundError(series, seasonNumber, episodeNumber, dateAired)
  }

}

episodePrototype.getSeries = async function () {

  let title = this.getTitle()
  let yearReleased = this.getYearReleased()

  let options = {}
  let data = null
  
  Log.debug(`TvDB.getSeriesByName('${Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title}', options) ...`)
  let start = Process.hrtime()

  try {
    data = await Episode.tvDB.getSeriesByName(Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title, options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.debug({ options, data }, `TvDB.getSeriesByName('${Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title}', options) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)

  }

  if (data.length > 0) {

    let series = data
      .map((series) => { 

        return {
          'id': series.id,
          'title': series.seriesName
        }

      })
      .shift()

    return series

  }
  else {
    throw new SeriesNotFoundError(title, yearReleased)
  }
  
}

const Episode = Object.create(Video)

Episode.createResource = function (fromPath, prototype = episodePrototype) {

  if (Is.undefined(this.tvDB)) {
    this.tvDB = new TvDB(Command.key.tvDB)  
  }

  return Video.createResource.call(this, fromPath, prototype)

}

Episode.getResourcePrototype = function () {
  return episodePrototype
}

Episode.isResource = function (episode) {
  return episodePrototype.isPrototypeOf(episode)
}

Episode.isResourceClass = function (path) {

  if (Video.isResourceClass(path)) {

    let title = Video.getTitle(path)
    let episodeNumber = Video.getEpisodeNumber(path)
    let dateAired = Video.getDateAired(path)

    if (Is.not.null(title) &&
        ( Is.not.null(episodeNumber) ||
          Is.not.null(dateAired))) {
      return true
    }
    else {
      return false
    }

  }
  else {
    return false
  }

}

// Episode.getEpisode = async function (title, yearReleased, seasonNumber, episodeNumber, dateAired) {

//   let series = await Episode.getSeries(title, yearReleased)

//   seasonNumber = Is.not.null(seasonNumber) ? seasonNumber : (Is.not.null(episodeNumber) ? 1 : null)

//   let options = {}
//   options.query = {}

//   if (Is.not.null(seasonNumber) &&
//       Is.not.null(episodeNumber)) {

//     options.query.airedSeason = seasonNumber
//     options.query.airedEpisode = episodeNumber

//   }
//   else if (Is.not.null(dateAired)) {
//     options.query.firstAired = dateAired.toFormat(Command.format.date)
//   }

//   let data = null
  
//   Log.debug({ options }, `TvDB.getEpisodesBySeriesId(${series.id}, options) ...`)
//   let start = Process.hrtime()

//   try {
//     data = await Episode.tvDB.getEpisodesBySeriesId(series.id, options)
//   }
//   finally {

//     let [ seconds, nanoSeconds ] = Process.hrtime(start)
//     Log.debug({ options, data }, `TvDB.getEpisodesBySeriesId(${series.id}, options) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)
 
//   }

//   if (data.length > 0) {

//     let episode = data
//       .map((episode) => { 

//         return {
//           'seasonNumber': episode.airedSeason,
//           'episodeNumber': episode.airedEpisodeNumber,
//           'episodeTitle': episode.episodeName
//         }

//       })
//       .shift()

//     episode = {
//       'seriesTitle': series.title,
//       'seasonNumber': episode.seasonNumber,
//       'episodeNumber': episode.episodeNumber,
//       'episodeTitle': episode.episodeTitle
//     }

//     return episode

//   }
//   else {
//     throw new EpisodeNotFoundError(series, seasonNumber, episodeNumber, dateAired)
//   }

// }

// Episode.getSeries = async function (title, yearReleased) {

//   let options = {}
//   let data = null
  
//   Log.debug(`TvDB.getSeriesByName('${Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title}', options) ...`)
//   let start = Process.hrtime()

//   try {
//     data = await Episode.tvDB.getSeriesByName(Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title, options)
//   }
//   finally {

//     let [ seconds, nanoSeconds ] = Process.hrtime(start)
//     Log.debug({ options, data }, `TvDB.getSeriesByName('${Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title}', options) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)

//   }

//   if (data.length > 0) {

//     let series = data
//       .map((series) => { 

//         return {
//           'id': series.id,
//           'title': series.seriesName
//         }

//       })
//       .shift()

//     return series

//   }
//   else {
//     throw new SeriesNotFoundError(title, yearReleased)
//   }
  
// }

export default Episode
 