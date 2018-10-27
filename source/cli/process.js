import Conversion from 'fluent-ffmpeg'
import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'
import Queue from 'promise-queue'

import Configuration from '../configuration'

import ConversionError from './errors/conversion-error'

const Process = Object.create(_Process)

Process.queue = new Queue(Configuration.cli.maximumConcurrentFiles, Configuration.cli.maximumQueuedFiles)

Process.onTorrent = async function (torrentId, torrentName) {
  Log.debug(`Process.onTorrent('${torrentId}', '${torrentName}')`)

  await Process.onPath(Path.join(Configuration.cli.downloadedPath, torrentName), {
    'torrentId': torrentId,
    'torrentName': torrentName
  })

}

Process.onPath = async function (path, context) {

  let pathInformation = await FileSystem.promisedStat(path, { 'bigint': true })

  if (pathInformation.isDirectory()) {
    await Process.onDirectory(path, context)
  }
  else if (pathInformation.isFile()) {
    Process.queue.add(Process.onFile.bind(Process, path, context))
  }

}

Process.onDirectory = async function (path, context) {

  let filesInformation = await FileSystem.promisedReadDir(path, {
    'encoding': 'utf-8',
    'withFileTypes': true
  })

  for (let fileInformation of filesInformation) {
    if (fileInformation.isDirectory()) {
      await Process.onDirectory(Path.join(path, fileInformation.name), context)
    }
    else if (fileInformation.isFile()) {
      Process.queue.add(Process.onFile.bind(Process, Path.join(path, fileInformation.name), context))
    }
  }

}

Process.onFile = async function (path, context) {
 
  try {

    let extension = Path.extname(path).toLowerCase()

    if (Configuration.cli.bookExtensions.includes(extension)) {
      await Process.onBook(path, context)
    }
    else if (Configuration.cli.musicExtensions.includes(extension)) {
      await Process.onMusic(path, context)
    }
    else if (Configuration.cli.videoExtensions.includes(extension)) {
      await Process.onVideo(path, context)
    }
    else if (Configuration.cli.otherExtensions.includes(extension)) {
      await Process.onOther(path, context)
    }

  }
  catch (error) {

    Log.error(`Process.onFile('${Path.basename(path)}', context) { ... }`)
    Log.error(error)

    let targetPath = Path.join(Configuration.cli.failedPath, Path.basename(path))
  
    await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })
    
  }

}

Process.onBook = async function (path) { // , context) {

  let targetPath = Path.join(Configuration.cli.processedPath, 'Books')
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  targetPath = Path.join(targetPath, Path.basename(path))

  Log.debug(`FileSystem.promisedCopy(path, '${targetPath}', { 'stopOnErr' : true })`)
  await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

Process.onMusic = async function (path) { // , context) {

  path = await Process.convert(path)

  let tags = await ID3.parseFile(path)

  Log.debug(tags, `ID3.parseFile('${Path.basename(path)}')`)

  let targetPath = Path.join(Configuration.cli.processedPath, 'Music', tags.common.albumartist || tags.common.artist || 'Unknown Artist', tags.common.album || 'Unknown Album')
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  let name = `${tags.common.track.no && tags.common.track.no.toString().padStart(2, '0') || '00'} ${tags.common.title || 'Unknown Title'}${Path.extname(path)}`
  targetPath = Path.join(targetPath, name)
  await FileSystem.promisedRename(path, targetPath)

}

Process.onVideo = async function (path) { // , context) {
  await Process.convert(path)
}

Process.onOther = async function (path) { // , context) {
  Log.debug(`FileSystem.promisedCopy(path, '${Path.join(Configuration.cli.processingPath, Path.basename(path))}', { 'stopOnErr' : true })`)
  await FileSystem.promisedCopy(path, Path.join(Configuration.cli.processingPath, Path.basename(path)), { 'stopOnErr' : true })
}

Process.convert = function (path) {

  return new Promise((resolve, reject) => {

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

    let convert = new Conversion({ 'stdoutLines': 0 })

    convert
      .setFfmpegPath(Configuration.cli.ffmpegPath)
      .input(inputPath)
      .output(outputPath)

    if (Configuration.cli.videoExtensions.includes(outputExtension)) {
      convert.outputOptions('-codec copy')
    }

    convert
      .on('start', (command) => {
        Log.debug(`Conversion.on('start', (command) => { ... }) <-- '${Path.basename(inputPath)}'`)
        Log.debug(command)
      })
      // .on('codecData', (data) => {
      //   Log.debug({ 'data': data }, 'Conversion.on(\'codecData\', (data) => { ... })')
      // })
      .on('error', (error, stdout, stderr) => {

        Log.error(`Conversion.on('error', (error, stdout, stderr) => { ... }) <-- '${Path.basename(inputPath)}'`)
        Log.error(`\n\n${stderr}`)
        
        try {
          FileSystem.unlinkSync(outputPath)
        }
        catch (error) {
          // Log.error(`FileSystem.unlinkSync('${outputPath}')`)
          // Log.error(error)
        }

        reject(new ConversionError(`The path '${Path.trim(inputPath)}' failed to convert.`))

      })
      .on('end', () => {
        Log.debug(`Conversion.on('end', () => { ... }) --> '${Path.basename(outputPath)}'`)
        resolve(outputPath)
      })
      .run()

  })

}

export default Process
