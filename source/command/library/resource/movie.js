import { DateTime } from 'luxon'
import Is from '@pwn/is'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import MovieDB from 'moviedb'
import Utilities from 'util'

import { Command } from '../../../configuration'

import { MovieNotFoundError } from '../error/movie-error'

import Video from './video'

const videoPrototype = Video.getResourcePrototype()
const moviePrototype = Object.create(videoPrototype)

moviePrototype.getToPath = async function () {

  let movie = await this.getMovie()
  let name = `${Movie.sanitize(movie.title)} (${movie.yearReleased})`

  return Path.join(Command.path.processed, `${name}.mp4`)

}

moviePrototype.getMovie = async function () {

  let title = this.getTitle()
  let yearReleased = this.getYearReleased()

  let options = {}
  options.query = title
  options.include_adult = true

  if (Is.not.null(yearReleased)) {
    options.year = yearReleased
  }

  let data = null

  Log.debug({ options }, 'MovieDB.searchMovie(options) ...')
  let start = Process.hrtime()

  try {
    data = await Movie.movieDB.searchMovie(options)
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.debug({ options, data }, `MovieDB.searchMovie(options) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }
  
  if (data.total_results > 0) {

    let movie = data.results
      .map((movie) => { 

        return {
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
    throw new MovieNotFoundError(title, yearReleased)
  }

}

const Movie = Object.create(Video)

Movie.createResource = function (fromPath, prototype = moviePrototype) {

  if (Is.undefined(this.movieDB)) {

    this.movieDB = MovieDB(Command.key.movieDB)
    this.movieDB.searchMovie = Utilities.promisify(this.movieDB.searchMovie)
  
  }

  return Video.createResource.call(this, fromPath, prototype)

}

Movie.getResourcePrototype = function () {
  return moviePrototype
}

Movie.isResource = function (movie) {
  return moviePrototype.isPrototypeOf(movie)
}

Movie.isResourceClass = function (path) {

  if (Video.isResourceClass(path)) {

    let titleFromPath = Video.getTitle(path)
    let seasonNumberFromPath = Video.getSeasonNumber(path)
    let episodeNumberFromPath = Video.getEpisodeNumber(path)
    let dateAiredFromPath = Video.getDateAired(path)
  
    if (Is.not.null(titleFromPath) &&
        Is.null(seasonNumberFromPath) &&
        Is.null(episodeNumberFromPath) &&
        Is.null(dateAiredFromPath)) {
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

// Movie.getMovie = async function (title, yearReleased) {

//   let options = {}
//   options.query = title
//   options.include_adult = true

//   if (Is.not.null(yearReleased)) {
//     options.year = yearReleased
//   }

//   let data = null

//   Log.debug({ options }, 'MovieDB.searchMovie(options) ...')
//   let start = Process.hrtime()

//   try {
//     data = await Movie.movieDB.searchMovie(options)
//   }
//   finally {

//     let [ seconds, nanoSeconds ] = Process.hrtime(start)
//     Log.debug({ options, data }, `MovieDB.searchMovie(options) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
//   }
  
//   if (data.total_results > 0) {

//     let movie = data.results
//       .map((movie) => { 

//         return {
//           'title': movie.title,
//           'yearReleased': DateTime.fromISO(movie.release_date).year,
//           'score': movie.vote_count
//         }

//       })
//       .reduce((accumulator, movie) => {
//         return Is.null(accumulator) ? movie : (accumulator.score > movie.score ? accumulator : movie)
//       }, null)

//     return movie

//   }
//   else {
//     throw new MovieNotFoundError(title, yearReleased)
//   }

// }

export default Movie
