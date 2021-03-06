import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import Queue from 'p-queue'

// import Connection from './connection'
import Configuration from '../configuration'

import Resource from './resource'
import Book from './resource/book'
import Music from './resource/music'
import Movie from './resource/movie'
import Episode from './resource/episode'
import Zip from './resource/zip'
import Other from './resource/other'

// import Library from './library'

import { ResourceClassNotFoundError } from './error/resource-error'

const torrentPrototype = Object.create({})

torrentPrototype.process = async function () {

  let start = Process.hrtime()

  try {

    let file = await FileSystem.stat(this.path)

    if (file.isDirectory()) {
      await this.processDirectory(this.path)
    }
    else if (file.isFile()) {
      this.enqueuePath(this.path)
    }
  
    await this.dequeuePaths()

  }
  finally {
    Log.debug(`Completed in ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.longDuration)}`)
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
      this.enqueuePath(Path.join(path, file.name))
    }
  }

}

torrentPrototype.enqueuePath = function (path) {
  this.queue.add(this.dequeuePath.bind(this, path))
}

torrentPrototype.dequeuePaths = async function () {
  await this.queue.start()
  await this.queue.onIdle()
}

torrentPrototype.dequeuePath = async function (path) {

  try {
    await Resource.selectResource(path, this.connection).process()
  }
  catch (error) {

    if (error instanceof ResourceClassNotFoundError) {
      Log.debug(`Skipped '${Path.basename(path)}'`)
    }
    else {

      Log.error(`Failed on '${Path.basename(path)}'`)
      Log.error(error)

      let toPath = Path.join(Configuration.path.failed, Path.basename(path))
    
      Log.trace(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
      await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })

      Log.trace(`FileSystem.copy(path, '${Path.basename(toPath)}')`)
      await FileSystem.copy(path, toPath)
  
    }
  
  }

}

const Torrent = Object.create({})

Torrent.createTorrent = function (path, connection, prototype = torrentPrototype) {

  let torrent = Object.create(prototype)

  torrent.path = path
  torrent.connection = connection

  torrent.queue = new Queue(Configuration.queue)

  return torrent

}

Torrent.getTorrentPrototype = function () {
  return torrentPrototype
}

Torrent.isTorrent = function (torrent) {
  return torrentPrototype.isPrototypeOf(torrent)
}

// Torrent.transfer = async function () {

//   let start = Process.hrtime()

//   try {
    
//     let queue = null
//     queue = new Queue(Configuration.queue)
        
//     const enqueueLibrary = function (library) {
//       queue.add(dequeueLibrary.bind(dequeueLibrary, library))
//     }

//     const dequeueLibraries = async function () {
//       await queue.start()
//       await queue.onIdle()
//     }

//     const dequeueLibrary = async function (library) {

//       try {
//         await library.transfer()
//       }
//       catch (error) {
//         Log.error(`Failed on '${Path.basename(library.fromPath)}'`)
//         Log.error(error)      
//       }

//     }

//     for (let fromPath of Object.values(Configuration.path.library.from)) {
//       enqueueLibrary(Library.createLibrary(fromPath, Configuration.path.library.to))
//     }

//     await dequeueLibraries()
    
//   }
//   finally {
//     Log.debug(`Completed in ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.longDuration)}`)
//   }

// }

Zip.registerResourceClass()
Book.registerResourceClass()
Music.registerResourceClass()
Movie.registerResourceClass()
Episode.registerResourceClass()
Other.registerResourceClass()

export default Torrent
