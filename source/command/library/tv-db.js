import { DateTime } from 'luxon'
import Is from '@pwn/is'
import { Log } from '@virtualpatterns/mablung'
import _TvDB from 'node-tvdb'

import { Command as Configuration } from '../../configuration'
import Process from './process'

import MatchError from './error/match-error'

const TvDB = Object.create({})

TvDB.getTVShow = async function (title, yearReleased, seasonNumber, episodeNumber, dateAired) {

  const tvDB = new _TvDB(Configuration.key.tvDB)

  let data = null
  let options = {}
  
  Log.trace(`START _TvDB.getSeriesByName('${yearReleased ? `${title} ${yearReleased}` : title}', options)`)
  let start = Process.hrtime()

  try {
    data = await tvDB.getSeriesByName(yearReleased ? `${title} ${yearReleased}` : title, options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace({ options, data }, `STOP _TvDB.getSeriesByName('${yearReleased ? `${title} ${yearReleased}` : title}', options) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

  if (data.length > 0) {

    let tvShow = data
      .map((tvShow) => { 

        return {
          'id': tvShow.id,
          'title': tvShow.seriesName,
          'yearReleased': DateTime.fromISO(tvShow.firstAired).year
        }

      })
      .shift()

    let episode = await TvDB.getEpisode(tvDB, tvShow, seasonNumber, episodeNumber, dateAired)

    tvShow = {
      'id': tvShow.id,
      'title': tvShow.title,
      'yearReleased': tvShow.yearReleased,
      'seasonNumber': episode.seasonNumber,
      'episodeNumber': episode.episodeNumber,
      'episodeTitle': episode.episodeTitle
    }

    return tvShow

  }
  else {
    throw new MatchError(`Failed to find a matching tv show for the title '${yearReleased ? `${title} ${yearReleased}` : title}'.`)
  }
  
}

TvDB.getEpisode = async function (tvDB, tvShow, seasonNumber, episodeNumber, dateAired) {

  let data = null
  let options = {
    'query': {}
  }

  if (Is.not.null(seasonNumber) &&
      Is.not.null(episodeNumber)) {

    options.query.airedSeason = seasonNumber
    options.query.airedEpisode = episodeNumber

  }
  else if (Is.not.null(dateAired)) {
    options.query.firstAired = dateAired.toFormat(Configuration.format.date)
  }
  else {
    options = {}
  }
  
  Log.trace(`START _TvDB.getEpisodesBySeriesId(${tvShow.id}, options)`)
  let start = Process.hrtime()

  try {
    data = await tvDB.getEpisodesBySeriesId(tvShow.id, options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace({ options, data }, `STOP _TvDB.getEpisodesBySeriesId(${tvShow.id}, options) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
 
  }

  if (data.length > 0) {

    let episode = data
      .map((episode) => { 

        return {
          'id': episode.id,
          'seasonNumber': episode.airedSeason,
          'episodeNumber': episode.airedEpisodeNumber,
          'episodeTitle': episode.episodeName
        }

      })
      .shift()

    return episode

  }
  else {

    if (Is.not.null(seasonNumber) &&
        Is.not.null(episodeNumber)) {
      throw new MatchError(`Failed to find a matching episode for the tv show '${tvShow.title}', season ${seasonNumber}, and episode ${episodeNumber}.`)
    }
    else if (Is.not.null(dateAired)) {
      throw new MatchError(`Failed to find a matching episode for the tv show '${tvShow.title}' and date aired '${dateAired.toFormat(Configuration.format.date)}'.`)
    }
    else {
      throw new MatchError(`Failed to find a matching episode for the tv show '${tvShow.title}'.`)
    }

  }

}

export default TvDB
