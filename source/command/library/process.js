import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'
import Queue from 'p-queue'
import Sanitize from 'sanitize-filename'

import Configuration from '../../configuration'
import Convert from './convert'
import Match from './match'

const SECONDS_PER_NANOSECOND = 1 / 1000000000

const Process = Object.create(_Process)

Process.queue = new Queue(Configuration.command.option.queue)

Process.processTorrent = async function (torrentId, torrentName) {
  Log.debug(`START Process.processTorrent(torrentId, '${torrentName}')`)

  let start = Process.hrtime()

  try {

    await Process.processPath(Path.join(Configuration.command.path.downloaded, torrentName), {
      'torrentId': torrentId,
      'torrentName': torrentName
    })
  
    await Process.start()
  
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.debug(`STOP Process.processTorrent(torrentId, '${torrentName}') ${(seconds + nanoSeconds * SECONDS_PER_NANOSECOND).toFixed(2)}s`)
  
  }

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

    if (Configuration.command.extension.book.includes(extension)) {
      await Process.processBook(path, context)
    }
    else if (Configuration.command.extension.music.includes(extension)) {
      await Process.processMusic(path, context)
    }
    else if (Configuration.command.extension.video.includes(extension)) {
      await Process.processVideo(path, context)
    }
    else if (Configuration.command.extension.other.includes(extension)) {
      await Process.processOther(path, context)
    }

  }
  catch (error) {

    Log.error(`Process.processFile('${Path.basename(path)}', context) { ... }`)
    Log.error(error)

    let targetPath = Path.join(Configuration.command.path.failed, Path.basename(path))
  
    await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
    await FileSystem.copy(path, targetPath, { 'stopOnErr' : true })
    
  }

}

Process.processBook = async function (path) {

  let targetPath = Path.join(Configuration.command.path.processed, 'Book', Path.basename(path))

  await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.copy(path, targetPath, { 'stopOnErr' : true })

}

Process.processMusic = async function (path) {

  let inputPath = path
  let outputPath = await Convert.convertFile(inputPath)
  let outputTag = await ID3.parseFile(outputPath)

  delete outputTag.common.picture
  
  Log.debug(outputTag.common, `ID3.parseFile('${Path.basename(outputPath)}')`)

  let targetPath = Path.join(Configuration.command.path.processed, 'Music', Sanitize(outputTag.common.albumartist || outputTag.common.artist || 'Unknown Artist'), Sanitize(outputTag.common.album || 'Unknown Album'))
  let targetName = `${outputTag.common.track.no && outputTag.common.track.no.toString().padStart(2, '0') || '00'} ${Sanitize(outputTag.common.title || 'Unknown Title')}${Path.extname(outputPath)}`

  targetPath = Path.join(targetPath, targetName)
 
  await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.rename(outputPath, targetPath)

}

Process.processVideo = async function (path) {
  await Match.renameFile(await Convert.convertFile(path))
}

Process.processOther = async function (path) {

  let targetPath = Path.join(Configuration.command.path.processing, Path.basename(path))

  await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.copy(path, targetPath, { 'stopOnErr' : true })

}

export default Process
