import { assert as Assert } from 'chai'
import { FileSystem, Path } from '@virtualpatterns/mablung'

import { Command as Configuration } from '../../../configuration'
import Process from '../../../command/library/process'

import TestError from '../../error/test-error'

describe('process', () => {

  describe('processTorrent', () => {

    let downloadedPath = `${__dirname}/../../../../resource/deluge/downloaded`

    describe('(when called with a book)', () => {

      let torrentName = null
      let torrentPath = null
      let processedBooksPath = null
      let processedBookPath = null

      before(async () => {

        torrentName = 'Sleeping Beauties by Stephen King'
        torrentPath = Path.join(downloadedPath, torrentName)
        processedBooksPath = Path.join(Configuration.path.processed, 'Books')
        processedBookPath = Path.join(processedBooksPath, `${torrentName}.epub`)

        await FileSystem.remove(Configuration.path.processed)
        await Process.processTorrent(torrentPath)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedBookPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when called with an album)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMusicPath = null
      let processedArtistPath = null
      let processedAlbumPath = null
      let processedSongPath = null

      before(async () => {

        torrentName = 'Jimi Hendrix - Axis Bold as Love (320)'
        torrentPath = Path.join(downloadedPath, torrentName)
        processedMusicPath = Path.join(Configuration.path.processed, 'Music')
        processedArtistPath = Path.join(processedMusicPath, 'The Jimi Hendrix Experience')
        processedAlbumPath = Path.join(processedArtistPath, 'Axis Bold as Love')
        processedSongPath = Path.join(processedAlbumPath, '26 Bold as Love.mp3')

        await FileSystem.remove(Configuration.path.processed)
        await Process.processTorrent(torrentPath)

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
        await FileSystem.remove(Configuration.path.processing)
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when called with a movie)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMoviesPath = null
      let processedMoviePath = null

      before(async () => {

        torrentName = 'The.Equalizer.2.2018.720p.WEBRip.x264-[YTS.AM]'
        torrentPath = Path.join(downloadedPath, torrentName)
        processedMoviesPath = Path.join(Configuration.path.processed, 'Movies')
        processedMoviePath = Path.join(processedMoviesPath, 'The Equalizer 2 (2018).mp4')

        await FileSystem.remove(Configuration.path.processed)
        await Process.processTorrent(torrentPath)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processing)
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when called with a short movie)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMoviesPath = null
      let processedMoviePath = null

      before(async () => {

        torrentName = 'Jonathan.2018.1080p.WEB-DL.DD5.1.H264-FGT'
        torrentPath = Path.join(downloadedPath, torrentName)
        processedMoviesPath = Path.join(Configuration.path.processed, 'Movies')
        processedMoviePath = Path.join(processedMoviesPath, 'Jonathan (2018).mp4')

        await FileSystem.remove(Configuration.path.processed)
        await Process.processTorrent(torrentPath)

      })

      it('should not produce the correct file', async () => {

        try {
          await FileSystem.access(processedMoviePath, FileSystem.F_OK)
          throw new TestError(`The file '${Path.trim(processedMoviePath)}' exists.`)
        }
        catch (error) {
          if (error instanceof TestError) {
            throw error
          }
        }

      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processing)
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when called with a tv show)', () => {

      let torrentName = null
      let torrentPath = null
      let processedTVShowsPath = null
      let processedTVShowPath = null
      let processedSeasonPath = null
      let processedEpisodePath = null

      before(async () => {

        torrentName = 'South.Park.S22E05.720p.HDTV.x264-AVS'
        torrentPath = Path.join(downloadedPath, torrentName)
        processedTVShowsPath = Path.join(Configuration.path.processed, 'TV Shows')
        processedTVShowPath = Path.join(processedTVShowsPath, 'South Park')
        processedSeasonPath = Path.join(processedTVShowPath, 'Season 22')
        processedEpisodePath = Path.join(processedSeasonPath, 'South Park - 22x05 - The Scoots.mp4')

        await FileSystem.remove(Configuration.path.processed)
        await Process.processTorrent(torrentPath)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedEpisodePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processing)
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when called with an archive)', () => {

      let torrentName = null
      let torrentPath = null
      let processedArchivePath = null

      before(async () => {

        torrentName = 'Archive'
        torrentPath = Path.join(downloadedPath, torrentName)
        processedArchivePath = Path.join(Configuration.path.processed, 'Other', `${torrentName}.zip`)

        await FileSystem.remove(processedArchivePath)
        await Process.processTorrent(torrentPath)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedArchivePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(processedArchivePath)
      })
  
    })

    describe('(when called with an invalid file)', () => {

      let torrentName = null
      let torrentPath = null
      let failedFilePath = null

      before(async () => {

        torrentName = 'Invalid Music'
        torrentPath = Path.join(downloadedPath, torrentName)
        failedFilePath = Path.join(Configuration.path.failed, `${torrentName}.flac`)

        await FileSystem.remove(Configuration.path.processing)
        await FileSystem.remove(Configuration.path.failed)
        await Process.processTorrent(torrentPath)

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedFilePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processing)
        await FileSystem.remove(Configuration.path.failed)
      })
  
    })

  })

})
