import Is from '@pwn/is'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import Score from 'string-similarity'
import TvDB from 'node-tvdb'

import { Command } from '../../../configuration'

import { SeriesNotFoundError, EpisodeNotFoundError, EpisodeByDateAiredNotFoundError, EpisodeByNumberNotFoundError, EpisodeByTitleNotFoundError } from '../error/episode-error'

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

  let dateAired = this.getDateAired()
  let seasonNumber = this.getSeasonNumber()
  let episodeNumber = this.getEpisodeNumber()
  let episodeTitle = this.getEpisodeTitle()

  seasonNumber = Is.not.null(seasonNumber) ? seasonNumber : (Is.not.null(episodeNumber) ? 1 : null)

  let series = await this.getSeries()
  let episode = null

  if (Is.not.null(dateAired)) {
    episode = await episodePrototype.getEpisodeByDateAired(series, dateAired)
  }
  else if (Is.not.null(seasonNumber) &&
           Is.not.null(episodeNumber)) {

    try {
      episode = await episodePrototype.getEpisodeByNumber(series, seasonNumber, episodeNumber)
    }
    catch (error) {

      if (Is.not.null(episodeTitle)) {

        Log.trace(`Episode.getEpisodeByNumber(series, ${seasonNumber}, ${episodeNumber})`)
        Log.trace(error)
  
        episode = await episodePrototype.getEpisodeByTitle(series, episodeTitle)
  
      }
      else {
        throw error
      }

    }

  }

  if (Is.not.null(episode)) {

    return {
      'seriesTitle': series.title,
      'seasonNumber': episode.seasonNumber,
      'episodeNumber': episode.episodeNumber,
      'episodeTitle': episode.episodeTitle
    }

  }
  else {
    throw new EpisodeNotFoundError(series)
  }

}

episodePrototype.getEpisodeByDateAired = async function (series, dateAired) {

  let options = {
    'query': {
      'firstAired': dateAired.toFormat(Command.format.date)
    }
  }

  let data = null
  
  Log.trace(`Episode.getEpisodesBySeriesId(${series.id}, options) ...`)
  let start = Process.hrtime()

  try {
    data = await Episode.getEpisodesBySeriesId(series.id, options)
  }
  finally {
    Log.trace({ options, data }, `Episode.getEpisodesBySeriesId(${series.id}, options) ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.shortDuration)}`)
  }

  if (data.length > 0) {

    return data
      .map((episode) => { 

        return {
          'seasonNumber': episode.airedSeason,
          'episodeNumber': episode.airedEpisodeNumber,
          'episodeTitle': episode.episodeName
        }

      })
      .shift()

  }
  else {
    throw new EpisodeByDateAiredNotFoundError(series, dateAired)
  }

}

episodePrototype.getEpisodeByNumber = async function (series, seasonNumber, episodeNumber) {

  let options = {
    'query': {
      'airedSeason': seasonNumber,
      'airedEpisode': episodeNumber
    }
  }

  let data = null
  
  Log.trace(`Episode.getEpisodesBySeriesId(${series.id}, options) ...`)
  let start = Process.hrtime()

  try {
    data = await Episode.getEpisodesBySeriesId(series.id, options)
  }
  finally {
    Log.trace({ options, data }, `Episode.getEpisodesBySeriesId(${series.id}, options) ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.shortDuration)}`)
  }

  if (data.length > 0) {

    return data
      .map((episode) => { 

        return {
          'seasonNumber': episode.airedSeason,
          'episodeNumber': episode.airedEpisodeNumber,
          'episodeTitle': episode.episodeName
        }

      })
      .shift()

  }
  else {
    throw new EpisodeByNumberNotFoundError(series, seasonNumber, episodeNumber)
  }

}

episodePrototype.getEpisodeByTitle = async function (series, episodeTitle) {

  let options = {}
  let data = null
  
  Log.trace(`Episode.getEpisodesBySeriesId(${series.id}, options) ...`)
  let start = Process.hrtime()

  try {
    data = await Episode.getEpisodesBySeriesId(series.id, options)
  }
  finally {
    Log.trace(`Episode.getEpisodesBySeriesId(${series.id}, options) ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.shortDuration)}`)
  }

  if (data.length > 0) {

    let episode = data
      .map((episode) => { 

        return {
          'seasonNumber': episode.airedSeason,
          'episodeNumber': episode.airedEpisodeNumber,
          'episodeTitle': episode.episodeName,
          'score': Score.compareTwoStrings(episode.episodeName.toLowerCase(), episodeTitle.toLowerCase())
        }

      })
      .reduce((accumulator, episode) => {
        return Is.null(accumulator) ? episode : (accumulator.score > episode.score ? accumulator : episode)
      }, null)

    delete episode.score
    return episode
    
  }
  else {
    throw new EpisodeByTitleNotFoundError(series, episodeTitle)
  }

}

episodePrototype.getSeries = async function () {

  let title = this.getTitle()
  let yearReleased = this.getYearReleased()

  let options = {}
  let data = null
  
  Log.trace(`Episode.getSeriesByName('${Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title}', options) ...`)
  let start = Process.hrtime()

  try {
    data = await Episode.getSeriesByName(Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title, options)
  }
  finally {
    Log.trace({ options, data }, `Episode.getSeriesByName('${Is.not.null(yearReleased) ? `${title} ${yearReleased}` : title}', options) ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.shortDuration)}`)
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

Episode.createResource = function (path, prototype = episodePrototype) {

  if (Is.undefined(Episode.getSeriesByName) &&
      Is.undefined(Episode.getEpisodesBySeriesId)) {

    let tvDB = null
    tvDB = new TvDB(Command.key.tvDB)

    Episode.getSeriesByName = tvDB.getSeriesByName
    Episode.getEpisodesBySeriesId = tvDB.getEpisodesBySeriesId

  }

  return Video.createResource.call(this, path, prototype)

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

export default Episode
 