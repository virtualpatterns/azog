import Is from '@pwn/is'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import Score from 'string-similarity'
import TvDB from 'node-tvdb'

import Configuration from '../../configuration'

import { SeriesNotFoundError, EpisodeNotFoundError, EpisodeByDateAiredNotFoundError, EpisodeByNumberNotFoundError, EpisodeByTitleNotFoundError } from '../error/episode-error'

import Video from './video'

const videoPrototype = Video.getResourcePrototype()
const episodePrototype = Object.create(videoPrototype)

episodePrototype.getToPath = async function () {

  try {

    let episode = await this.getEpisode()
  
    return Path.join(
      Configuration.path.processed.episode, 
      Episode.sanitize(episode.seriesTitle), 
      `Season ${episode.seasonNumber.toString()}`, 
      `${Episode.sanitize(episode.seriesTitle)} - ${episode.seasonNumber.toString()}x${episode.episodeNumber.toString().padStart(2, '0')} - ${Episode.sanitize(episode.episodeTitle)}.mp4`
    )
  
  }
  catch (error) {
      
    delete error.name

    Log.error('catch (error) { ... }')
    Log.error(error)
  
    let extension = Path.extname(this.path)
    let name = Path.basename(this.path, extension)
  
    return Path.join(Configuration.path.processed.episode, `${name}.mp4`)
  
  }

}

episodePrototype.getEpisode = async function () {

  let seriesTitle = this.getTitle()
  let yearReleased = this.getYearReleased()
  let dateAired = this.getDateAired()
  let [ seasonNumber, episodeNumber ] = this.getSeasonEpisodeNumber()
  let episodeTitle = this.getEpisodeTitle()

  return await Episode.getEpisode(seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)

}

episodePrototype.track = function (fromName, toName) {

  let seriesTitle = this.getTitle()
  let yearReleased = this.getYearReleased()
  let dateAired = this.getDateAired()
  let [ seasonNumber, episodeNumber ] = this.getSeasonEpisodeNumber()
  let episodeTitle = this.getEpisodeTitle()

  return this.connection.insertEpisode(fromName, toName, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)

}

const Episode = Object.create(Video)

Episode.createResource = function (path, connection, prototype = episodePrototype) {

  if (Is.undefined(Episode.TvDB)) {
    Episode.TvDB = new TvDB(Configuration.key.tvDB)
  }

  return Video.createResource.call(this, path, connection, prototype)

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

Episode.getEpisode = async function (seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle) {

  let series = await this.getSeries(seriesTitle, yearReleased)
  let episode = null

  if (Is.not.null(dateAired)) {
    episode = await this.getEpisodeByDateAired(series, dateAired)
  }
  else if (Is.not.null(seasonNumber) &&
           Is.not.null(episodeNumber)) {

    try {
      episode = await this.getEpisodeByNumber(series, seasonNumber, episodeNumber)
    }
    catch (error) {

      if (Is.not.null(episodeTitle)) {

        Log.trace(`Episode.getEpisodeByNumber(series, ${seasonNumber}, ${episodeNumber})`)
        Log.trace(error)
  
        episode = await this.getEpisodeByTitle(series, episodeTitle)
  
      }
      else {
        throw error
      }

    }

  }

  if (Is.not.null(episode)) {

    return {
      'seriesTitle': series.seriesTitle,
      'seasonNumber': episode.seasonNumber,
      'episodeNumber': episode.episodeNumber,
      'episodeTitle': episode.episodeTitle
    }

  }
  else {
    throw new EpisodeNotFoundError(series)
  }

}

Episode.getSeries = async function (title, yearReleased) {

  let options = {}
  let data = null

  let names = [ `${title} ${yearReleased}`, title ]

  for (let name of names) {

    try {
            
      Log.trace(`TvDB.getSeriesByName('${name}', options) ...`)
      let start = Process.hrtime()

      try {
        data = await this.TvDB.getSeriesByName(name, options)
      }
      finally {
        Log.trace({ options, data }, `TvDB.getSeriesByName('${name}', options) ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.shortDuration)}`)
      }

    }
    catch (error) {
      
      delete error.name

      Log.error('catch (error) { ... }')
      Log.error(error)

      data = []
  
    }

  }
  
  if (data.length > 0) {

    let series = data
      .map((series) => { 

        return {
          'id': series.id,
          'seriesTitle': series.seriesName
        }

      })
      .shift()

    return series

  }
  else {
    throw new SeriesNotFoundError(title, yearReleased)
  }

}

Episode.getEpisodeByDateAired = async function (series, dateAired) {

  let options = {
    'query': {
      'firstAired': dateAired.toFormat(Configuration.format.date)
    }
  }

  let data = null
  
  Log.trace(`TvDB.getEpisodesBySeriesId(${series.id}, options) ...`)
  let start = Process.hrtime()

  try {
    data = await this.TvDB.getEpisodesBySeriesId(series.id, options)
  }
  finally {
    Log.trace({ options, data }, `TvDB.getEpisodesBySeriesId(${series.id}, options) ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.shortDuration)}`)
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

Episode.getEpisodeByNumber = async function (series, seasonNumber, episodeNumber) {

  let options = {
    'query': {
      'airedSeason': seasonNumber,
      'airedEpisode': episodeNumber
    }
  }

  let data = null
  
  Log.trace(`TvDB.getEpisodesBySeriesId(${series.id}, options) ...`)
  let start = Process.hrtime()

  try {
    data = await this.TvDB.getEpisodesBySeriesId(series.id, options)
  }
  finally {
    Log.trace({ options, data }, `TvDB.getEpisodesBySeriesId(${series.id}, options) ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.shortDuration)}`)
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

Episode.getEpisodeByTitle = async function (series, episodeTitle) {

  let options = {}
  let data = null
  
  Log.trace(`TvDB.getEpisodesBySeriesId(${series.id}, options) ...`)
  let start = Process.hrtime()

  try {
    data = await this.TvDB.getEpisodesBySeriesId(series.id, options)
  }
  finally {
    Log.trace(`TvDB.getEpisodesBySeriesId(${series.id}, options) ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.shortDuration)}`)
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

export default Episode
 