import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'
import Queue from 'promise-queue'
import Sanitize from 'sanitize-filename'

import Configuration from '../../config'
import Converter from './converter'

const Process = Object.create(_Process)

Process.queue = new Queue(Configuration.cli.maximumConcurrentFiles, Configuration.cli.maximumQueuedFiles)

Process.onTorrent = async function (torrentId, torrentName) {
  Log.debug(Configuration.cli.extensions, `Process.onTorrent('${torrentId}', '${torrentName}')`)

  await Process.onPath(Path.join(Configuration.cli.paths.downloaded, torrentName), {
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

    if (Configuration.cli.extensions.book.includes(extension)) {
      await Process.onBook(path, context)
    }
    else if (Configuration.cli.extensions.music.includes(extension)) {
      await Process.onMusic(path, context)
    }
    else if (Configuration.cli.extensions.video.includes(extension)) {
      await Process.onVideo(path, context)
    }
    else if (Configuration.cli.extensions.other.includes(extension)) {
      await Process.onOther(path, context)
    }

  }
  catch (error) {

    Log.error(`Process.onFile('${Path.basename(path)}', context) { ... }`)
    Log.error(error)

    let targetPath = Path.join(Configuration.cli.paths.failed, Path.basename(path))
  
    await FileSystem.promisedMakeDir(Path.dirname(targetPath), { 'recursive': true })
    await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })
    
  }

}

Process.onBook = async function (path) { // , context) {

  let targetPath = Path.join(Configuration.cli.paths.processed, 'Books', Path.basename(path))

  await FileSystem.promisedMakeDir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

Process.onMusic = async function (path) { // , context) {

  path = await Converter.convert(path)

  let tags = await ID3.parseFile(path)

  delete tags.common.picture
  
  Log.debug(tags.common, `ID3.parseFile('${Path.basename(path)}')`)

  let targetPath = Path.join(Configuration.cli.paths.processed, 'Music', Sanitize(tags.common.albumartist || tags.common.artist || 'Unknown Artist'), Sanitize(tags.common.album || 'Unknown Album'))
  let name = `${tags.common.track.no && tags.common.track.no.toString().padStart(2, '0') || '00'} ${Sanitize(tags.common.title || 'Unknown Title')}${Path.extname(path)}`

  targetPath = Path.join(targetPath, name)
 
  await FileSystem.promisedMakeDir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.promisedRename(path, targetPath)

}

Process.onVideo = async function (path) { // , context) {
  await Converter.rename(await Converter.convert(path))
}

Process.onOther = async function (path) { // , context) {
  Log.debug(`FileSystem.promisedCopy(path, '${Path.join(Configuration.cli.paths.processing, Path.basename(path))}', { 'stopOnErr' : true })`)

  let targetPath = Path.join(Configuration.cli.paths.processing, Path.basename(path))

  await FileSystem.promisedMakeDir(Path.dirname(targetPath), { 'recursive': true })
  await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

export default Process
