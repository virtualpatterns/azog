import { FileSystem, Path, Process } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'
import Torrent from '../../library/torrent'

describe('torrent', () => {

  describe('process()', () => {

    describe('(when passing text)', () => {

      let torrentName = null
      let torrentPath = null

      before(() => {

        torrentName = 'Text'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)

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

        torrentName = 'Book'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        processedBookPath = Path.join(Configuration.path.processed, 'Sleeping Beauties by Stephen King.epub')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(processedBookPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when passing music)', () => {

      let torrentName = null
      let torrentPath = null
      let processedArtistPath = null
      let processedAlbumPath = null
      let processedSongPath = null

      before(async () => {

        torrentName = 'Music'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        processedArtistPath = Path.join(Configuration.path.library.from.music, 'The Jimi Hendrix Experience')
        processedAlbumPath = Path.join(processedArtistPath, 'Axis Bold as Love')
        processedSongPath = Path.join(processedAlbumPath, '26 Bold as Love.mp3')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(processedSongPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when passing invalid music)', () => {

      let torrentName = null
      let torrentPath = null
      let failedSongPath = null

      before(async () => {

        torrentName = 'Music (invalid music)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedSongPath = Path.join(Configuration.path.failed, '01 Song.flac')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(failedSongPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing a movie)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMoviePath = null

      before(async () => {

        torrentName = 'Movie'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        processedMoviePath = Path.join(Configuration.path.library.from.movies, 'The Equalizer 2 (2018).mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when passing a movie with no year released)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMoviePath = null

      before(async () => {

        torrentName = 'Movie (no year released)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        processedMoviePath = Path.join(Configuration.path.library.from.movies, 'They Shall Not Grow Old (2018).mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when passing a movie with the incorrect year released)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMoviePath = null

      before(async () => {

        torrentName = 'Movie (incorrect year released)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        processedMoviePath = Path.join(Configuration.path.library.from.movies, 'Under the Silver Lake (2018).mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when passing a short movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(async () => {

        torrentName = 'Movie (short)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedMoviePath = Path.join(Configuration.path.failed, 'Jonathan.2018.1080p.WEB-DL.DD5.1.H264-FGT.mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an invalid movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(async () => {

        torrentName = 'Movie (invalid)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedMoviePath = Path.join(Configuration.path.failed, 'The.Equalizer.2.2018.720p.WEBRip.x264-[YTS.AM].mkv')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an unrecognized movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(async () => {

        torrentName = 'Movie (unrecognized)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedMoviePath = Path.join(Configuration.path.failed, 'Fart Farter 1970.mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.failed)
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

        torrentName = 'Episodes'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)

        processedSeriesPath1 = Path.join(Configuration.path.library.from.series, 'South Park')
        processedSeasonPath1 = Path.join(processedSeriesPath1, 'Season 22')
        processedEpisodePath1 = Path.join(processedSeasonPath1, 'South Park - 22x05 - The Scoots.mp4')

        processedSeriesPath2 = Path.join(Configuration.path.library.from.series, 'Will & Grace')
        processedSeasonPath2 = Path.join(processedSeriesPath2, 'Season 10')
        processedEpisodePath2 = Path.join(processedSeasonPath2, 'Will & Grace - 10x07 - So Long, Division.mp4')

        processedSeriesPath3 = Path.join(Configuration.path.library.from.series, 'Leah Remini Scientology and the Aftermath')
        processedSeasonPath3 = Path.join(processedSeriesPath3, 'Season 0')
        processedEpisodePath3 = Path.join(processedSeasonPath3, 'Leah Remini Scientology and the Aftermath - 0x12 - The Jehovah\'s Witnesses.mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(processedEpisodePath1, FileSystem.F_OK)
      })
    
      it('should create the correct file', async () => {
        await FileSystem.access(processedEpisodePath2, FileSystem.F_OK)
      })
    
      it('should create the correct file', async () => {
        await FileSystem.access(processedEpisodePath3, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

    describe('(when passing an unrecognized series)', () => {

      let torrentName = null
      let torrentPath = null
      let failedSeriesPath = null

      before(async () => {

        torrentName = 'Series (unrecognized)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedSeriesPath = Path.join(Configuration.path.failed, 'Fart.Farter.S22E05.720p.HDTV.x264-AVS.mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(failedSeriesPath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an unrecognized episode)', () => {

      let torrentName = null
      let torrentPath = null
      let failedEpisodePath = null

      before(async () => {

        torrentName = 'Episode (unrecognized)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedEpisodePath = Path.join(Configuration.path.failed, 'South.Park.S321E123.mp4')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(failedEpisodePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an archive)', () => {

      let torrentName = null
      let torrentPath = null
      let processedArchivePath = null

      before(async () => {

        torrentName = 'Archive'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        processedArchivePath = Path.join(Configuration.path.processed, 'Sleeping Beauties by Stephen King.zip')

        await Torrent.createTorrent(torrentPath).process()

      })

      it('should create the correct file', async () => {
        await FileSystem.access(processedArchivePath, FileSystem.F_OK)
      })
    
      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })
  
    })

  })

  describe('transfer()', () => {

    describe('(when called)', () => {

      before(async () => {

        await FileSystem.mkdir(Configuration.path.library.to, { 'recursive': true })

        await Torrent.transfer()

      })

      for (let fromPath of Object.values(Configuration.path.library.from)) {

        it(`should create '${Path.trim(fromPath)}'`, async () => {
          await FileSystem.access(fromPath, FileSystem.F_OK)
        })

      }

      after(async () => {
        await FileSystem.remove(Configuration.path.processed)
      })

    })

    for (let fromPath of Object.values(Configuration.path.library.from)) {

      describe(`(when called with content in '${Path.basename(fromPath)}')`, () => {

        let contentFromPath = null
        let contentToPath = null

        before(async () => {

          contentFromPath = Path.join(fromPath, `${Process.pid}.pid`)
          contentToPath = Path.join(Configuration.path.library.to, Path.basename(fromPath), `${Process.pid}.pid`)
  
          await FileSystem.mkdir(Path.dirname(contentFromPath), { 'recursive': true })
          await FileSystem.writeFile(contentFromPath, Process.pid, { 'encoding': 'utf-8' })

          await FileSystem.mkdir(Configuration.path.library.to, { 'recursive': true })

          await Torrent.transfer()
  
        })
  
        it('should create the correct file', async () => {
          await FileSystem.access(contentToPath, FileSystem.F_OK)
        })

        after(async () => {
          await FileSystem.remove(Configuration.path.processed)
        })

      })

    }

  })

})