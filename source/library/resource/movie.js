import { DateTime } from 'luxon'
import Is from '@pwn/is'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import MovieDB from 'moviedb'
import Score from 'string-similarity'
import Utilities from 'util'

import Configuration from '../../configuration'

import { MovieNotFoundError } from '../error/movie-error'

import Video from './video'

const videoPrototype = Video.getResourcePrototype()
const moviePrototype = Object.create(videoPrototype)

moviePrototype.getToPath = async function () {

  try {

    let movie = await this.getMovie()
  
    return Path.join(
      Configuration.path.processed.movie, 
      `${Movie.sanitize(movie.title)} (${movie.yearReleased}).mp4`
    )
  
  }
  catch (error) {
      
    delete error.name

    Log.error('catch (error) { ... }')
    Log.error(error)
  
    let extension = Path.extname(this.path)
    let name = Path.basename(this.path, extension)
  
    return Path.join(Configuration.path.processed.movie, `${name}.mp4`)
    
  }

}

moviePrototype.getMovie = function () {

  let title = this.getTitle()
  let yearReleased = this.getYearReleased()

  return Movie.getMovie(title, yearReleased)

}

moviePrototype.track = function (fromName, toName) {

  let title = this.getTitle()
  let yearReleased = this.getYearReleased()

  return this.connection.insertMovie(fromName, toName, title, yearReleased)

}

const Movie = Object.create(Video)

Movie.createResource = function (path, connection, prototype = moviePrototype) {

  if (Is.undefined(Movie.MovieDB)) {

    Movie.MovieDB = MovieDB(Configuration.key.movieDB)
    Movie.MovieDB.searchMovie = Utilities.promisify(Movie.MovieDB.searchMovie)

  }

  return Video.createResource.call(this, path, connection, prototype)

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

Movie.getMovie = async function (title, yearReleased) {

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

    Log.trace('MovieDB.searchMovie(options) ...')
    let start = Process.hrtime()
  
    try {
      data = await this.MovieDB.searchMovie(_options)
    }
    finally {
      Log.trace({ _options, data }, `MovieDB.searchMovie(options) ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.shortDuration)}`)
    }
      
    if (data.total_results > 0) {
      break
    }

  }

  if (data.total_results > 0) {

    let movie = data.results
      .map((_movie) => { 
        
        let _title = _movie.title
        let _yearReleased = DateTime.fromISO(_movie.release_date).year

        let score = null

        if (Is.not.null(yearReleased)) {
          score = Score.compareTwoStrings(`${_title} (${_yearReleased})`.toLowerCase(), `${title} (${yearReleased})`.toLowerCase())
        }
        else {
          score = Score.compareTwoStrings(_title.toLowerCase(), title.toLowerCase())
        }

        return {
          'title': _title,
          'yearReleased': _yearReleased,
          'score': score
        }

      })
      .sort((movieA, movieB) => movieA.score < movieB.score ? 1 : (movieA.score > movieB.score ? -1 :0))
      .map((movie) => {
        Log.debug(`Score ${Configuration.conversion.toScore(movie.score)} for movie '${movie.title} (${movie.yearReleased})'` )
        return movie
      })
      .shift()

    delete movie.score
    return movie

  }
  else {
    throw new MovieNotFoundError(title, yearReleased)
  }

}

export default Movie
