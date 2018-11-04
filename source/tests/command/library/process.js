import { assert as Assert } from 'chai'
import { FileSystem, Path } from '@virtualpatterns/mablung'

import Configuration from '../../../configuration'
import Process from '../../../command/library/process'

describe('process', () => {

  describe('processTorrent', () => {

    describe('(when called with a book)', () => {

      let torrentId = null
      let torrentName = null
      let processedBooksPath = null
      let processedBookPath = null

      before(async () => {

        torrentId = '6fe895e52e803f58e640e3d8311e1e8e1231e599'
        torrentName = 'Sleeping Beauties by Stephen King'
        processedBooksPath = Path.join(Configuration.command.paths.processed, 'Books')
        processedBookPath = Path.join(processedBooksPath, `${torrentName}.epub`)

        await FileSystem.remove(Configuration.command.paths.processed)
        await Process.processTorrent(torrentId, torrentName)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedBookPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.command.paths.processed)
      })
  
    })

    describe('(when called with an album)', () => {

      let torrentId = null
      let torrentName = null
      let processedMusicPath = null
      let processedArtistPath = null
      let processedAlbumPath = null
      let processedSongPath = null

      before(async () => {

        torrentId = '6618f02fbb83c5fbccb7ef7b86e54761f9bf5e8b'
        torrentName = 'Jimi Hendrix - Axis Bold as Love (320)'
        processedMusicPath = Path.join(Configuration.command.paths.processed, 'Music')
        processedArtistPath = Path.join(processedMusicPath, 'The Jimi Hendrix Experience')
        processedAlbumPath = Path.join(processedArtistPath, 'Axis Bold as Love')
        processedSongPath = Path.join(processedAlbumPath, '26 Bold as Love.mp3')

        await FileSystem.remove(Configuration.command.paths.processed)
        await Process.processTorrent(torrentId, torrentName)

      })

      it('should produce the correct directory ', async () => {
        await FileSystem.access(processedAlbumPath, FileSystem.F_OK)
      })
    
      it('should produce the correct number of files', async () => {
        Assert.equal((await FileSystem.readdir(processedAlbumPath)).length, 26)
      })
    
      it('should produce the correct file', async () => {
        await FileSystem.access(processedSongPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.command.paths.processed)
      })
  
    })

    describe('(when called with a tv show)', () => {

      let torrentId = null
      let torrentName = null
      let processingTVShowPath = null

      before(async () => {

        torrentId = '6618f02fbb83c5fbccb7ef7b86e54761f9bf5e8b'
        torrentName = 'South.Park.S22E05.720p.HDTV.x264-AVS'
        processingTVShowPath = Path.join(Configuration.command.paths.processing, `${torrentName}.mp4`)

        await FileSystem.remove(Configuration.command.paths.processing)
        await Process.processTorrent(torrentId, torrentName)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processingTVShowPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.command.paths.processing)
      })
  
    })

    describe('(when called with an archive)', () => {

      let torrentId = null
      let torrentName = null
      let processingArchivePath = null

      before(async () => {

        torrentId = '6618f02fbb83c5fbccb7ef7b86e54761f9bf5e8b'
        torrentName = 'Archive'
        processingArchivePath = Path.join(Configuration.command.paths.processing, `${torrentName}.zip`)

        await FileSystem.remove(Configuration.command.paths.processing)
        await Process.processTorrent(torrentId, torrentName)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processingArchivePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.command.paths.processing)
      })
  
    })

    describe('(when called with an invalid file)', () => {

      let torrentId = null
      let torrentName = null
      let failedFilePath = null

      before(async () => {

        torrentId = '6618f02fbb83c5fbccb7ef7b86e54761f9bf5e8b'
        torrentName = 'Invalid Music'
        failedFilePath = Path.join(Configuration.command.paths.failed, `${torrentName}.flac`)

        await FileSystem.remove(Configuration.command.paths.processing)
        await FileSystem.remove(Configuration.command.paths.failed)
        await Process.processTorrent(torrentId, torrentName)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedFilePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.command.paths.processing)
        await FileSystem.remove(Configuration.command.paths.failed)
      })
  
    })

  })

})
