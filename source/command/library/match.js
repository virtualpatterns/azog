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

Match.getPath = async function (path) {

  let { parentPath, extension, name } = Match.fromPath(path)

  let _name = Match.getName(name)
  let yearReleased = Match.getYearReleased(name)
  let season = Match.getSeason(name)
  let episode = Match.getEpisode(name)
  let dateAired = Match.getDateAired(name)

  if (Is.not.null(_name) &&
      Is.null(season) &&
      Is.null(episode) &&
      Is.null(dateAired)) {

    let movie = await MovieDB.getMovie(_name, yearReleased)

    parentPath = Path.join(Configuration.path.processed, 'Movies')
    name = `${Sanitize(movie.name)} (${movie.yearReleased})`

  }
  else if ( Is.not.null(_name) &&
            ( Is.not.null(episode) ||
              Is.not.null(dateAired))) {

    season = Is.not.null(season) ? season : (Is.not.null(episode) ? 1 : null)

    let tvShow = await TvDB.getTVShow(_name, yearReleased, season, episode, dateAired)

    parentPath = Path.join(Configuration.path.processed, 'TV Shows', Sanitize(tvShow.name), `Season ${tvShow.season.toString()}`)
    name = `${Sanitize(tvShow.name)} - ${tvShow.season.toString()}x${tvShow.episodeNumber.toString().padStart(2, '0')} - ${Sanitize(tvShow.episodeName)}`

  }
  else {
    throw new MatchError(`Failed to find a match for the path '${path}'.`)
  }

  return Match.toPath({ parentPath, extension, name })

}

Match.fromPath = function (path) {

  let parentPath = Path.dirname(path)
  let extension = Path.extname(path)
  let name = Path.basename(path, extension)

  return { parentPath, extension, name }

}

Match.toPath = function ({ parentPath, extension, name }) {
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

Match.getSeason = function (name) {

  let pattern = /s(\d+)e\d+|(\d+)x\d+|series.(\d+)/i
  let match = null

  let season = null

  if (Is.not.null(match = pattern.exec(name))) {

    let [ , ...seasonsAsString ] = match
    let seasonAsNumber = seasonsAsString
      .map((value) => Is.undefined(value) ? 0 : parseInt(value))
      .reduce((accumulator, value) => Math.max(accumulator, value), 0)

    season = seasonAsNumber

  }

  return season

}

Match.getEpisode = function (name) {

  let pattern = /s\d+e(\d+)|\d+x(\d+)|(\d+)of\d+|part.(\d+)/i
  let match = null

  let episode = null

  if (Is.not.null(match = pattern.exec(name))) {

    let [ , ...episodesAsString ] = match
    let episodeAsNumber = episodesAsString
      .map((value) => Is.undefined(value) ? 0 : parseInt(value))
      .reduce((accumulator, value) => Math.max(accumulator, value), 0)

    episode = episodeAsNumber

  }

  return episode

}

Match.getName = function (name) {

  let pattern = /^(.+?)(?:s\d+e\d+|\d+x\d+|series.\d+|\d+of\d+|part.\d+|\d{4})/i
  let match = null

  let _name = null

  if (Is.not.null(match = pattern.exec(name))) {

    [ , _name ] = match
    _name = Match.transform(_name)

  }

  return _name

}

Match.transform = function (name) {

  let inputName = name
  let outputName = inputName

  do {

    Configuration.transform.replace.forEach((replace) => {
      outputName = outputName.replace(replace.pattern, replace.with)
    })
  
    Configuration.transform.remove.forEach((pattern) => {
      outputName = outputName.replace(pattern, '')
    })
  
  } while ([
    Configuration.transform.replace.reduce((accumulator, replace) => accumulator || replace.pattern.test(outputName), false),
    Configuration.transform.remove.reduce((accumulator, pattern) => accumulator || pattern.test(outputName), false)
  ].reduce((accumulator, test) => accumulator || test, false))

  return outputName

}

export default Match
