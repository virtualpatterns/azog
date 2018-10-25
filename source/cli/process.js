import Convert from 'fluent-ffmpeg'
import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'

import Configuration from '../configuration'

const BOOK_EXTENSIONS = [ '.epub', '.mobi', '.pdf' ]
const MUSIC_EXTENSIONS = [ '.flac', '.m4a', '.mp3' ]
const OTHER_EXTENSIONS = [ '.rar', '.zip' ]
const VIDEO_EXTENSIONS = [ '.avi', '.m4v', '.mkv', '.mov', '.mp4' ]

const Process = Object.create(_Process)

Process.onTorrent = async function (torrentId, torrentName) {
  Log.debug(`Process.onTorrent('${torrentId}', '${torrentName}')`)
  await Process.onPath(Path.join(Configuration.cli.downloadedPath, torrentName), {
    'torrentId': torrentId,
    'torrentName': torrentName
  })
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
  // Log.debug('Process.onFile(path, context) { ... }')

  // let fileInformation = await FileSystem.promisedStat(path, { 'bigint': true })

  let extension = Path.extname(path).toLowerCase()
  // let size = fileInformation.size

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

Process.onBook = async function (path) { // , context) {
  // Log.debug(context, `Process.onBook('${path}', context) { ... }`)
  Log.debug(`Process.onBook('${path}') { ... }`)

  let targetPath = Path.join(Configuration.cli.processedPath, 'Books')

  // Log.debug(`FileSystem.promisedMakeDir('${targetPath}', { 'recursive': true })`)
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  targetPath = Path.join(targetPath, Path.basename(path))

  // Log.debug(`FileSystem.promisedCopy)`)
  await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

Process.onMusic = async function (path) { // , context) {
  // Log.debug(context, `Process.onMusic('${path}', context) { ... }`)
  Log.debug(`Process.onMusic('${path}') { ... }`)

  path = await Process.convert(path)

  let tags = await ID3.parseFile(path)

  Log.debug(`tags.common.albumartist='${tags.common.albumartist}'`)
  Log.debug(`tags.common.album='${tags.common.album}'`)
  Log.debug(`tags.common.track.no=${tags.common.track.no}`)
  Log.debug(`tags.common.title='${tags.common.title}'`)

  let targetPath = Path.join(Configuration.cli.processedPath, 'Music', tags.common.albumartist, tags.common.album)
  let name = `${tags.common.title}${Path.extname(path)}`

  // Log.debug(`FileSystem.promisedMakeDir('${targetPath}', { 'recursive': true })`)
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  targetPath = Path.join(targetPath, name)

  // Log.debug(`FileSystem.promisedRename('${path}', '${targetPath}')`)
  await FileSystem.promisedRename(path, targetPath)

}

Process.onVideo = async function (path) { // , context) {
  // Log.debug(context, `Process.onVideo('${path}', context) { ... }`)
  Log.debug(`Process.onVideo('${path}') { ... }`)

  await Process.convert(path)

  // await FileSystem.promisedCopy(path, Path.join(Configuration.cli.processingPath, Path.basename(path)), { 'stopOnErr' : true })

}

Process.onOther = async function (path) { // , context) {
  // Log.debug(context, `Process.onOther('${path}', context) { ... }`)
  Log.debug(`Process.onOther('${path}') { ... }`)
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

    let percent = 0

    Convert()
      .input(inputPath)
      .output(outputPath)
      .on('start', (command) => {
        Log.debug('Convert.on(\'start\', (data) => { ... })')
        Log.debug(command)
      })
      .on('codecData', (data) => Log.debug({ 'data': data }, 'Convert.on(\'codecData\', (data) => { ... })'))
      .on('progress', (progress) => {

        if (progress.percent - percent >= 5 || percent == 0) {
          Log.debug(`Convert.on('progress', (progress) => { ... }) approx. ${progress.percent.toFixed(2)}%`)
          percent = progress.percent
        }

      })
      // .on('stderr', (data) => Log.debug({ 'error': data }, 'Convert.on(\'stderr\', (data) => { ... })'))
      .on('error', (error) => {

        delete error.name

        Log.error('Convert.on(\'error\', (error) => { ... })')
        Log.error(error)

        reject(error)

      })
      .on('end', () => {

        Log.debug('Convert.on(\'end\', () => { ... })')

        resolve(outputPath)

      })
      .run()

  })

}

export default Process
