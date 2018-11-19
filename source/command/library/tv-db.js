import { DateTime } from 'luxon'
import { Log } from '@virtualpatterns/mablung'
import _TvDB from 'node-tvdb'

import { Command as Configuration } from '../../configuration'
import Process from './process'

import MatchError from './error/match-error'

const TvDB = Object.create({})

TvDB.getTVShow = async function (name, year, season, episode) {

  const tvDB = new _TvDB(Configuration.key.tvDB)

  let data = null
  let options = {}
  
  Log.trace(`START _TvDB.getSeriesByName('${year ? `${name} ${year}` : name}', options)`)
  let start = Process.hrtime()

  try {
    data = await tvDB.getSeriesByName(year ? `${name} ${year}` : name, options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace({ options, data }, `STOP _TvDB.getSeriesByName('${year ? `${name} ${year}` : name}', options) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

  if (data.length > 0) {

    let tvShow = data
      .map((tvShow) => { 

        return {
          'id': tvShow.id,
          'name': tvShow.seriesName,
          'year': DateTime.fromISO(tvShow.firstAired).year,
          'score': 0,
          'numberOfTVShows': data.length
        }

      })
      .shift()

    let _episode = await TvDB.getEpisode(tvDB, tvShow, season, episode)

    tvShow = {
      'id': tvShow.id,
      'name': tvShow.name,
      'year': tvShow.year,
      'season': _episode.season,
      'episodeNumber': _episode.number,
      'episodeName': _episode.name,
      'score': tvShow.score,
      'numberOfTVShows': tvShow.numberOfTVShows
    }

    return tvShow

  }
  else {
    throw new MatchError(`Failed to find a matching tv show for the name '${year ? `${name} ${year}` : name}'.`)
  }
  
}

TvDB.getEpisode = async function (tvDB, tvShow, season, episode) {

  let data = null
  let options = {
    'query': {
      'airedSeason': season,
      'airedEpisode': episode
    }
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

    let _episode = data
      .map((_episode) => { 

        return {
          'id': _episode.id,
          'season': _episode.airedSeason,
          'number': _episode.airedEpisodeNumber,
          'name': _episode.episodeName
        }

      })
      .shift()

    return _episode

  }
  else {
    throw new MatchError(`Failed to find a matching episode for the tv show '${tvShow.name}', season ${season}, and episode ${episode}.`)
  }

}

export default TvDB
