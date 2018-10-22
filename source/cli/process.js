import { FileSystem, Log, Path, Process as _Process } from '@virtualpatterns/mablung'

const BOOK_EXTENSIONS = [ '.epub', '.mobi', '.pdf' ]
const MUSIC_EXTENSIONS = [ '.flac', '.mp3' ]
const VIDEO_EXTENSIONS = [ '.avi', '.mkv', '.mp4' ]

const Process = Object.create(_Process)

Process.onTorrent = async function (torrentId, torrentName, torrentPath) {
  Log.debug(`Process.onTorrent('${torrentId}', '${torrentName}', '${torrentPath}') { ... }`)
  await Process.onPath(Path.join(torrentPath, torrentName), {
    'torrentId': torrentId,
    'torrentName': torrentName,
    'torrentPath': torrentPath
  })
}

Process.onPath = async function (path, context) {
  Log.debug('Process.onPath(path, context) { ... }')

  let pathInformation = await FileSystem.promisedStat(path, { 'bigint': true })

  if (pathInformation.isDirectory()) {
    await Process.onDirectory(path, context)
  }
  else if (pathInformation.isFile()) {
    await Process.onFile(path, context)
  }

}

Process.onDirectory = async function (path, context) {
  Log.debug('Process.onDirectory(path, context) { ... }')

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
  Log.debug('Process.onFile(path, context) { ... }')

  // let fileInformation = await FileSystem.promisedStat(path, { 'bigint': true })

  let extension = Path.extname(path).toLowerCase()
  // let size = fileInformation.size

  if (BOOK_EXTENSIONS.includes(extension)) {
    Process.onBook(path, context)
  }
  else if (MUSIC_EXTENSIONS.includes(extension)) {
    Process.onMusic(path, context)
  }
  else if (VIDEO_EXTENSIONS.includes(extension)) {
    Process.onVideo(path, context)
  }
  else {
    Process.onOther(path, context)
  }

}

Process.onBook = async function (path, context) {
  Log.debug(context, `Process.onBook('${path}', context) { ... }`)
}

Process.onMusic = async function (path, context) {
  Log.debug(context, `Process.onMusic('${path}', context) { ... }`)
}

Process.onVideo = async function (path, context) {
  Log.debug(context, `Process.onVideo('${path}', context) { ... }`)
}

Process.onOther = async function (path, context) {
  Log.debug(context, `Process.onOther('${path}', context) { ... }`)
}

export default Process
