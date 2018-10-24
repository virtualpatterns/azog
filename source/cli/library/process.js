import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'
import * as ID3 from 'music-metadata'

import Configuration from '../../configuration'

const BOOK_EXTENSIONS = [ '.epub', '.mobi', '.pdf' ]
const MUSIC_EXTENSIONS = [ '.flac', '.m4a', '.mp3' ]
const OTHER_EXTENSIONS = [ '.zip' ]
const VIDEO_EXTENSIONS = [ '.avi', '.m4v', '.mkv', '.mov', '.mp4' ]

const Process = Object.create(_Process)

Process.onTorrent = async function (torrentId, torrentName) {
  Log.debug(`COMPLETED ${torrentId} ${torrentName}`)
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

Process.onBook = async function (path, context) {
  Log.debug(context, `Process.onBook('${path}', context) { ... }`)

  let targetPath = Path.join(Configuration.cli.processingPath, 'Books')

  Log.debug(`FileSystem.promisedMakeDir('${targetPath}', { 'recursive': true })`)
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  targetPath = Path.join(targetPath, Path.basename(path))

  Log.debug(`FileSystem.promisedCopy(path, '${targetPath}', { 'stopOnErr': true })`)
  await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

Process.onMusic = async function (path, context) {
  Log.debug(context, `Process.onMusic('${path}', context) { ... }`)

  let tags = await ID3.parseFile(path)

  Log.debug(`tags.common.artist='${tags.common.artist}'`)
  Log.debug(`tags.common.albumartist='${tags.common.albumartist}'`)
  Log.debug(`tags.common.album='${tags.common.album}'`)
  Log.debug(`tags.common.track.no=${tags.common.track.no}`)
  Log.debug(`tags.common.title='${tags.common.title}'`)

  let targetPath = Path.join(Configuration.cli.processingPath, 'Music', tags.common.albumartist || tags.common.artist, tags.common.album)
  let name = `${tags.common.track.no.toString().padStart(2, '0')} ${tags.common.title}${Path.extname(path)}`

  Log.debug(`FileSystem.promisedMakeDir('${targetPath}', { 'recursive': true })`)
  await FileSystem.promisedMakeDir(targetPath, { 'recursive': true })

  targetPath = Path.join(targetPath, name)

  Log.debug(`FileSystem.promisedCopy(path, '${targetPath}', { 'stopOnErr': true })`)
  await FileSystem.promisedCopy(path, targetPath, { 'stopOnErr' : true })

}

Process.onVideo = async function (path, context) {
  Log.debug(context, `Process.onVideo('${path}', context) { ... }`)
  await FileSystem.promisedCopy(path, Path.join(Configuration.cli.processingPath, Path.basename(path)), { 'stopOnErr' : true })
}

Process.onOther = async function (path, context) {
  Log.debug(context, `Process.onOther('${path}', context) { ... }`)
  await FileSystem.promisedCopy(path, Path.join(Configuration.cli.processingPath, Path.basename(path)), { 'stopOnErr' : true })
}

export default Process
