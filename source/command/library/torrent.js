import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import Queue from 'p-queue'

import { Command } from '../../configuration'

import Resource from './resource'
import Book from './resource/book'
import Music from './resource/music'
import Movie from './resource/movie'
import Episode from './resource/episode'
import Other from './resource/other'

const torrentPrototype = Object.create({})

torrentPrototype.process = async function () {

  Log.debug('Torrent.process() ...')
  let start = Process.hrtime()

  try {

    let file = await FileSystem.stat(this.path)

    if (file.isDirectory()) {
      await this.processDirectory(this.path)
    }
    else if (file.isFile()) {
      this.enqueueFile(this.path)
    }
  
    await this.dequeueFiles()

  }
  finally {

    let [ seconds, nanoSeconds ] = Process.hrtime(start)
    Log.debug(`Torrent.process() ${Command.conversion.toSeconds(seconds, nanoSeconds)}s`)
  
  }

}

torrentPrototype.processDirectory = async function (path) {

  let files = await FileSystem.readdir(path, {
    'encoding': 'utf-8',
    'withFileTypes': true
  })

  for (let file of files) {
    if (file.isDirectory()) {
      await this.processDirectory(Path.join(path, file.name))
    }
    else if (file.isFile()) {
      this.enqueueFile(Path.join(path, file.name))
    }
  }

}

torrentPrototype.enqueueFile = function (path) {
  this.queue.add(torrentPrototype.dequeueFile.bind(torrentPrototype, path))
}

torrentPrototype.dequeueFiles = async function () {

  await this.queue.start()
  await this.queue.onIdle()

}

torrentPrototype.dequeueFile = async function (path) {
  
  try {
    await Resource.selectResource(path).process()
  }
  catch (error) {

    Log.error(`Torrent.dequeueFile('${Path.basename(path)}')`)
    Log.error(error)

    let fromPath = path
    let toPath = Path.join(Command.path.failed, Path.basename(path))

    Log.debug(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
    await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })
  
    Log.debug(`FileSystem.copy('${Path.basename(fromPath)}', '${Path.basename(toPath)}')`)
    await FileSystem.copy(fromPath, toPath)
  
  }

}

const Torrent = Object.create({})

Torrent.createTorrent = function (path, prototype = torrentPrototype) {

  let torrent = Object.create(prototype)

  torrent.path = path
  torrent.queue = new Queue(Command.queue)

  return torrent

}

Torrent.getTorrentPrototype = function () {
  return torrentPrototype
}

Book.registerResourceClass()
Music.registerResourceClass()
Movie.registerResourceClass()
Episode.registerResourceClass()
Other.registerResourceClass()

export default Torrent
