import { DateTime } from 'luxon'
import Is from '@pwn/is'
import { Log } from '@virtualpatterns/mablung'
import _MovieDB from 'moviedb'
import Utilities from 'util'

import Configuration from '../../configuration'
import Process from './process'

import MatchError from './error/match-error'

const SECONDS_PER_NANOSECOND = 1 / 1000000000

const MovieDB = Object.create({})

MovieDB.getMovie = async function (name, year) {

  const movieDB = _MovieDB(Configuration.command.key.movieDB)

  movieDB.searchMovie = Utilities.promisify(movieDB.searchMovie)

  let data = null
  let options = { 
    'query': name, 
    'year': year, 
    'include_adult': true 
  }

  Log.debug('START _MovieDB.searchMovie(options)')
  let start = Process.hrtime()

  try {
    data = await movieDB.searchMovie(options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.debug({ options, data }, `STOP _MovieDB.searchMovie(options) ${(seconds + nanoSeconds * SECONDS_PER_NANOSECOND).toFixed(2)}s`)
  
  }
  
  if (data.total_results > 0) {

    let movie = data.results
      .map((movie) => { 

        return {
          'id': movie.id,
          'name': movie.title,
          'year': DateTime.fromISO(movie.release_date).year,
          'score': movie.vote_count,
          'numberOfMovies': data.total_results
        }

      })
      .reduce((accumulator, movie) => {
        return Is.null(accumulator) ? movie : (accumulator.score > movie.score ? accumulator : movie)
      }, null)

    return movie

  }
  else {
    throw new MatchError(`Failed to find a matching movie for the name '${name}' and year ${year}.`)
  }

}

// MovieDB.getTVShow = function (name, year, season, episode) {
//   Log.debug(`MovieDB.getTVShow('${name}', ${year}, ${season}, ${episode})`)

//   const movieDB = MovieDB(Configuration.command.key.movieDB)

//   return new Promise((resolve, reject) => {

//     let options = {}
//     options.query = name 

//     if (year) {
//       options.first_air_date_year = year
//     }

//     movieDB.searchTv(options, (error, data) => {

//       if (error) {

//         Log.error(options, 'MovieDB.searchTv(options, (error, data) => {})')
//         Log.error(error)

//         reject(error)

//       }
//       else {

//         Log.debug({ options, data }, 'MovieDB.searchTv(options, (error, data) => {})')
  
//         if (data.total_results > 0) {

//           let tvShow = data.results
//             .map((tvShow) => { 
  
//               return {
//                 'id': tvShow.id,
//                 'name': tvShow.name,
//                 'year': DateTime.fromISO(tvShow.first_air_date).year,
//                 'score': tvShow.vote_count,
//                 'numberOfTVShows': data.total_results
//               }
  
//             })
//             .reduce((accumulator, tvShow) => {
//               return Is.null(accumulator) ? tvShow : (accumulator.score > tvShow.score ? accumulator : tvShow)
//             })
  
//           MovieDB
//             ._getEpisode(movieDB, tvShow, season, episode)
//             .then((_episode) => {
  
//               tvShow.season = _episode.season
//               tvShow.episodeNumber = _episode.number
//               tvShow.episodeName = _episode.name
      
//               resolve(tvShow)
  
//             })
//             .catch((error) => reject(error))
  
//         }
//         else {
//           reject(new MatchError(`Failed to find a matching tv show for the name '${name}'${year ? ` and year ${year}.` : '.'}`))
//         }
  
//       }

//     })

//   })
  
// }

// MovieDB._getEpisode = function (movieDB, tvShow, season, episode) {
//   Log.debug(`MovieDB._getEpisode(movieDB, tvShow, ${season}, ${episode})`)

//   return new Promise((resolve, reject) => {

//     let options = {}
//     options.id = tvShow.id
//     options.season_number = season
//     options.episode_number = episode

//     movieDB.tvEpisodeInfo(options, (error, _episode) => {

//       if (error) {

//         Log.error(options, 'MovieDB.tvEpisodeInfo(options, (error, _episode) => {})')
//         Log.error(error)

//         reject(error)

//       }
//       else {

//         Log.debug({ options, _episode }, 'MovieDB.tvEpisodeInfo(options, (error, _episode) => {})')

//         _episode = {
//           'id': _episode.id,
//           'season': _episode.season_number,
//           'number': _episode.episode_number,
//           'name': _episode.name,
//           'score': _episode.vote_count
//         }
  
//         resolve(_episode)
  
//       }

//     })

//   })
  
// }

export default MovieDB
