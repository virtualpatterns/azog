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

    describe('(when passing an invalid movie)', () => {

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

    describe('(when passing 3 episodes)', () => {

      let torrentName = null
      let torrentPath = null

      let processedSeriesPath1 = null
      let processedSeasonPath1 = null
      let processedEpisodePath1 = null

      let processedSeriesPath2 = null
      let processedSeasonPath2 = null
      let processedEpisodePath2 = null

      let processedSeriesPath3 = null
      let processedSeasonPath3 = null
      let processedEpisodePath3 = null

      before(async () => {

        torrentName = 'episode'
        torrentPath = Path.join(Command.path.downloaded, torrentName)

        processedSeriesPath1 = Path.join(Command.path.processed, 'South Park')
        processedSeasonPath1 = Path.join(processedSeriesPath1, 'Season 22')
        processedEpisodePath1 = Path.join(processedSeasonPath1, 'South Park - 22x05 - The Scoots.mp4')

        processedSeriesPath2 = Path.join(Command.path.processed, 'Will & Grace')
        processedSeasonPath2 = Path.join(processedSeriesPath2, 'Season 10')
        processedEpisodePath2 = Path.join(processedSeasonPath2, 'Will & Grace - 10x07 - So Long, Division.mp4')

        processedSeriesPath3 = Path.join(Command.path.processed, 'Leah Remini Scientology and the Aftermath')
        processedSeasonPath3 = Path.join(processedSeriesPath3, 'Season 0')
        processedEpisodePath3 = Path.join(processedSeasonPath3, 'Leah Remini Scientology and the Aftermath - 0x12 - The Jehovah\'s Witnesses.mp4')

        await FileSystem.remove(Command.path.processed)
        await Torrent.createTorrent(torrentPath).process()

      })

      it('should produce the correct file', async () => {
        await FileSystem.access(processedEpisodePath1, FileSystem.F_OK)
      })
    
      it('should produce the correct file', async () => {
        await FileSystem.access(processedEpisodePath2, FileSystem.F_OK)
      })
    
      it('should produce the correct file', async () => {
        await FileSystem.access(processedEpisodePath3, FileSystem.F_OK)
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
        failedEpisodePath = Path.join(Command.path.failed, 'South.Park.S321E123.mkv')

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
