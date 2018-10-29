import FFMPEG from 'fluent-ffmpeg'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'

import Configuration from '../../config'

import ConversionError from './errors/conversion-error'
import ProbeError from './errors/probe-error'

const Converter = Object.create({})

Converter.convert = async function (path) {

  let inputPath = path
  let inputExtension = Path.extname(inputPath).toLowerCase()

  let outputPath = Path.join(Configuration.cli.processingPath, Path.basename(inputPath, inputExtension))
  let outputExtension = null

  if (Configuration.cli.musicExtensions.includes(inputExtension)) {
    outputExtension = '.mp3'
  }
  else if (Configuration.cli.videoExtensions.includes(inputExtension)) {
    outputExtension = '.mp4'
  }

  outputPath = `${outputPath}${outputExtension}`

  await FileSystem.promisedMakeDir(Path.dirname(outputPath), { 'recursive': true })

  return new Promise((resolve, reject) => {

    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfmpegPath(Configuration.cli.ffmpegPath)
      .input(inputPath)
      .output(outputPath)

    if (Configuration.cli.videoExtensions.includes(outputExtension)) {

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
      // .on('codecData', (data) => {
      //   Log.debug({ 'data': data }, 'FFMPEG.on(\'codecData\', (data) => { ... })')
      // })
      .on('error', (error, stdout, stderr) => {

        Log.error(`FFMPEG.on('error', (error, stdout, stderr) => { ... }) <-- '${Path.basename(inputPath)}'`)
        Log.error(`\n\n${stderr}`)
        
        try {
          FileSystem.unlinkSync(outputPath)
        }
        catch (error) {
          // Do nothing
        }

        reject(new ConversionError(`Failed to convert the path '${Path.trim(inputPath)}'.`))

      })
      .on('end', () => {
        Log.debug(`FFMPEG.on('end', () => { ... }) --> '${Path.basename(outputPath)}'`)
        resolve(outputPath)
      })
      .run()

  })

}

Converter.rename = async function (path) { // , context) {
  Log.debug(`Converter.rename('${Path.basename(path)}')`)

  return new Promise((resolve, reject) => {

    let parentPath = Path.dirname(path)

    let extension = Path.extname(path).toLowerCase()
    let inputName = Path.basename(path, extension)
    let outputName = inputName
  
    let ffmpeg = new FFMPEG({ 'stdoutLines': 0 })

    ffmpeg
      .setFfprobePath(Configuration.cli.ffprobePath)
      .input(path)
      .ffprobe((error, data) => {

        if (error) {

          Log.error(`FFMPEG.ffprobe((error, data) => { ... }) <-- '${Path.basename(path)}'`)
          Log.error(error)
  
          reject(new ProbeError(`Failed to probe the path '${Path.trim(path)}'.`))

        }

        Log.debug(`FFMPEG.ffprobe((error, data) => { ... }) <-- '${Path.basename(path)}'`)
        Log.debug(data)

        // for (let stream of data.streams) {
        //   outputName = outputName.replace(new RegExp(stream.codec_name, 'gi'), '')
        //   Log.debug(`outputName = '${outputName}'`)
        // }

        // for (let replacePattern of Configuration.cli.replacePatterns) {
        //   outputName = outputName.replace(replacePattern.pattern, replacePattern.replacement)
        //   Log.debug(`outputName = '${outputName}'`)
        // }
      
        resolve(Path.join(parentPath, outputName, extension))

      })
      
  })

}

export default Converter
