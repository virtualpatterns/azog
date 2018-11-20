import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'
import Queue from 'p-queue'
import Sanitize from 'sanitize-filename'

import { Command as Configuration } from '../../configuration'
import Convert from './convert'
import Match from './match'

const Process = Object.create(_Process)

Process.queue = new Queue(Configuration.queue)

Process.processTorrent = async function (path) {
  Log.debug(`START Process.processTorrent('${Path.basename(path)}')`)

  let start = Process.hrtime()

  try {

    let information = await FileSystem.stat(path)

    if (information.isDirectory()) {
      await Process.processDirectory(path)
    }
    else if (information.isFile()) {
      Process.addToQueue(path)
    }
  
    await Process.runQueue()
    
  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.debug(`STOP Process.processTorrent('${Path.basename(path)}') ${Configuration.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

}

Process.processDirectory = async function (path) {

  let files = await FileSystem.readdir(path, {
    'encoding': 'utf-8',
    'withFileTypes': true
  })

  for (let file of files) {
    if (file.isDirectory()) {
      await Process.processDirectory(Path.join(path, file.name))
    }
    else if (file.isFile()) {
      Process.addToQueue(Path.join(path, file.name))
    }
  }

}

Process.addToQueue = function (path) {
  // Log.debug(`Process.addToQueue('${Path.basename(path)}')`)
  Process.queue.add(Process.processFile.bind(Process, path))
}

Process.runQueue = async function () {
  // Log.debug('Process.runQueue()')

  Process.queue.start()
  await Process.queue.onIdle()

}

Process.processFile = async function (path) {
 
  try {

    let extension = Path.extname(path).toLowerCase()

    if (Configuration.extension.book.includes(extension)) {
      await Process.processBook(path)
    }
    else if (Configuration.extension.music.includes(extension)) {
      await Process.processMusic(path)
    }
    else if (Configuration.extension.video.includes(extension)) {
      await Process.processVideo(path)
    }
    else if (Configuration.extension.other.includes(extension)) {
      await Process.processOther(path)
    }

  }
  catch (error) {

    Log.error(`Process.processFile('${Path.basename(path)}') { ... }`)
    Log.error(error)

    let targetPath = Path.join(Configuration.path.failed, Path.basename(path))
  
    await FileSystem.mkdir(Path.dirname(targetPath), { 'recursive': true })
    await FileSystem.copy(path, targetPath, { 'stopOnErr' : true })
    
  }

}

Process.processBook = async function (path) {
  // Log.debug(`Process.processBook('${Path.basename(path)}')`)

  let inputPath = path
  let outputPath = null

  let { parentPath, extension, name } = Match.fromPath(inputPath)

  parentPath = Path.join(Configuration.path.processed, 'Books')
  name = Sanitize(Match.transform(name) )
  
  outputPath = Match.toPath({ parentPath, extension, name })

  await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })

  // Log.debug(`FileSystem.copy('${Path.relative(Configuration.path.downloaded, inputPath)}', '${Path.relative(Configuration.path.processed, outputPath)}', { 'stopOnErr' : true })`)
  await FileSystem.copy(inputPath, outputPath, { 'stopOnErr' : true })

  Log.debug(`CREATE '${Path.relative(Configuration.path.processed, outputPath)}'`)

}

Process.processMusic = async function (path) {
  // Log.debug(`Process.processMusic('${Path.basename(path)}')`)

  let inputPath = path
  let outputPath = await Convert.convertMusic(inputPath)

  let outputTag = await ID3.parseFile(outputPath)

  delete outputTag.picture
  Log.trace(outputTag.common, `ID3.parseFile('${Path.basename(outputPath)}')`)

  let { parentPath, extension, name } = Match.fromPath(outputPath)

  parentPath = Path.join(Configuration.path.processed, 'Music', Sanitize(outputTag.common.albumartist || outputTag.common.artist || 'Unknown Artist'), Sanitize(outputTag.common.album || 'Unknown Album'))
  name = `${outputTag.common.track.no && outputTag.common.track.no.toString().padStart(2, '0') || '00'} ${Sanitize(outputTag.common.title || 'Unknown Title')}`

  inputPath = outputPath
  outputPath = Match.toPath({ parentPath, extension, name })

  await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })

  // Log.debug(`FileSystem.rename('${Path.relative(Configuration.path.processing, inputPath)}', '${Path.relative(Configuration.path.processed, outputPath)}')`)
  await FileSystem.rename(inputPath, outputPath)

  Log.debug(`CREATE '${Path.relative(Configuration.path.processed, outputPath)}'`)

}

Process.processVideo = async function (path) {
  // Log.debug(`Process.processVideo('${Path.basename(path)}')`)

  let inputPath = path
  let duration = await Convert.getDuration(inputPath)

  let durationInMinutes = duration.as('minutes')
  let [ minimumDurationInMinutes ] = Configuration.range.videoDurationInMinutes

  if (durationInMinutes >= minimumDurationInMinutes) {

    let outputPath = await Convert.convertVideo(inputPath)

    inputPath = outputPath
    outputPath = await Match.getPath(inputPath)
  
    await FileSystem.mkdir(Path.dirname(outputPath), { 'recursive': true })
  
    // Log.debug(`FileSystem.rename('${Path.basename(inputPath)}', '${Path.basename(outputPath)}')`)
    await FileSystem.rename(inputPath, outputPath)
  
    Log.debug(`CREATE '${Path.relative(Configuration.path.processed, outputPath)}'`)
  
  }
  else {
    Log.debug(`SKIP '${Path.basename(path)}' ${durationInMinutes.toFixed(2)}m`)
  }

}

Process.processOther = async function (path) {
  // Log.debug(`Process.processOther('${Path.basename(path)}')`)

  let inputPath = path
  let outputPath = null

  let { parentPath, extension, name } = Match.fromPath(inputPath)

  parentPath = Path.join(Configuration.path.processed, 'Other')
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

  Log.debug(`CREATE '${Path.relative(Configuration.path.processed, outputPath)}'`)

}

export default Process
