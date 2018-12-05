
import { Command } from '../../../configuration'

import Remote from './remote'

const remotePrototype = Remote.getDirectoryPrototype()
const mediaPrototype = Object.create(remotePrototype)

const Media = Object.create(Remote)

Media.createDirectory = function (fromPath, prototype = mediaPrototype) {
  return Remote.createDirectory.call(this, fromPath, Command.remoteServer, Command.path.remote.media, prototype)
}

Media.getDirectoryPrototype = function () {
  return mediaPrototype
}

Media.isDirectory = function (media) {
  return mediaPrototype.isPrototypeOf(media)
}

export default Media
