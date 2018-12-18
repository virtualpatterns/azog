import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import Queue from 'p-queue'

// import Connection from './connection'
import Configuration from '../configuration'

import Resource from './resource'
import Book from './resource/book'
import Music from './resource/music'
import Movie from './resource/movie'
import Episode from './resource/episode'
import Other from './resource/other'

// import Library from './library'

import { ResourceClassNotFoundError } from './error/resource-error'

const torrentPrototype = Object.create({})

torrentPrototype.process = async function (connection) {

  let start = Process.hrtime()

  try {

    let file = await FileSystem.stat(this.path)

    if (file.isDirectory()) {
      await this.processDirectory(this.path, connection)
    }
    else if (file.isFile()) {
      this.enqueuePath(this.path, connection)
    }
  
    await this.dequeuePaths()

  }
  finally {
    Log.debug(`Completed in ${Configuration.conversion.toDuration(Process.hrtime(start)).toFormat(Configuration.format.longDuration)}`)
  }

}

torrentPrototype.processDirectory = async function (path, connection) {

  let files = await FileSystem.readdir(path, {
    'encoding': 'utf-8',
    'withFileTypes': true
  })

  for (let file of files) {
    if (file.isDirectory()) {
      await this.processDirectory(Path.join(path, file.name), connection)
    }
    else if (file.isFile()) {
      this.enqueuePath(Path.join(path, file.name), connection)
    }
  }

}

torrentPrototype.enqueuePath = function (path, connection) {
  this.queue.add(torrentPrototype.dequeuePath.bind(torrentPrototype, path, connection))
}

torrentPrototype.dequeuePaths = async function () {
  await this.queue.start()
  await this.queue.onIdle()
}

torrentPrototype.dequeuePath = async function (path, connection) {
  
  let fromPath = path
  let fromExtension = Path.extname(fromPath)
  let fromName = Path.basename(fromPath, fromExtension)

  let toPath = null
  let toExtension = null
  let toName = null

  try {

    let resource = null
    resource = Resource.selectResource(fromPath)

    toPath = await resource.process()
    toExtension = Path.extname(toPath)
    toName = Path.basename(toPath, toExtension)

    await connection.insertResource(fromName, toName)
  
  }
  catch (error) {

    if (error instanceof ResourceClassNotFoundError) {
      Log.debug(`Skipped '${Path.basename(fromPath)}'`)
    }
    else {

      Log.error(`Failed on '${Path.basename(fromPath)}'`)
      Log.error(error)

      toPath = Path.join(Configuration.path.failed, Path.basename(fromPath))
    
      Log.trace(`FileSystem.mkdir('${Path.trim(Path.dirname(toPath))}'), { 'recursive': true }`)
      await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })

      Log.trace(`FileSystem.copy(fromPath, '${Path.basename(toPath)}')`)
      await FileSystem.copy(fromPath, toPath)
  
    }
  
  }

}

const Torrent = Object.create({})

Torrent.createTorrent = function (path, prototype = torrentPrototype) {

  let torrent = Object.create(prototype)

  torrent.path = path
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

Book.registerResourceClass()
Music.registerResourceClass()
Movie.registerResourceClass()
Episode.registerResourceClass()
Other.registerResourceClass()

export default Torrent
