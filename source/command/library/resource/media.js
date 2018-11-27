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

mediaPrototype.convert = function (fn) {

  return new Promise(async (resolve, reject) => {

    try {

      let fromPath = this.path
      let toPath = await this.getToPath()

      Log.debug(`Creating '${Path.relative(Command.path.processed, toPath)}' ...`)

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
      let command = null
  
      converter
        .on('start', (_command) => {
  
          Log.trace(`Media.convert(fromPath, '${Path.basename(toPath)}', fn) ...`)
          Log.trace(_command)
  
          start = Process.hrtime()
          command = _command
  
        })
        .on('error', (error, stdout, stderr) => {
  
          Log.error(`Media.convert(fromPath, '${Path.basename(toPath)}', fn)`)
          Log.error(command)
          Log.error(`\n\n${stderr}`)
  
          try {
            FileSystem.unlinkSync(toPath)
          }
          catch (error) {
            // Do nothing
          }
  
          reject(new MediaConversionError(fromPath))
  
        })
        .on('end', () => {
  
          let [ seconds, nanoSeconds ] = Process.hrtime(start)
          Log.trace(`Media.convert(fromPath, '${Path.basename(toPath)}', fn) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
          resolve(this.path = toPath)
  
        })
        .run()

    }
    catch (error) {
      reject(error)
    }

  })

}

mediaPrototype.probe = function () {

  return new Promise((resolve, reject) => {

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfprobePath(Command.path.ffprobe)
      .input(this.path)
      .ffprobe((error, data) => {

        if (error) {

          Log.error(`Media.probe('${Path.basename(this.path)}')`)
          Log.error(`\n\n${error}`)

          reject(new MediaProbeError(this.path))

        }
        else {

          Log.trace({ data }, `Media.probe('${Path.basename(this.path)}')`)

          resolve(data)

        }

      })

  })

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

export default Media
