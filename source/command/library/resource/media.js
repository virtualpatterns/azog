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

      let toPath = await this.getToPath()

      FileSystem.mkdirSync(Path.dirname(toPath), { 'recursive': true })

      let converter = new FFMPEG({ 'stdoutLines': 0 })
  
      converter
        .setFfmpegPath(Command.path.ffmpeg)
        .input(this.fromPath)
        .output(toPath)
  
      if (fn) {
        fn(converter)
      }
      
      let start = null
  
      converter
        .on('start', (command) => {
  
          Log.debug(`Media.convert('${Path.basename(this.fromPath)}', '${Path.basename(toPath)}', fn) ...`)
          Log.debug(command)
  
          start = Process.hrtime()
  
        })
        .on('error', (error, stdout, stderr) => {
  
          Log.error(`Media.convert('${Path.basename(this.fromPath)}', '${Path.basename(toPath)}', fn)`)
          Log.error(`\n\n${stderr}`)
  
          try {
            FileSystem.unlinkSync(toPath)
          }
          catch (error) {
            // Do nothing
          }
  
          reject(new MediaConversionError(this.fromPath))
  
        })
        .on('end', () => {
  
          let [ seconds, nanoSeconds ] = Process.hrtime(start)
          Log.debug(`Media.convert('${Path.basename(this.fromPath)}', '${Path.basename(toPath)}', fn) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
          resolve()
  
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
      .input(this.fromPath)
      .ffprobe((error, data) => {

        if (error) {

          Log.error(`Media.probe('${Path.basename(this.fromPath)}')`)
          Log.error(`\n\n${error}`)

          reject(new MediaProbeError(this.fromPath))

        }
        else {

          Log.debug({ data }, `Media.probe('${Path.basename(this.fromPath)}')`)

          resolve(data)

        }

      })

  })

}

const Media = Object.create(Resource)

Media.createResource = function (fromPath, prototype = mediaPrototype) {
  return Resource.createResource.call(this, fromPath, prototype)
}

Media.getResourcePrototype = function () {
  return mediaPrototype
}

Media.isResource = function (media) {
  return mediaPrototype.isPrototypeOf(media)
}

// Media.convert = function (fromPath, toPath, fn) {

//   return new Promise((resolve, reject) => {

//     FileSystem.mkdirSync(Path.dirname(toPath), { 'recursive': true })

//     let converter = new FFMPEG({ 'stdoutLines': 0 })

//     converter
//       .setFfmpegPath(Command.path.ffmpeg)
//       .input(fromPath)
//       .output(toPath)

//     if (fn) {
//       fn(converter)
//     }
    
//     let start = null

//     converter
//       .on('start', (command) => {

//         Log.debug(`Media.convert('${Path.basename(fromPath)}', '${Path.basename(toPath)}', fn) ...`)
//         Log.debug(command)

//         start = Process.hrtime()

//       })
//       .on('error', (error, stdout, stderr) => {

//         Log.error(`Media.convert('${Path.basename(fromPath)}', '${Path.basename(toPath)}', fn)`)
//         Log.error(`\n\n${stderr}`)

//         try {
//           FileSystem.unlinkSync(toPath)
//         }
//         catch (error) {
//           // Do nothing
//         }

//         reject(new MediaConversionError(fromPath))

//       })
//       .on('end', () => {

//         let [ seconds, nanoSeconds ] = Process.hrtime(start)
//         Log.debug(`Media.convert('${Path.basename(fromPath)}', '${Path.basename(toPath)}', fn) ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)

//         resolve()

//       })
//       .run()

//   })

// }

// Media.probe = function (path) {

//   return new Promise((resolve, reject) => {

//     let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

//     ffmpeg
//       .setFfprobePath(Command.path.ffprobe)
//       .input(path)
//       .ffprobe((error, data) => {

//         if (error) {

//           Log.error(`Media.probe('${Path.basename(path)}')`)
//           Log.error(`\n\n${error}`)

//           reject(new MediaProbeError(path))

//         }
//         else {

//           Log.debug({ data }, `Media.probe('${Path.basename(path)}')`)

//           resolve(data)

//         }

//       })

//   })

// }

export default Media
