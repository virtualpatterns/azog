import Conversion from 'fluent-ffmpeg'
import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'

import Configuration from '../configuration'

const NANOSECONDS_PER_SECOND = 1e9

const BOOK_EXTENSIONS = [ '.epub', '.mobi', '.pdf' ]
const MUSIC_EXTENSIONS = [ '.flac', '.m4a', '.mp3' ]
const OTHER_EXTENSIONS = [ '.rar', '.zip' ]
const VIDEO_EXTENSIONS = [ '.avi', '.m4v', '.mkv', '.mov', '.mp4' ]

const Process = Object.create(_Process)

Process.onTorrent = async function (torrentId, torrentName) {
  Log.debug(`START Process.onTorrent(torrentId, '${torrentName}')`)

  let start = Process.hrtime()

  try {

    await Process.onPath(Path.join(Configuration.cli.downloadedPath, torrentName), {
      'torrentId': torrentId,
      'torrentName': torrentName
    })

  }
  finally {

    let duration = Process.hrtime(start)

    Log.debug(`FINISH Process.onTorrent(torrentId, '${torrentName}') in ${((duration[0] * NANOSECONDS_PER_SECOND + duration[1])/NANOSECONDS_PER_SECOND).toFixed(2)}s`)

  }

}

Process.onPath = async function (path, context) {
  // Log.debug('Process.onPath(path, context) { ... }')

  let pathInformation = await FileSystem.promisedStat(path, { 'bigint': true })

  if (pathInformation.isDirectory()) {
    await Process.onDirectory(path, context)
  }
  else if (pathInformation.isFile()) {
    await Process.onFile(path, context)
  }

}

Process.onDirectory = async function (path, context) {
  // Log.debug('Process.onDirectory(path, context) { ... }')

  let filesInformation = await FileSystem.promisedReadDir(path, {
    'encoding': 'utf-8',
    'withFileTypes': true
  })

  for (let fileInformation of filesInformation) {
    if (fileInformation.isDirectory()) {
      await Process.onDirectory(Path.join(path, fileInformation.name), context)
    }
    else if (fileInformation.isFile()) {
      await Process.onFile(Path.join(path, fileInformation.name), context)
    }
  }

}

Process.onFile = async function (path, context) {
  // Log.debug(`Process.onFile('${path}', context) { ... }`)

  try {

    let extension = Path.extname(path).toLowerCase()

    if (BOOK_EXTENSIONS.includes(extension)) {
      await Process.onBook(path, context)
    }
    else if (MUSIC_EXTENSIONS.includes(extension)) {
      await Process.onMusic(path, context)
    }
    else if (VIDEO_EXTENSIONS.includes(extension)) {
      await Process.onVideo(path, context)
    }
    else if (OTHER_EXTENSIONS.includes(extension)) {
      await Process.onOther(path, context)
    }

  }
  catch (error) {

    Log.error(`Process.onFile('${path}', context) { ... }`)
    Log.error(error)

    let targetPath = Path.join(Configuration.cli.failedPath, Path.basename(path))
  
    Log.debug(`FileSystem.promisedCopy(path, '${targetPath}', { 'stopOnErr' : true })`)
    await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })
    
  }

}

Process.onBook = async function (path) { // , context) {
  // Log.debug(context, `Process.onBook('${path}', context) { ... }`)
  Log.debug(`Process.onBook('${path}') { ... }`)

  let targetPath = Path.join(Configuration.cli.processedPath, 'Books')

  // Log.debug(`FileSystem.promisedMakeDir('${targetPath}', { 'recursive': true })`)
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  targetPath = Path.join(targetPath, Path.basename(path))

  Log.debug(`FileSystem.promisedCopy(path, ${targetPath}, { 'stopOnErr' : true })`)
  await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

Process.onMusic = async function (path) { // , context) {
  // Log.debug(context, `Process.onMusic('${path}', context) { ... }`)
  Log.debug(`Process.onMusic('${path}') { ... }`)

  path = await Process.convert(path)

  let tags = await ID3.parseFile(path)

  Log.debug(tags, 'ID3.parseFile(path)')

  let targetPath = Path.join(Configuration.cli.processedPath, 'Music', tags.common.albumartist || tags.common.artist || 'Unknown Artist', tags.common.album || 'Unknown Album')
  let name = `${tags.common.track.no && tags.common.track.no.toString().padStart(2, '0') || '00'} ${tags.common.title || 'Unknown Title'}${Path.extname(path)}`

  // Log.debug(`FileSystem.promisedMakeDir('${targetPath}', { 'recursive': true })`)
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  targetPath = Path.join(targetPath, name)

  Log.debug(`FileSystem.promisedRename('${path}', '${targetPath}')`)
  await FileSystem.promisedRename(path, targetPath)

  // Log.debug(`FileSystem.promisedCopy(path, '${targetPath}', { 'stopOnErr' : true })`)
  // await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

Process.onVideo = async function (path) { // , context) {
  // Log.debug(context, `Process.onVideo('${path}', context) { ... }`)
  Log.debug(`Process.onVideo('${path}') { ... }`)

  await Process.convert(path)

  // Log.debug(`FileSystem.promisedCopy(path, '${Path.join(Configuration.cli.processingPath, Path.basename(path))}', { 'stopOnErr' : true })`)
  // await FileSystem.promisedCopy(path, Path.join(Configuration.cli.processingPath, Path.basename(path)), { 'stopOnErr' : true })

}

Process.onOther = async function (path) { // , context) {
  // Log.debug(context, `Process.onOther('${path}', context) { ... }`)
  Log.debug(`Process.onOther('${path}') { ... }`)

  Log.debug(`FileSystem.promisedCopy(path, '${Path.join(Configuration.cli.processingPath, Path.basename(path))}', { 'stopOnErr' : true })`)
  await FileSystem.promisedCopy(path, Path.join(Configuration.cli.processingPath, Path.basename(path)), { 'stopOnErr' : true })

}

Process.convert = function (path) {
  // Log.debug(`Process.convert('${path}') { ... }`)

  return new Promise((resolve, reject) => {

    let inputPath = path
    let inputExtension = Path.extname(inputPath).toLowerCase()

    let outputPath = Path.join(Configuration.cli.processingPath, Path.basename(inputPath, inputExtension))
    let outputExtension = null

    if (MUSIC_EXTENSIONS.includes(inputExtension)) {
      outputExtension = '.mp3'
    }
    else if (VIDEO_EXTENSIONS.includes(inputExtension)) {
      outputExtension = '.mp4'
    }

    outputPath = `${outputPath}${outputExtension}`

    let convert = new Conversion({ 'stdoutLines': 0 })
    let percent = 0.00

    convert
      .input(inputPath)
      .output(outputPath)

    if (VIDEO_EXTENSIONS.includes(outputExtension)) {
      convert.outputOptions('-codec copy')
    }

    convert
      .on('start', (command) => {
        Log.debug('Conversion.on(\'start\', (data) => { ... })')
        Log.debug(command)
      })
      .on('codecData', (data) => {
        Log.debug({ 'data': data }, 'Conversion.on(\'codecData\', (data) => { ... })')
      })
      .on('progress', (progress) => {

        if (percent == 0.00 || progress.percent - percent >= 5.00) {
          Log.debug(`Conversion.on('progress', (progress) => { ... }) ${progress.percent.toFixed(2)}%`)
          percent = progress.percent
        }

      })
      .on('error', (error, stdout, stderr) => {

        Log.error('Conversion.on(\'error\', (error) => { ... })')
        Log.error(`\n\n${stderr}`)
        
        try {
          FileSystem.unlinkSync(outputPath)
        }
        catch (error) {
          Log.error(`FileSystem.unlinkSync('${outputPath}')`)
          Log.error(error)
        }

        delete error.name

        reject(error)

      })
      .on('end', () => {
        resolve(outputPath)
      })
      .run()

  })

}

export default Process