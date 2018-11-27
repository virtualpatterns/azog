import { DateTime, Duration } from 'luxon'
import Is from '@pwn/is'
import { Path } from '@virtualpatterns/mablung'

import { Command } from '../../../configuration'

import { VideoDurationError } from '../error/video-error'

import Media from './media'

const mediaPrototype = Media.getResourcePrototype()
const videoPrototype = Object.create(mediaPrototype)

videoPrototype.process = async function () {

  let duration = await this.getDuration()
  let durationInMinutes = duration.as('minutes')
  
  let [ minimumDurationInMinutes ] = Command.range.videoDurationInMinutes

  if (durationInMinutes >= minimumDurationInMinutes) {
    return await mediaPrototype.process.call(this)
  }
  else {
    throw new VideoDurationError(this.path, durationInMinutes, minimumDurationInMinutes)
  }

}

videoPrototype.getDuration = async function () {

  let data = await this.probe()
  let format = data.format

  let durationInSeconds = format.duration
  let durationInMilliseconds = Command.conversion.secondsToMilliseconds(durationInSeconds)

  return Duration.fromMillis(durationInMilliseconds)

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

// videoPrototype.getVideoCodecData = async function () {

//   return (await this.getCodecData())
//     .filter((codec) => codec.type == 'video')
//     .map((codec) => {
//       delete codec.type
//       return codec
//     })

// }

// videoPrototype.getAudioCodecData = async function () {

//   return (await this.getCodecData())
//     .filter((codec) => codec.type == 'audio')
//     .map((codec) => {
//       delete codec.type
//       return codec
//     })

// }

// videoPrototype.getCodecData = async function () {

//   return (await this.probe())
//     .streams
//     .map((stream) => {
//       return {
//         'name': stream.codec_name,
//         'description': stream.codec_long_name,
//         'type': stream.codec_type
//       }
//     })

// }

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
  return Command.extension.video.includes(Path.extname(path))
}

Video.getTitle = function (path) {

  let pattern = /^(.+?)(?:s\d+e\d+|\d+x\d+|series.\d+|\d+of\d+|part.\d+|\d{4})/i
  let match = null

  let title = null

  if (Is.not.null(match = pattern.exec(Path.basename(path)))) {
    [ , title ] = match
  }

  return Is.not.null(title) ? Video.transform(title) : title

}

Video.getYearReleased = function (path) {

  let pattern = /\d{4}(?!.\d{2}.\d{2})/
  let match = null

  let yearReleased = null

  if (Is.not.null(match = pattern.exec(Path.basename(path)))) {

    let [ yearReleasedAsString ] = match
    let yearReleasedAsNumber = parseInt(yearReleasedAsString)

    if (yearReleasedAsNumber >= 1888 && yearReleasedAsNumber <= DateTime.local().year + 1) {
      yearReleased = yearReleasedAsNumber
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

export default Video
