import { DateTime } from 'luxon'
import { Path } from '@virtualpatterns/mablung'
import Is from '@pwn/is'
import Sanitize from 'sanitize-filename'

import { Command as Configuration} from '../../configuration'
import MovieDB from './movie-db'
import TvDB from './tv-db'

import MatchError from './error/match-error'

const NOW_YEAR = DateTime.local().year

const Match = Object.create({})

Match.getMatchedPath = async function (path) {

  let [ parentPath, name, extension ] = Match.fromPath(path)

  let title = Match.getTitle(name)
  let yearReleased = Match.getYearReleased(name)
  let seasonNumber = Match.getSeasonNumber(name)
  let episodeNumber = Match.getEpisodeNumber(name)
  let dateAired = Match.getDateAired(name)

  if (Is.not.null(title) &&
      Is.null(seasonNumber) &&
      Is.null(episodeNumber) &&
      Is.null(dateAired)) {

    let movie = await MovieDB.getMovie(title, yearReleased)

    parentPath = Path.join(Configuration.path.processed, 'Movies')
    name = `${Sanitize(movie.title)} (${movie.yearReleased})`

  }
  else if ( Is.not.null(title) &&
            ( Is.not.null(episodeNumber) ||
              Is.not.null(dateAired))) {

    seasonNumber = Is.not.null(seasonNumber) ? seasonNumber : (Is.not.null(episodeNumber) ? 1 : null)

    let tvShow = await TvDB.getTVShow(title, yearReleased, seasonNumber, episodeNumber, dateAired)

    parentPath = Path.join(Configuration.path.processed, 'TV Shows', Sanitize(tvShow.title), `Season ${tvShow.seasonNumber.toString()}`)
    name = `${Sanitize(tvShow.title)} - ${tvShow.seasonNumber.toString()}x${tvShow.episodeNumber.toString().padStart(2, '0')} - ${Sanitize(tvShow.episodeTitle)}`

  }
  else {
    throw new MatchError(`Failed to find a match for the path '${path}'.`)
  }

  return Match.toPath([ parentPath, name, extension ])

}

Match.fromPath = function (path) {

  let parentPath = Path.dirname(path)
  let extension = Path.extname(path)
  let name = Path.basename(path, extension)

  return [ parentPath, name, extension ]

}

Match.toPath = function ([ parentPath, name, extension ]) {
  return Path.join(parentPath, `${name}${extension}`)
}

Match.getYearReleased = function (name) {

  let pattern = /\d{4}(?!.\d{2}.\d{2})/
  let match = null

  let yearReleased = null

  if (Is.not.null(match = pattern.exec(name))) {

    let [ yearReleasedAsString ] = match
    let yearReleasedAsNumber = parseInt(yearReleasedAsString)

    if (yearReleasedAsNumber >= 1888 && yearReleasedAsNumber <= NOW_YEAR + 1) {
      yearReleased = yearReleasedAsNumber
    }

  }

  return yearReleased

}

Match.getDateAired = function (name) {

  let pattern = /(\d{4})(.)(\d{2})\2(\d{2})/
  let match = null

  let dateAired = null

  if (Is.not.null(match = pattern.exec(name))) {

    let [ , yearAsString,, monthAsString, dayAsString ] = match

    let yearAsNumber = parseInt(yearAsString)
    let monthAsNumber = parseInt(monthAsString)
    let dayAsNumber = parseInt(dayAsString)

    dateAired = DateTime.fromObject({ 
      'year': yearAsNumber, 
      'month': monthAsNumber, 
      'day': dayAsNumber 
    })

  }

  return dateAired

}

Match.getSeasonNumber = function (name) {

  let pattern = /s(\d+)e\d+|(\d+)x\d+|series.(\d+)/i
  let match = null

  let seasonNumber = null

  if (Is.not.null(match = pattern.exec(name))) {

    let [ , ...seasonsAsString ] = match
    seasonNumber = seasonsAsString
      .map((value) => Is.undefined(value) ? 0 : parseInt(value))
      .reduce((accumulator, value) => Math.max(accumulator, value), 0)

  }

  return seasonNumber

}

Match.getEpisodeNumber = function (name) {

  let pattern = /s\d+e(\d+)|\d+x(\d+)|(\d+)of\d+|part.(\d+)/i
  let match = null

  let episodeNumber = null

  if (Is.not.null(match = pattern.exec(name))) {

    let [ , ...episodesAsString ] = match
    episodeNumber = episodesAsString
      .map((value) => Is.undefined(value) ? 0 : parseInt(value))
      .reduce((accumulator, value) => Math.max(accumulator, value), 0)

  }

  return episodeNumber

}

Match.getTitle = function (name) {

  let pattern = /^(.+?)(?:s\d+e\d+|\d+x\d+|series.\d+|\d+of\d+|part.\d+|\d{4})/i
  let match = null

  let title = null

  if (Is.not.null(match = pattern.exec(name))) {
    [ , title ] = match
  }

  return Match.transform(title)

}

Match.transform = function (name) {

  let inputName = name
  let outputName = inputName

  do {

    for (let replace of Configuration.transform.replace) {
      outputName = outputName.replace(replace.pattern, replace.with)
    }

    for (let pattern of Configuration.transform.remove) {
      outputName = outputName.replace(pattern, '')
    }
  
  } while ([
    Configuration.transform.replace.reduce((accumulator, replace) => accumulator || replace.pattern.test(outputName), false),
    Configuration.transform.remove.reduce((accumulator, pattern) => accumulator || pattern.test(outputName), false)
  ].reduce((accumulator, test) => accumulator || test, false))

  return outputName

}

export default Match
