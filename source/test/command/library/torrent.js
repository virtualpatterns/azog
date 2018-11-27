import { assert as Assert } from 'chai'
import { FileSystem, Path } from '@virtualpatterns/mablung'

import { Command } from '../../../configuration'
import Torrent from '../../../command/library/torrent'

describe('torrent', () => {

  describe('process()', () => {

    describe('(when passing text)', () => {

      let torrentName = null
      let torrentPath = null

      before(() => {

        torrentName = 'no resource'
        torrentPath = Path.join(Command.path.downloaded, torrentName)

      })

      it('should not throw an error', async () => {
        await Torrent.createTorrent(torrentPath).process()
      })
    
    })

    describe('(when passing a book)', () => {

      let torrentName = null
      let torrentPath = null
      let processedBookPath = null

      before(async () => {

        torrentName = 'book'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        processedBookPath = Path.join(Command.path.processed, `${torrentName}.epub`)

        await FileSystem.remove(Command.path.processed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedBookPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.processed)
      })
  
    })

    describe('(when passing an album)', () => {

      let torrentName = null
      let torrentPath = null
      let processedArtistPath = null
      let processedAlbumPath = null
      let processedSongPath = null

      before(async () => {

        torrentName = 'album'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        processedArtistPath = Path.join(Command.path.processed, 'The Jimi Hendrix Experience')
        processedAlbumPath = Path.join(processedArtistPath, 'Axis Bold as Love')
        processedSongPath = Path.join(processedAlbumPath, '26 Bold as Love.mp3')

        await FileSystem.remove(Command.path.processed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct directory ', async () => {
        await FileSystem.access(processedArtistPath, FileSystem.F_OK)
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
        await FileSystem.remove(Command.path.processed)
      })
  
    })

    describe('(when passing an invalid song)', () => {

      let torrentName = null
      let torrentPath = null
      let failedSongPath = null

      before(async () => {

        torrentName = 'invalid song'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        failedSongPath = Path.join(Command.path.failed, 'invalid song.flac')

        await FileSystem.remove(Command.path.failed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedSongPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.failed)
      })
  
    })

    describe('(when passing a movie)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMoviePath = null

      before(async () => {

        torrentName = 'movie'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        processedMoviePath = Path.join(Command.path.processed, 'The Equalizer 2 (2018).mp4')

        await FileSystem.remove(Command.path.processed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.processed)
      })
  
    })

    describe('(when passing a short movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(async () => {

        torrentName = 'short movie'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        failedMoviePath = Path.join(Command.path.failed, 'Jonathan.2018.1080p.WEB-DL.DD5.1.H264-FGT.mp4')

        await FileSystem.remove(Command.path.failed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.failed)
      })
  
    })

    describe('(when passing a invalid movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(async () => {

        torrentName = 'invalid movie'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        failedMoviePath = Path.join(Command.path.failed, 'The.Equalizer.2.2018.720p.WEBRip.x264-[YTS.AM].mkv')

        await FileSystem.remove(Command.path.failed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.failed)
      })
  
    })

    describe('(when passing an unrecognized movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(async () => {

        torrentName = 'unrecognized movie'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        failedMoviePath = Path.join(Command.path.failed, 'Fart Farter 1970.mp4')

        await FileSystem.remove(Command.path.failed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.failed)
      })
  
    })

    describe('(when passing an episode)', () => {

      let torrentName = null
      let torrentPath = null
      let processedSeriesPath = null
      let processedSeasonPath = null
      let processedEpisodePath = null

      before(async () => {

        torrentName = 'episode'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        processedSeriesPath = Path.join(Command.path.processed, 'South Park')
        processedSeasonPath = Path.join(processedSeriesPath, 'Season 22')
        processedEpisodePath = Path.join(processedSeasonPath, 'South Park - 22x05 - The Scoots.mp4')

        await FileSystem.remove(Command.path.processed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedEpisodePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.processed)
      })
  
    })

    describe('(when passing an unrecognized series)', () => {

      let torrentName = null
      let torrentPath = null
      let failedSeriesPath = null

      before(async () => {

        torrentName = 'unrecognized series'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        failedSeriesPath = Path.join(Command.path.failed, 'Fart.Farter.S22E05.720p.HDTV.x264-AVS.mkv')

        await FileSystem.remove(Command.path.failed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedSeriesPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.failed)
      })
  
    })

    describe('(when passing an unrecognized episode)', () => {

      let torrentName = null
      let torrentPath = null
      let failedEpisodePath = null

      before(async () => {

        torrentName = 'unrecognized episode'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        failedEpisodePath = Path.join(Command.path.failed, 'South.Park.S321E123.720p.HDTV.x264-AVS.mkv')

        await FileSystem.remove(Command.path.failed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(failedEpisodePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.failed)
      })
  
    })

    describe('(when passing an archive)', () => {

      let torrentName = null
      let torrentPath = null
      let processedArchivePath = null

      before(async () => {

        torrentName = 'other'
        torrentPath = Path.join(Command.path.downloaded, torrentName)
        processedArchivePath = Path.join(Command.path.processed, `${torrentName}.zip`)

        await FileSystem.remove(Command.path.processed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedArchivePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.processed)
      })
  
    })

  })

})
