import FFMPEG from 'fluent-ffmpeg'
import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'

import { Command } from '../../../configuration'

import { MediaConversionError, MediaProbeError } from '../error/media-error'

import Resource from '../resource'

const resourcePrototype = Resource.getResourcePrototype()
const mediaPrototype = Object.create(resourcePrototype)

mediaPrototype.process = function () {
  return this.convert()
}

mediaPrototype.getStreamInformation = async function () {
  return (await this.probe()).streams
}

mediaPrototype.getFormatInformation = async function () {
  return (await this.probe()).format
}

mediaPrototype.convert = async function (fn) {

  let fromPath = this.path
  let toPath = await this.getToPath()

  return Media.convert(fromPath, toPath, fn)

}

mediaPrototype.probe = function () {
  return Media.probe(this.path)
}

const Media = Object.create(Resource)

Media.createResource = function (path, prototype = mediaPrototype) {
  return Resource.createResource.call(this, path, prototype)
}

Media.getResourcePrototype = function () {
  return mediaPrototype
}

Media.isResource = function (media) {
  return mediaPrototype.isPrototypeOf(media)
}

Media.convert = function (fromPath, toPath, fn) {

  return new Promise((resolve, reject) => {

    try {

      Log.debug(`Creating '${Path.basename(toPath)}' ...`)

      Log.trace(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
      FileSystem.mkdirSync(Path.dirname(toPath), { 'recursive': true })
  
      let converter = new FFMPEG({ 'stdoutLines': 0 })
  
      converter
        .setFfmpegPath(Command.path.ffmpeg)
        .input(fromPath)
        .output(toPath)
  
      if (fn) {
        fn(converter)
      }
      
      let start = null
      let progress = 0
  
      converter
        .on('start', (command) => {
  
          Log.trace(`Media.convert(fromPath, '${Path.basename(toPath)}', fn) ...`)
          Log.trace(command)
  
          start = Process.hrtime()
          progress = Process.hrtime()
  
        })
        .on('progress', (_progress) => {

          let progressInSeconds = Command.conversion.toSeconds(Process.hrtime(progress))
          let [ minimumProgressInSeconds ] = Command.range.progressInSeconds

          if (progressInSeconds >= minimumProgressInSeconds) {
            Log.trace(`Media.convert(fromPath, '${Path.basename(toPath)}', fn) ${Command.conversion.toPercent(_progress)}%`)
            progress = Process.hrtime()
          }

        })
        .on('error', (error, stdout, stderr) => {
  
          Log.trace(`Media.convert(fromPath, '${Path.basename(toPath)}', fn)`)
          Log.trace(`\n\n${stderr}`)
  
          try {
            FileSystem.unlinkSync(toPath)
          }
          catch (error) {
            // Do nothing
          }
  
          reject(new MediaConversionError(fromPath))
  
        })
        .on('end', () => {

          Log.trace(`Media.convert(fromPath, '${Path.basename(toPath)}', fn) ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.longDuration)}`)
  
          resolve(this.path = toPath)
  
        })
        .run()

    }
    catch (error) {
      reject(error)
    }

  })

}

Media.probe = function (path) {

  return new Promise((resolve, reject) => {

    try {

      let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

      ffmpeg
        .setFfprobePath(Command.path.ffprobe)
        .input(path)
        .ffprobe((error, data) => {
  
          if (error) {
  
            Log.trace(`Media.probe('${Path.basename(path)}')`)
            Log.trace(`\n\n${error}`)
  
            reject(new MediaProbeError(path))
  
          }
          else {
            resolve(data)
          }
  
        })
  
    }
    catch (error) {
      reject(error)
    }

  })

}

export default Media
