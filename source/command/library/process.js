import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'
import Queue from 'p-queue'
import Sanitize from 'sanitize-filename'

import Configuration from '../../configuration'
import Convert from './convert'
import Match from './match'

const SECONDS_PER_NANOSECOND = 1 / 1000000000

const Process = Object.create(_Process)

Process.queue = new Queue(Configuration.command.options.queue)

Process.processTorrent = async function (torrentId, torrentName) {
  Log.debug(`START Process.processTorrent(torrentId, '${torrentName}')`)

  let start = Process.hrtime()

  await Process.processPath(Path.join(Configuration.command.paths.downloaded, torrentName), {
    'torrentId': torrentId,
    'torrentName': torrentName
  })

  await Process.start()

  let [ seconds, nanoSeconds ] = Process.hrtime(start)

  Log.debug(`STOP Process.processTorrent(torrentId, '${torrentName}') ${(seconds + nanoSeconds * SECONDS_PER_NANOSECOND).toFixed(2)}s`)

}

Process.start = async function () {
  Log.debug(`Process.start() queued=${Process.queue.size}`)

  Process.queue.start()
  await Process.queue.onIdle()

}

Process.processPath = async function (path, context) {

  let pathInformation = await FileSystem.stat(path)

  if (pathInformation.isDirectory()) {
    await Process.processDirectory(path, context)
  }
  else if (pathInformation.isFile()) {
    Process.queue.add(Process.processFile.bind(Process, path, context))
  }

}

Process.processDirectory = async function (path, context) {

  let filesInformation = await FileSystem.readdir(path, {
    'encoding': 'utf-8',
    'withFileTypes': true
  })

  for (let fileInformation of filesInformation) {
    if (fileInformation.isDirectory()) {
      await Process.processDirectory(Path.join(path, fileInformation.name), context)
    }
    else if (fileInformation.isFile()) {
      Process.queue.add(Process.processFile.bind(Process, Path.join(path, fileInformation.name), context))
    }
  }

}

Process.processFile = async function (path, context) {
 
  try {

    let extension = Path.extname(path).toLowerCase()

    if (Configuration.command.extensions.book.includes(extension)) {
      await Process.processBook(path, context)
    }
    else if (Configuration.command.extensions.music.includes(extension)) {
      await Process.processMusic(path, context)
    }
    else if (Configuration.command.extensions.video.includes(extension)) {
      await Process.processVideo(path, context)
    }
    else if (Configuration.command.extensions.other.includes(extension)) {
      await Process.processOther(path, context)
    }

  }
  catch (error) {

    Log.error(`Process.processFile('${Path.basename(path)}', context) { ... }`)
    Log.error(error)

    let targetPath = Path.join(Configuration.command.paths.failed, Path.basename(path))
  
    await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
    await FileSystem.copy(path, targetPath, { 'stopOnErr' : true })
    
  }

}

Process.processBook = async function (path) { // , context) {

  let targetPath = Path.join(Configuration.command.paths.processed, 'Books', Path.basename(path))

  await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.copy(path, targetPath, { 'stopOnErr' : true })

}

Process.processMusic = async function (path) { // , context) {

  let inputPath = path
  let outputPath = await Convert.convertFile(inputPath)
  let outputTags = await ID3.parseFile(outputPath)

  delete outputTags.common.picture
  
  Log.debug(outputTags.common, `ID3.parseFile('${Path.basename(outputPath)}')`)

  let targetPath = Path.join(Configuration.command.paths.processed, 'Music', Sanitize(outputTags.common.albumartist || outputTags.common.artist || 'Unknown Artist'), Sanitize(outputTags.common.album || 'Unknown Album'))
  let targetName = `${outputTags.common.track.no && outputTags.common.track.no.toString().padStart(2, '0') || '00'} ${Sanitize(outputTags.common.title || 'Unknown Title')}${Path.extname(outputPath)}`

  targetPath = Path.join(targetPath, targetName)
 
  await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.rename(outputPath, targetPath)

}

Process.processVideo = async function (path) { // , context) {

  let inputPath = path
  // let outputPath = await Match.renameFile(await Convert.convertFile(inputPath))
  await Match.renameFile(await Convert.convertFile(inputPath))
  // let outputTags = await ID3.parseFile(outputPath)
  
  // Log.debug(outputTags, `ID3.parseFile('${Path.basename(outputPath)}')`)

}

Process.processOther = async function (path) { // , context) {

  let targetPath = Path.join(Configuration.command.paths.processing, Path.basename(path))

  await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.copy(path, targetPath, { 'stopOnErr' : true })

}

export default Process
