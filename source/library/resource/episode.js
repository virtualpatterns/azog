import Is from '@pwn/is'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import Score from 'string-similarity'
import TvDB from 'node-tvdb'

import Configuration from '../../configuration'

import { SeriesByIdNotFoundError, SeriesByNameNotFoundError, EpisodeByDateAiredNotFoundError, EpisodeByNumberNotFoundError, EpisodeByTitleNotFoundError } from '../error/episode-error'

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

episodePrototype.getEpisode = function () {

  let id = this.getId()
  let seriesTitle = this.getTitle()
  let yearReleased = this.getYearReleased()
  let dateAired = this.getDateAired()
  let [ seasonNumber, episodeNumber ] = this.getSeasonEpisodeNumber()
  let episodeTitle = this.getEpisodeTitle()

  return Episode.getEpisode(id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)

}

episodePrototype.track = function (fromName, toName) {

  let id = this.getId()
  let seriesTitle = this.getTitle()
  let yearReleased = this.getYearReleased()
  let dateAired = this.getDateAired()
  let [ seasonNumber, episodeNumber ] = this.getSeasonEpisodeNumber()
  let episodeTitle = this.getEpisodeTitle()

  return this.connection.insertEpisode(fromName, toName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)

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

    let id = Video.getId(path)
    let title = Video.getTitle(path)
    let episodeNumber = Video.getEpisodeNumber(path)
    let dateAired = Video.getDateAired(path)

    if (( Is.not.null(title) ||
          Is.not.null(id)) &&
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

Episode.getEpisode = async function (id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle) {

  let series = null

  if (Is.not.null(id)) {
    series = await this.getSeriesById(id)
  }
  else {
    series = await this.getSeriesByName(seriesTitle, yearReleased)
  }

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

        // Log.trace(`Episode.getEpisodeByNumber(series, ${seasonNumber}, ${episodeNumber})`)
        // Log.trace(error)
  
        // try {
        episode = await this.getEpisodeByTitle(series, episodeTitle)
        // }
        // catch (error) {

        //   Log.trace(`Episode.getEpisodeByTitle(series, '${episodeTitle}')`)
        //   Log.trace(error)
    
        //   throw error

        // }
  
      }
      else {
        throw error
      }

    }

  }

  // if (Is.not.null(episode)) {

  return {
    'seriesTitle': series.seriesTitle,
    'seasonNumber': episode.seasonNumber,
    'episodeNumber': episode.episodeNumber,
    'episodeTitle': episode.episodeTitle
  }

  // }
  // else {
  //   throw new EpisodeNotFoundError(series)
  // }

}

Episode.getSeriesById = async function (id) {
  Log.trace(`Episode.getSeriesById(${id})`)

  let options = {}
  let data = null

  try {
          
    Log.trace(`TvDB.getSeriesById(${id}, options) ...`)
    let start = Process.hrtime()

    try {
      data = await this.TvDB.getSeriesById(id, options)
    }
    finally {
      Log.trace({ options, data }, `TvDB.getSeriesById(${id}, options) ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.shortDuration)}`)
    }

    return {
      'id': data.id,
      'seriesTitle': data.seriesName
    }

  }
  catch (error) {
    
    delete error.name

    Log.error('catch (error) { ... }')
    Log.error(error)

    throw new SeriesByIdNotFoundError(id)

  }

}

Episode.getSeriesByName = async function (title, yearReleased) {
  Log.trace(`Episode.getSeriesByName('${title}', ${yearReleased})`)

  let options = {}
  let data = null

  let names = []
  
  if (Is.not.null(yearReleased)) {
    names.push(`${title} ${yearReleased}`)
  }
  
  names.push(title)

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

      if (data.length > 0) {
        break
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
          'seriesTitle': series.seriesName,
          'score': Score.compareTwoStrings(series.seriesName.toLowerCase(), title.toLowerCase())
        }

      })
      .sort((seriesA, seriesB) => seriesA.score < seriesB.score ? 1 : (seriesA.score > seriesB.score ? -1 :0))
      .map((series) => {
        Log.debug(`Score ${Configuration.conversion.toScore(series.score)} for series ${series.id} '${series.seriesTitle}'` )
        return series
      })
      .shift()

    return series

  }
  else {
    throw new SeriesByNameNotFoundError(title, yearReleased)
  }

}

Episode.getEpisodeByDateAired = async function (series, dateAired) {
  Log.trace(`Episode.getEpisodeByDateAired(${series.id}, '${dateAired.toFormat(Configuration.format.date)}')`)

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
          'episodeTitle': episode.episodeName || `Episode ${episode.airedEpisodeNumber}`
        }

      })
      .shift()

  }
  else {
    throw new EpisodeByDateAiredNotFoundError(series, dateAired)
  }

}

Episode.getEpisodeByNumber = async function (series, seasonNumber, episodeNumber) {
  Log.trace(`Episode.getEpisodeByNumber(${series.id}, ${seasonNumber}, ${episodeNumber})`)

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
          'episodeTitle': episode.episodeName || `Episode ${episode.airedEpisodeNumber}`
        }

      })
      .shift()

  }
  else {
    throw new EpisodeByNumberNotFoundError(series, seasonNumber, episodeNumber)
  }

}

Episode.getEpisodeByTitle = async function (series, episodeTitle) {
  Log.trace(`Episode.getEpisodeByTitle(${series.id}, '${episodeTitle}')`)

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
          'episodeTitle': episode.episodeName || `Episode ${episode.airedEpisodeNumber}`,
          'score': Is.null(episode.episodeName) ? 0 : Score.compareTwoStrings(episode.episodeName.toLowerCase(), episodeTitle.toLowerCase())
        }

      })
      .sort((episodeA, episodeB) => episodeA.score < episodeB.score ? 1 : (episodeA.score > episodeB.score ? -1 :0))
      .map((episode) => {
        Log.debug(`Score ${Configuration.conversion.toScore(episode.score)} for episode ${episode.seasonNumber}x${episode.episodeNumber.toString().padStart(2, '0')} '${episode.episodeTitle}'` )
        return episode
      })
      .shift()

    delete episode.score
    return episode
    
  }
  else {
    throw new EpisodeByTitleNotFoundError(series, episodeTitle)
  }

}

export default Episode
 