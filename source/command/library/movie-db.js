import { DateTime } from 'luxon'
import Is from '@pwn/is'
import { Log } from '@virtualpatterns/mablung'
import _MovieDB from 'moviedb'
import Utilities from 'util'

import { Command as Configuration } from '../../configuration'
import Process from './process'

import MatchError from './error/match-error'

const MovieDB = Object.create({})

MovieDB.getMovie = async function (title, yearReleased) {

  const movieDB = _MovieDB(Configuration.key.movieDB)

  movieDB.searchMovie = Utilities.promisify(movieDB.searchMovie)

  let data = null

  let options = {}
  options.query = title
  options.include_adult = true

  if (Is.not.null(yearReleased)) {
    options.year = yearReleased
  }

  Log.trace('START _MovieDB.searchMovie(options)')
  let start = Process.hrtime()

  try {
    data = await movieDB.searchMovie(options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace({ options, data }, `STOP _MovieDB.searchMovie(options) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }
  
  if (data.total_results > 0) {

    let movie = data.results
      .map((movie) => { 

        return {
          'id': movie.id,
          'title': movie.title,
          'yearReleased': DateTime.fromISO(movie.release_date).year,
          'score': movie.vote_count
        }

      })
      .reduce((accumulator, movie) => {
        return Is.null(accumulator) ? movie : (accumulator.score > movie.score ? accumulator : movie)
      }, null)

    return movie

  }
  else {
    throw new MatchError(`Failed to find a matching movie for the title '${title}' and year released ${yearReleased}.`)
  }

}

export default MovieDB
