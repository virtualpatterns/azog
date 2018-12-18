import { DateTime, Duration } from 'luxon'
import Is from '@pwn/is'
import { Log, Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'

import { VideoDurationError } from '../error/video-error'

import Media from './media'

const mediaPrototype = Media.getResourcePrototype()
const videoPrototype = Object.create(mediaPrototype)

videoPrototype.process = async function () {

  let formatInformation = null
  formatInformation = await this.getFormatInformation()

  let durationInMinutes = formatInformation.duration.as('minutes')
  let minimumDurationInMinutes = Configuration.range.videoDurationInMinutes.minimum

  if (durationInMinutes >= minimumDurationInMinutes) {

    let path = null
    path = await mediaPrototype.process.call(this)

    let videoInformation = null
    ;[ videoInformation ] = await this.getVideoInformation()

    Log.debug(`'${Path.basename(path)}' ${videoInformation.codecName} (${videoInformation.codecDescription}) ${videoInformation.codedWidth}x${videoInformation.codedHeight}`)    

    return path

  }
  else {
    throw new VideoDurationError(this.path, durationInMinutes, minimumDurationInMinutes)
  }

}

videoPrototype.getVideoInformation = async function () {
  return (await this.getStreamInformation())
    .filter((stream) => stream.codec_type == 'video')
    .map((stream) => {
      return {
        'codecName': stream.codec_name.toUpperCase(),
        'codecDescription': stream.codec_long_name,
        'width': stream.width,
        'height': stream.height,
        'codedWidth': stream.coded_width,
        'codedHeight': stream.coded_height
      }
    })
}

videoPrototype.getFormatInformation = async function () {

  let format = null
  format = await mediaPrototype.getFormatInformation.call(this)

  return {
    'name': format.format_name,
    'description': format.format_long_name,
    'duration': Duration.fromMillis(Configuration.conversion.secondsToMilliseconds(format.duration))
  }

}

videoPrototype.convert = function () {
  return mediaPrototype.convert.call(this, (converter) => {
    converter
      .outputOptions('-codec copy')
  })
}

videoPrototype.getTitle = function () {
  return Video.getTitle(this.path)
}

videoPrototype.getYearReleased = function () {
  return Video.getYearReleased(this.path)
}

videoPrototype.getDateAired = function () {
  return Video.getDateAired(this.path)
}

videoPrototype.getSeasonNumber = function () {
  return Video.getSeasonNumber(this.path)
}

videoPrototype.getEpisodeNumber = function () {
  return Video.getEpisodeNumber(this.path)
}

videoPrototype.getEpisodeTitle = function () {
  return Video.getEpisodeTitle(this.path)
}

const Video = Object.create(Media)

Video.createResource = function (path, prototype = videoPrototype) {
  return Media.createResource.call(this, path, prototype)
}

Video.getResourcePrototype = function () {
  return videoPrototype
}

Video.isResource = function (video) {
  return videoPrototype.isPrototypeOf(video)
}

Video.isResourceClass = function (path) {
  return Configuration.extension.video.includes(Path.extname(path))
}

Video.getTitle = function (path) {

  let yearReleased = this.getYearReleased(path) || DateTime.local().year
  let dateAired = this.getDateAired(path) || DateTime.local()

  // let pattern = /^(.+?)(?:s\d+e\d+|\d+x\d+|series.\d+|\d+of\d+|part.\d+|\d{4})/i
  let pattern = new RegExp(`^(.+?)(?:${yearReleased}|s\\d+e\\d+|\\d+x\\d+|series.\\d+|\\d+of\\d+|part.\\d+|${dateAired.year}.${dateAired.month.toString().padStart(2, '0')}.${dateAired.day.toString().padStart(2, '0')}|\\d+p)`, 'i')
  let match = null

  let title = null

  if (Is.not.null(match = pattern.exec(Path.basename(path)))) {
    [ , title ] = match
  }

  return Is.not.null(title) ? Video.transform(title) : title

}

Video.getYearReleased = function (path) {

  let pattern = /\d{4}(?!.\d{2}.\d{2})/g
  let match = null

  let yearReleased = null

  while (Is.not.null(match = pattern.exec(Path.basename(path)))) {

    let [ yearReleasedAsString ] = match
    let yearReleasedAsNumber = parseInt(yearReleasedAsString)

    if (yearReleasedAsNumber >= Configuration.range.yearReleased.minimum && yearReleasedAsNumber <= Configuration.range.yearReleased.maximum) {
      yearReleased = yearReleasedAsNumber
      break
    }

  }

  return yearReleased

}

Video.getDateAired = function (path) {

  let pattern = /(\d{4})(.)(\d{2})\2(\d{2})/
  let match = null

  let dateAired = null

  if (Is.not.null(match = pattern.exec(Path.basename(path)))) {

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

Video.getSeasonNumber = function (path) {

  let pattern = /s(\d+)e\d+|(\d+)x\d+|series.(\d+)/i
  let match = null

  let seasonNumber = null

  if (Is.not.null(match = pattern.exec(Path.basename(path)))) {

    let [ , ...seasonsAsString ] = match
    seasonNumber = seasonsAsString
      .map((value) => Is.undefined(value) ? 0 : parseInt(value))
      .reduce((accumulator, value) => Math.max(accumulator, value), 0)

  }

  return seasonNumber

}

Video.getEpisodeNumber = function (path) {

  let pattern = /s\d+e(\d+)|\d+x(\d+)|(\d+)of\d+|part.(\d+)/i
  let match = null

  let episodeNumber = null

  if (Is.not.null(match = pattern.exec(Path.basename(path)))) {

    let [ , ...episodesAsString ] = match
    episodeNumber = episodesAsString
      .map((value) => Is.undefined(value) ? 0 : parseInt(value))
      .reduce((accumulator, value) => Math.max(accumulator, value), 0)

  }

  return episodeNumber

}

Video.getEpisodeTitle = function (path) {

  let yearReleased = this.getYearReleased(path) || DateTime.local().year
  let dateAired = this.getDateAired(path) || DateTime.local()

  // let pattern = /(?:s\d+e\d+|\d+x\d+|series.\d+|\d+of\d+|part.\d+|\d{4})(.*?)$/i
  let pattern = new RegExp(`(?:${yearReleased}|s\\d+e\\d+|\\d+x\\d+|series.\\d+|\\d+of\\d+|part.\\d+|${dateAired.year}.${dateAired.month.toString().padStart(2, '0')}.${dateAired.day.toString().padStart(2, '0')})(.*?)$`, 'i')
  let match = null

  let extension = Path.extname(path)
  let name = Path.basename(path, extension)

  let episodeTitle = null

  if (Is.not.null(match = pattern.exec(name))) {

    [ , episodeTitle ] = match
    episodeTitle = Is.emptyString(episodeTitle) ? null : episodeTitle
    
  }

  return Is.not.null(episodeTitle) ? Video.transform(episodeTitle) : episodeTitle

}

export default Video
