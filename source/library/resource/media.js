import FFMPEG from 'fluent-ffmpeg'
import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'

import { MediaConversionError, MediaProbeError } from '../error/media-error'

import Resource from '../resource'

const resourcePrototype = Resource.getResourcePrototype()
const mediaPrototype = Object.create(resourcePrototype)

mediaPrototype.process = async function () {
  return this.convertTo(await this.getToPath())
}

mediaPrototype.convertTo = async function (path, fn) {

  let fromPath = this.path
  let fromExtension = Path.extname(fromPath)
  let fromName = Path.basename(fromPath, fromExtension)

  let intermediatePath = Path.join(Configuration.path.processing, Path.basename(fromPath))

  Log.debug(`Converting to '${Path.basename(intermediatePath)}' ...`)

  await Media.convertTo(fromPath, intermediatePath, fn)

  let toPath = path
  let toExtension = Path.extname(toPath)
  let toName = Path.basename(toPath, toExtension)
  
  Log.debug(`Moving to '${Path.basename(toPath)}' ...`)

  Log.trace(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
  await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })

  Log.trace(`FileSystem.move(intermediatePath, '${Path.basename(toPath)}', { 'overwrite': true })`)
  await FileSystem.move(intermediatePath, toPath, { 'overwrite': true })

  await this.track(fromName, toName)

  return this.path = toPath

}

mediaPrototype.getStreamInformation = function () {
  return Media.getStreamInformation(this.path)
}

mediaPrototype.getFormatInformation = function () {
  return Media.getFormatInformation(this.path)
}

mediaPrototype.probe = function () {
  return Media.probe(this.path)
}

const Media = Object.create(Resource)

Media.createResource = function (path, connection, prototype = mediaPrototype) {
  return Resource.createResource.call(this, path, connection, prototype)
}

Media.getResourcePrototype = function () {
  return mediaPrototype
}

Media.isResource = function (media) {
  return mediaPrototype.isPrototypeOf(media)
}

Media.convertTo = function (fromPath, toPath, fn) {

  return new Promise(async (resolve, reject) => {

    try {

      Log.trace(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
      await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })
  
      let converter = new FFMPEG({ 'stdoutLines': 0 })
  
      converter
        .setFfmpegPath(Configuration.path.ffmpeg)
        .input(fromPath)
        .output(toPath)
  
      if (fn) {
        fn(converter)
      }
      
      let start = null
      let progress = null
  
      converter
        .on('start', (command) => {
  
          Log.trace(`FFMPEG.on('start', (command) => { ... }) toPath='${Path.basename(toPath)}'`)
          Log.trace(command)

          start = Process.hrtime()
          progress = Process.hrtime()
  
        })
        .on('progress', (_progress) => {

          let progressInSeconds = Configuration.conversion.toSeconds(Process.hrtime(progress))
          let minimumProgressInSeconds = Configuration.range.progressInSeconds.minimum

          if (progressInSeconds >= minimumProgressInSeconds) {
            Log.debug(`'${Path.basename(toPath)}' ${Configuration.conversion.toPercent(_progress)}% ...`)
            progress = Process.hrtime()
          }

        })
        .on('error', (error, stdout, stderr) => {
  
          Log.trace(`FFMPEG.on('error', (error, stdout, stderr) => { ... }) toPath='${Path.basename(toPath)}'`)
          Log.trace(`\n\n${stderr}`)
  
          reject(new MediaConversionError(fromPath))
  
        })
        .on('end', () => {
        
          Log.trace(`FFMPEG.on('end', () => { ... }) toPath='${Path.basename(toPath)}' ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.longDuration)}`)
  
          resolve(toPath)
  
        })
        .run()

    }
    catch (error) {
      reject(error)
    }

  })

}

Media.getStreamInformation = async function (path) {
  return (await this.probe(path)).streams
}

Media.getFormatInformation = async function (path) {
  return (await this.probe(path)).format
}

Media.probe = function (path) {

  return new Promise((resolve, reject) => {

    try {

      let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

      ffmpeg
        .setFfprobePath(Configuration.path.ffprobe)
        .input(path)
        .ffprobe((error, data) => {
  
          if (error) {
  
            Log.trace(`FFMPEG.ffprobe((error, data) => { ... }) path = '${Path.basename(path)}'`)
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
