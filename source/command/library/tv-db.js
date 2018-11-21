import { DateTime } from 'luxon'
import Is from '@pwn/is'
import { Log } from '@virtualpatterns/mablung'
import _TvDB from 'node-tvdb'

import { Command as Configuration } from '../../configuration'
import Process from './process'

import MatchError from './error/match-error'

const TvDB = Object.create({})

TvDB.getTVShow = async function (name, yearReleased, season, episodeNumber, dateAired) {

  const tvDB = new _TvDB(Configuration.key.tvDB)

  let data = null
  let options = {}
  
  Log.trace(`START _TvDB.getSeriesByName('${yearReleased ? `${name} ${yearReleased}` : name}', options)`)
  let start = Process.hrtime()

  try {
    data = await tvDB.getSeriesByName(yearReleased ? `${name} ${yearReleased}` : name, options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace({ options, data }, `STOP _TvDB.getSeriesByName('${yearReleased ? `${name} ${yearReleased}` : name}', options) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

  if (data.length > 0) {

    let tvShow = data
      .map((tvShow) => { 

        return {
          'id': tvShow.id,
          'name': tvShow.seriesName,
          'yearReleased': DateTime.fromISO(tvShow.firstAired).year
        }

      })
      .shift()

    let _episode = await TvDB.getEpisode(tvDB, tvShow, season, episodeNumber, dateAired)

    tvShow = {
      'id': tvShow.id,
      'name': tvShow.name,
      'yearReleased': tvShow.yearReleased,
      'season': _episode.season,
      'episodeNumber': _episode.number,
      'episodeName': _episode.name
    }

    return tvShow

  }
  else {
    throw new MatchError(`Failed to find a matching tv show for the name '${yearReleased ? `${name} ${yearReleased}` : name}'.`)
  }
  
}

TvDB.getEpisode = async function (tvDB, tvShow, season, episodeNumber, dateAired) {

  let data = null
  let options = {}
  
  Log.trace(`START _TvDB.getEpisodesBySeriesId(${tvShow.id}, options)`)
  let start = Process.hrtime()

  try {
    data = await tvDB.getEpisodesBySeriesId(tvShow.id, options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace(`STOP _TvDB.getEpisodesBySeriesId(${tvShow.id}, options) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
 
  }

  if (data.length > 0) {

    let episode = data
      .filter((episode) => {

        if (Is.not.null(season) &&
            Is.not.null(episodeNumber)) {
          return  episode.airedSeason == season &&
                  episode.airedEpisodeNumber == episodeNumber
        }
        else if (Is.not.null(dateAired)) {
          return  DateTime.fromISO(episode.firstAired).equals(dateAired)
        }

      })
      .map((episode) => { 

        Log.trace({ episode }, `_TvDB.getEpisodesBySeriesId(${tvShow.id}, options)`)

        return {
          'id': episode.id,
          'season': episode.airedSeason,
          'number': episode.airedEpisodeNumber,
          'name': episode.episodeName
        }

      })
      .shift()

    return episode

  }
  else {
    throw new MatchError(`Failed to find a matching episode for the tv show '${tvShow.name}', season ${season}, and episode ${episodeNumber}.`)
  }

}

export default TvDB
