import FFMPEG from 'fluent-ffmpeg'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'

import ConvertError from './error/convert-error'
import ProbeError from './error/probe-error'

const EXTENSION_MOVIE = '.mp4'
const EXTENSION_MUSIC = '.mp3'

const Convert = Object.create({})

Convert.convertFile = async function (path) {

  let inputPath = path
  let inputExtension = Path.extname(inputPath).toLowerCase()

  let outputPath = Path.join(Configuration.command.path.processing, Path.basename(inputPath, inputExtension))
  let outputExtension = null

  if (Configuration.command.extension.music.includes(inputExtension)) {
    outputExtension = EXTENSION_MUSIC
  }
  else if (Configuration.command.extension.video.includes(inputExtension)) {
    outputExtension = EXTENSION_MOVIE
  }

  outputPath = `${outputPath}${outputExtension}`

  await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })

  return new Promise((resolve, reject) => {

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfmpegPath(Configuration.command.path.ffmpeg)
      .input(inputPath)
      .output(outputPath)

    if (Configuration.command.extension.video.includes(outputExtension)) {

      ffmpeg.outputOptions('-codec copy')

      // ffmpeg
      //   .videoCodec('h264')
      //   .audioCodec('aac')

    }

    ffmpeg
      .on('start', (command) => {
        Log.debug(`FFMPEG.on('start', (command) => { ... }) <-- '${Path.basename(inputPath)}'`)
        Log.debug(command)
      })
      .on('error', (error, stdout, stderr) => {

        Log.error(`FFMPEG.on('error', (error, stdout, stderr) => { ... }) <-- '${Path.basename(inputPath)}'`)
        Log.error(`\n\n${stderr}`)
        
        try {
          FileSystem.unlinkSync(outputPath)
        }
        catch (error) {
          // Do nothing
        }

        reject(new ConvertError(`Failed to convert the file '${Path.trim(inputPath)}'.`))

      })
      .on('end', () => {
        Log.debug(`FFMPEG.on('end', () => { ... }) --> '${Path.basename(outputPath)}'`)
        resolve(outputPath)
      })
      .run()

  })

}

Convert.probeFile = function (path) { // , context) {
  Log.debug(`Convert.probeFile('${Path.basename(path)}')`)

  return new Promise((resolve, reject) => {

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfprobePath(Configuration.command.path.ffprobe)
      .input(path)
      .ffprobe((error, data) => {

        if (error) {

          Log.error(`FFMPEG.ffprobe((error, data) => { ... }) <-- '${Path.basename(path)}'`)
          Log.error(error)
  
          reject(new ProbeError(`Failed to probe the file '${Path.trim(path)}'.`))

        }
      
        resolve(data)

      })
      
  })

}

export default Convert
