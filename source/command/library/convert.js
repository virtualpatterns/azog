import { Duration } from 'luxon'
import FFMPEG from 'fluent-ffmpeg'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'

import { Command as Configuration } from '../../configuration'
import Match from './match'
import Process from './process'

import ConvertError from './error/convert-error'

const EXTENSION_MUSIC = '.mp3'
const EXTENSION_VIDEO = '.mp4'

const Convert = Object.create({})

Convert.convertMusic = async function (path) {

  let [ parentPath, name, extension ] = Match.fromPath(path)

  parentPath = Configuration.path.processing
  extension = EXTENSION_MUSIC

  let outputPath = Match.toPath([ parentPath, name, extension ])

  await Convert.convertAll(path, outputPath)
    
  return outputPath
  
}

Convert.convertVideo = async function (path) {

  let [ parentPath, name, extension ] = Match.fromPath(path)

  parentPath = Configuration.path.processing
  extension = EXTENSION_VIDEO

  let outputPath = Match.toPath([ parentPath, name, extension ])

  await Convert.convertAll(path, outputPath, (ffmpeg) => {
    ffmpeg
      .outputOptions('-codec copy')
      // .videoCodec('h264')
      // .audioCodec('aac')
  })
    
  return outputPath

}

Convert.convertAll = function (inputPath, outputPath, outputFn) {

  return new Promise((resolve, reject) => {

    FileSystem.mkdirSync(Path.dirname(outputPath), { 'recursive': true })

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfmpegPath(Configuration.path.ffmpeg)
      .input(inputPath)
      .output(outputPath)

    if (outputFn) {
      outputFn(ffmpeg)
    }
    
    let start = null

    ffmpeg
      .on('start', (command) => {

        Log.trace('FFMPEG.on(\'start\', (command) => { ... })')
        Log.trace(command)

        start = Process.hrtime()

      })
      .on('error', (error, stdout, stderr) => {

        Log.error('FFMPEG.on(\'error\', (error, stdout, stderr) => { ... })')
        Log.error(`\n\n${stderr}`)

        reject(new ConvertError(`Failed to convert the file '${Path.basename(inputPath)}'.`))

      })
      .on('end', () => {

        let [ seconds, nanoSeconds ] = Process.hrtime(start)
        Log.trace(`FFMPEG.on('end', () => { ... }) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)

        resolve()

      })
      .run()

  })

}

Convert.getDuration = async function (path) {

  let data = await Convert.getData(path)
  let format = data.format

  let durationInSeconds = format.duration
  let durationInMilliseconds = Configuration.conversion.secondsToMilliseconds(durationInSeconds)

  return Duration.fromMillis(durationInMilliseconds)

}

Convert.getData = function (path) {

  return new Promise((resolve, reject) => {

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfprobePath(Configuration.path.ffprobe)
      .input(path)
      .ffprobe(function(error, data) {

        if (error) {

          Log.error({ path, data }, 'FFMPEG.ffprobe(error, data) => { ... })')
          Log.error(`\n\n${error}`)

          reject(new ConvertError(`Failed to probe the file '${Path.basename(path)}'.`))

        }
        else {
          resolve(data)
        }

      })

  })

}

export default Convert
