import * as ID3 from 'music-metadata'
import { Log, Path } from '@virtualpatterns/mablung'

import { Command } from '../../../configuration'

import Media from './media'

const mediaPrototype = Media.getResourcePrototype()
const musicPrototype = Object.create(mediaPrototype)

musicPrototype.getToPath = async function () {

  let tag = await ID3.parseFile(this.fromPath, { 'skipCovers': true })
  Log.debug({ tag }, `ID3.parseFile('${Path.basename(this.fromPath)}', { 'skipCovers': true }`)

  let artist = Music.sanitize(tag.common.albumartist || tag.common.artist || 'Unknown Artist')
  let album = Music.sanitize(tag.common.album || 'Unknown Album')
  let song = `${tag.common.track.no && tag.common.track.no.toString().padStart(2, '0') || '00'} ${Music.sanitize(tag.common.title || 'Unknown Title')}`

  return Path.join(Command.path.processed, artist, album, `${song}.mp3`)

}

const Music = Object.create(Media)

Music.createResource = function (fromPath, prototype = musicPrototype) {
  return Media.createResource.call(this, fromPath, prototype)
}

Music.getResourcePrototype = function () {
  return musicPrototype
}

Music.isResource = function (music) {
  return musicPrototype.isPrototypeOf(music)
}

Music.isResourceClass = function (path) {
  return Command.extension.music.includes(Path.extname(path))
}

export default Music
