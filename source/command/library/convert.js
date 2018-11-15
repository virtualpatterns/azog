import FFMPEG from 'fluent-ffmpeg'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'
import Match from './match'
import Process from './process'

import ConvertError from './error/convert-error'

const EXTENSION_MUSIC = '.mp3'
const EXTENSION_VIDEO = '.mp4'

const Convert = Object.create({})

Convert.convertMusic = async function (path) {
  Log.trace(`START Convert.convertMusic('${Path.basename(path)}')`)

  let start = Process.hrtime()

  try {

    let inputPath = path
    let outputPath = null
  
    let { parentPath, extension, name } = Match.fromPath(inputPath)
  
    parentPath = Configuration.command.path.processing
    extension = EXTENSION_MUSIC
  
    outputPath = Match.toPath({ parentPath, extension, name })
  
    await Convert.probeFile(inputPath)
    await Convert.convertFile(inputPath, outputPath)
      
    return outputPath
  
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace(`STOP Convert.convertMusic('${Path.basename(path)}') ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

}

Convert.convertVideo = async function (path) {
  Log.trace(`START Convert.convertVideo('${Path.basename(path)}')`)

  let start = Process.hrtime()

  try {

    let inputPath = path
    let outputPath = null

    let { parentPath, extension, name } = Match.fromPath(inputPath)

    parentPath = Configuration.command.path.processing
    extension = EXTENSION_VIDEO

    outputPath = Match.toPath({ parentPath, extension, name })

    await Convert.probeFile(inputPath)
    await Convert.convertFile(inputPath, outputPath, (ffmpeg) => {
      ffmpeg
        .outputOptions('-codec copy')
        // .videoCodec('h264')
        // .audioCodec('aac')
    })
      
    return outputPath
  
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace(`STOP Convert.convertVideo('${Path.basename(path)}') ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

}

Convert.convertFile = function (inputPath, outputPath, outputFn) {

  return new Promise((resolve, reject) => {

    FileSystem.mkdirSync(Path.dirname(outputPath), { 'recursive': true })

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfmpegPath(Configuration.command.path.ffmpeg)
      .input(inputPath)
      .output(outputPath)

    if (outputFn) {
      outputFn(ffmpeg)
    }
    
    ffmpeg
      .on('start', (command) => {
        Log.trace('FFMPEG.on(\'start\', (command) => { ... })')
        Log.trace(command)
      })
      .on('error', (error, stdout, stderr) => {

        Log.error('FFMPEG.on(\'error\', (error, stdout, stderr) => { ... })')
        Log.error(`\n\n${stderr}`)

        reject(new ConvertError(`Failed to convert the file '${Path.basename(inputPath)}'.`))

      })
      .on('end', () => {
        Log.trace('FFMPEG.on(\'end\', () => { ... })')
        resolve()
      })
      .run()

  })

}

Convert.probeFile = function (path) {

  return new Promise((resolve, reject) => {

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfprobePath(Configuration.command.path.ffprobe)
      .input(path)
      .ffprobe(function(error, data) {

        if (error) {

          Log.error({ path, data }, 'FFMPEG.ffprobe(error, data) => { ... })')
          Log.error(`\n\n${error}`)

          reject(new ConvertError(`Failed to probe the file '${Path.basename(path)}'.`))

        }
        else {
          Log.trace({ path, data }, 'FFMPEG.ffprobe(error, data) => { ... })')
          resolve()
        }

        resolve()

      })

  })

}

export default Convert
