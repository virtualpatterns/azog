import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'
import Queue from 'p-queue'
import Sanitize from 'sanitize-filename'

import Configuration from '../../configuration'
import Convert from './convert'
import Match from './match'

const Process = Object.create(_Process)

Process.queue = new Queue(Configuration.command.queue)

Process.processTorrent = async function (torrentId, torrentName) {
  Log.debug(Configuration.line)
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
    Log.debug(`STOP Process.processTorrent(torrentId, '${torrentName}') ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

}

Process.start = async function () {
  // Log.debug(`Process.start() queued=${Process.queue.size}`)

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
  // Log.debug(`Process.processBook('${Path.basename(path)}')`)

  let inputPath = path
  let outputPath = null

  let { parentPath, extension, name } = Match.fromPath(inputPath)

  parentPath = Path.join(Configuration.command.path.processed, 'Books')
  name = Sanitize(Match.transform(name) )
  
  outputPath = Match.toPath({ parentPath, extension, name })

  await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })

  // Log.debug(`FileSystem.copy('${Path.relative(Configuration.command.path.downloaded, inputPath)}', '${Path.relative(Configuration.command.path.processed, outputPath)}', { 'stopOnErr' : true })`)
  await FileSystem.copy(inputPath, outputPath, { 'stopOnErr' : true })

  Log.debug(`CREATE '${Path.relative(Configuration.command.path.processed, outputPath)}'`)

}

Process.processMusic = async function (path) {
  // Log.debug(`Process.processMusic('${Path.basename(path)}')`)

  let inputPath = path
  let outputPath = await Convert.convertMusic(inputPath)
  let outputTag = await ID3.parseFile(outputPath)

  let { parentPath, extension, name } = Match.fromPath(outputPath)

  parentPath = Path.join(Configuration.command.path.processed, 'Music', Sanitize(outputTag.common.albumartist || outputTag.common.artist || 'Unknown Artist'), Sanitize(outputTag.common.album || 'Unknown Album'))
  name = `${outputTag.common.track.no && outputTag.common.track.no.toString().padStart(2, '0') || '00'} ${Sanitize(outputTag.common.title || 'Unknown Title')}`

  inputPath = outputPath
  outputPath = Match.toPath({ parentPath, extension, name })

  await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })

  // Log.debug(`FileSystem.rename('${Path.relative(Configuration.command.path.processing, inputPath)}', '${Path.relative(Configuration.command.path.processed, outputPath)}')`)
  await FileSystem.rename(inputPath, outputPath)

  Log.debug(`CREATE '${Path.relative(Configuration.command.path.processed, outputPath)}'`)

}

Process.processVideo = async function (path) {
  // Log.debug(`Process.processVideo('${Path.basename(path)}')`)

  let inputPath = path
  let duration = await Convert.getDuration(inputPath)

  if (duration.as('minutes') >= Configuration.command.minimum.minutes) {

    let outputPath = await Convert.convertVideo(inputPath)

    inputPath = outputPath
    outputPath = await Match.getPath(inputPath)
  
    await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })
  
    // Log.debug(`FileSystem.rename('${Path.basename(inputPath)}', '${Path.basename(outputPath)}')`)
    await FileSystem.rename(inputPath, outputPath)
  
    Log.debug(`CREATE '${Path.relative(Configuration.command.path.processed, outputPath)}'`)
  
  }

}

Process.processOther = async function (path) {
  // Log.debug(`Process.processOther('${Path.basename(path)}')`)

  let inputPath = path
  let outputPath = null

  let { parentPath, extension, name } = Match.fromPath(inputPath)

  parentPath = Path.join(Configuration.command.path.processed, 'Other')
  outputPath = Match.toPath({ parentPath, extension, name })

  await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })

  Log.trace(`START FileSystem.copy('${Path.basename(inputPath)}', '${Path.basename(outputPath)}', { 'stopOnErr' : true })`)
  let start = Process.hrtime()

  try {
    await FileSystem.copy(inputPath, outputPath, { 'stopOnErr' : true })
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.trace(`STOP FileSystem.copy('${Path.basename(inputPath)}', '${Path.basename(outputPath)}', { 'stopOnErr' : true }) ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

  Log.debug(`CREATE '${Path.relative(Configuration.command.path.processed, outputPath)}'`)

}

export default Process
