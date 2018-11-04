import FFMPEG from 'fluent-ffmpeg'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'

import ConvertError from './errors/convert-error'
import ProbeError from './errors/probe-error'

const Convert = Object.create({})

Convert.convertFile = async function (path) {

  let inputPath = path
  let inputExtension = Path.extname(inputPath).toLowerCase()

  let outputPath = Path.join(Configuration.command.paths.processing, Path.basename(inputPath, inputExtension))
  let outputExtension = null

  if (Configuration.command.extensions.music.includes(inputExtension)) {
    outputExtension = '.mp3'
  }
  else if (Configuration.command.extensions.video.includes(inputExtension)) {
    outputExtension = '.mp4'
  }

  outputPath = `${outputPath}${outputExtension}`

  await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })

  return new Promise((resolve, reject) => {

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfmpegPath(Configuration.command.paths.ffmpeg)
      .input(inputPath)
      .output(outputPath)

    if (Configuration.command.extensions.video.includes(outputExtension)) {

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
      .setFfprobePath(Configuration.command.paths.ffprobe)
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
