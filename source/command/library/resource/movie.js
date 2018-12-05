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

  let options = []

  if (Is.not.null(yearReleased)) {
    options.push({
      'query': title,
      'year': yearReleased,
      'include_adult': true
    })
  }

  options.push({
    'query': title,
    'include_adult': true
  })

  let data = null

  for (let _options of options) {

    Log.trace('Movie.searchMovie(options) ...')
    let start = Process.hrtime()
  
    try {
      data = await Movie.searchMovie(_options)
    }
    finally {
      Log.trace({ _options, data }, `Movie.searchMovie(options) ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.shortDuration)}`)
    }
      
    if (data.total_results > 0) {
      break
    }

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

    delete movie.score
    return movie

  }
  else {
    throw new MovieNotFoundError(title, yearReleased)
  }

}

const Movie = Object.create(Video)

Movie.createResource = function (path, prototype = moviePrototype) {

  if (Is.undefined(Movie.searchMovie)) {
    Movie.searchMovie = Utilities.promisify(MovieDB(Command.key.movieDB).searchMovie)
  }

  return Video.createResource.call(this, path, prototype)

}

Movie.getResourcePrototype = function () {
  return moviePrototype
}

Movie.isResource = function (movie) {
  return moviePrototype.isPrototypeOf(movie)
}

Movie.isResourceClass = function (path) {

  if (Video.isResourceClass(path)) {

    let title = Video.getTitle(path)
    let seasonNumber = Video.getSeasonNumber(path)
    let episodeNumber = Video.getEpisodeNumber(path)
    let dateAired = Video.getDateAired(path)
  
    if (Is.not.null(title) &&
        Is.null(seasonNumber) &&
        Is.null(episodeNumber) &&
        Is.null(dateAired)) {
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

export default Movie
