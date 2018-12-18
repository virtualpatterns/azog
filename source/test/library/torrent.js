import { assert as Assert } from 'chai'
import { FileSystem, Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'
import Connection from '../../library/connection'
import Migration from '../../library/migration'
import Torrent from '../../library/torrent'

describe('torrent', () => {

  describe('process()', () => {

    let connection = null

    before(async () => {
      connection = await Connection.openConnection({ 'database': 'azog-torrent' })
      await Migration.installMigrations(connection)
    })
  
    describe('(when passing text)', () => {

      let torrentName = null
      let torrentPath = null

      before(() => {
        torrentName = 'Text'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
      })

      it('should not throw an error', () => {
        return Torrent.createTorrent(torrentPath).process(connection)
      })
    
    })

    describe('(when passing a book)', () => {

      let torrentName = null
      let torrentPath = null

      let resourceFromName = null
      let resourceToName = null

      let processedBookPath = null

      before(() => {

        torrentName = 'Book'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)

        resourceFromName = 'Sleeping Beauties by Stephen King'
        resourceToName = resourceFromName
  
        processedBookPath = Path.join(Configuration.path.processed.other, `${resourceToName}.epub`)

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(processedBookPath, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      after(() => {
        return Promise.all([
          connection.deleteResource(resourceFromName, resourceToName),
          FileSystem.remove(Configuration.path.processed.other)
        ])
      })
  
    })

    describe('(when passing music)', () => {

      let torrentName = null
      let torrentPath = null

      let resourceFromName = null
      let resourceToName = null

      let processedArtistPath = null
      let processedAlbumPath = null
      let processedSongPath = null

      before(() => {

        torrentName = 'Music'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)

        resourceFromName = '26 - Bold as Love'
        resourceToName = '26 Bold as Love'
  
        processedArtistPath = Path.join(Configuration.path.processed.music, 'The Jimi Hendrix Experience')
        processedAlbumPath = Path.join(processedArtistPath, 'Axis Bold as Love')
        processedSongPath = Path.join(processedAlbumPath, `${resourceToName}.mp3`)

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(processedSongPath, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      after(() => {
        return Promise.all([
          connection.deleteResource(resourceFromName, resourceToName),
          FileSystem.remove(Configuration.path.processed.music)
        ])
      })
  
    })

    describe('(when passing invalid music)', () => {

      let torrentName = null
      let torrentPath = null
      let failedSongPath = null

      before(() => {

        torrentName = 'Music (invalid music)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedSongPath = Path.join(Configuration.path.failed, '01 Song.flac')

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(failedSongPath, FileSystem.F_OK)
      })
    
      after(() => {
        return FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing a movie)', () => {

      let torrentName = null
      let torrentPath = null

      let resourceFromName = null
      let resourceToName = null

      let processedMoviePath = null

      before(() => {

        torrentName = 'Movie'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
 
        resourceFromName = 'The.Equalizer.2.2018.720p.WEBRip.x264-[YTS.AM]'
        resourceToName = 'The Equalizer 2 (2018)'
  
        processedMoviePath = Path.join(Configuration.path.processed.movie, `${resourceToName}.mp4`)

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      after(() => {
        return Promise.all([
          connection.deleteResource(resourceFromName, resourceToName),
          FileSystem.remove(Configuration.path.processed.movie)
        ])
      })
  
    })

    describe('(when passing a movie with no year released)', () => {

      let torrentName = null
      let torrentPath = null
      let processedMoviePath = null

      before(() => {

        torrentName = 'Movie (no year released)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        processedMoviePath = Path.join(Configuration.path.processed.movie, 'They Shall Not Grow Old (2018).mp4')

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      after(() => {
        return FileSystem.remove(Configuration.path.processed.movie)
      })
  
    })

    describe('(when passing a movie with the incorrect year released)', () => {

      let torrentName = null
      let torrentPath = null

      let resourceFromName = null
      let resourceToName = null

      let processedMoviePath = null

      before(() => {

        torrentName = 'Movie (incorrect year released)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
 
        resourceFromName = 'Under.the.Silver.Lake.2017.1080p.WEB-DL.H264.AC3-EVO[EtHD]'
        resourceToName = 'Under the Silver Lake (2018)'
  
        processedMoviePath = Path.join(Configuration.path.processed.movie, `${resourceToName}.mp4`)

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(processedMoviePath, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      after(() => {
        return Promise.all([
          connection.deleteResource(resourceFromName, resourceToName),
          FileSystem.remove(Configuration.path.processed.movie)
        ])
      })
  
    })

    describe('(when passing a short movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(() => {

        torrentName = 'Movie (short)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedMoviePath = Path.join(Configuration.path.failed, 'Jonathan.2018.1080p.WEB-DL.DD5.1.H264-FGT.mp4')

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(() => {
        return FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an invalid movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(() => {

        torrentName = 'Movie (invalid)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedMoviePath = Path.join(Configuration.path.failed, 'The.Equalizer.2.2018.720p.WEBRip.x264-[YTS.AM].mkv')

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(() => {
        return FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an unrecognized movie)', () => {

      let torrentName = null
      let torrentPath = null
      let failedMoviePath = null

      before(() => {

        torrentName = 'Movie (unrecognized)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedMoviePath = Path.join(Configuration.path.failed, 'Fart Farter 1970.mp4')

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(failedMoviePath, FileSystem.F_OK)
      })
    
      after(() => {
        return FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing 3 episodes)', () => {

      let torrentName = null
      let torrentPath = null

      let resourceFromName1 = null
      let resourceToName1 = null

      let processedSeriesPath1 = null
      let processedSeasonPath1 = null
      let processedEpisodePath1 = null

      let resourceFromName2 = null
      let resourceToName2 = null

      let processedSeriesPath2 = null
      let processedSeasonPath2 = null
      let processedEpisodePath2 = null

      let resourceFromName3 = null
      let resourceToName3 = null

      let processedSeriesPath3 = null
      let processedSeasonPath3 = null
      let processedEpisodePath3 = null

      before(() => {

        torrentName = 'Episodes'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
 
        resourceFromName1 = 'South.Park.S22E05.720p.HDTV.x264-AVS'
        resourceToName1 = 'South Park - 22x05 - The Scoots'
  
        processedSeriesPath1 = Path.join(Configuration.path.processed.episode, 'South Park')
        processedSeasonPath1 = Path.join(processedSeriesPath1, 'Season 22')
        processedEpisodePath1 = Path.join(processedSeasonPath1, `${resourceToName1}.mp4`)
 
        resourceFromName2 = 'Will.and.Grace.S10E07.720p.HDTV.x264-AVS'
        resourceToName2 = 'Will & Grace - 10x07 - So Long, Division'
  
        processedSeriesPath2 = Path.join(Configuration.path.processed.episode, 'Will & Grace')
        processedSeasonPath2 = Path.join(processedSeriesPath2, 'Season 10')
        processedEpisodePath2 = Path.join(processedSeasonPath2, `${resourceToName2}.mp4`)
 
        resourceFromName3 = 'Leah.Remini.Scientology.and.the.Aftermath.S03E00.The.Jehovahs.Witnesses.WEB.h264-TBS[eztv]'
        resourceToName3 = 'Leah Remini Scientology and the Aftermath - 0x12 - The Jehovah\'s Witnesses'
  
        processedSeriesPath3 = Path.join(Configuration.path.processed.episode, 'Leah Remini Scientology and the Aftermath')
        processedSeasonPath3 = Path.join(processedSeriesPath3, 'Season 0')
        processedEpisodePath3 = Path.join(processedSeasonPath3, `${resourceToName3}.mp4`)

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(processedEpisodePath1, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName1, resourceToName1))
      })
    
      it('should create the correct file', () => {
        return FileSystem.access(processedEpisodePath2, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName2, resourceToName2))
      })
    
      it('should create the correct file', () => {
        return FileSystem.access(processedEpisodePath3, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName3, resourceToName3))
      })
    
      after(() => {
        return Promise.all([
          connection.deleteResource(resourceFromName1, resourceToName1),
          connection.deleteResource(resourceFromName2, resourceToName2),
          connection.deleteResource(resourceFromName3, resourceToName3),
          FileSystem.remove(Configuration.path.processed.episode)
        ])
      })
  
    })

    describe('(when passing an unrecognized episode)', () => {

      let torrentName = null
      let torrentPath = null
      let failedSeriesPath = null

      before(() => {

        torrentName = 'Series (unrecognized)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedSeriesPath = Path.join(Configuration.path.failed, 'Fart.Farter.S22E05.720p.HDTV.x264-AVS.mp4')

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(failedSeriesPath, FileSystem.F_OK)
      })
    
      after(() => {
        return FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an unrecognized episode)', () => {

      let torrentName = null
      let torrentPath = null
      let failedEpisodePath = null

      before(() => {

        torrentName = 'Episode (unrecognized)'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        failedEpisodePath = Path.join(Configuration.path.failed, 'South.Park.S321E123.mp4')

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(failedEpisodePath, FileSystem.F_OK)
      })
    
      after(() => {
        return FileSystem.remove(Configuration.path.failed)
      })
  
    })

    describe('(when passing an archive)', () => {

      let torrentName = null
      let torrentPath = null
 
      let resourceFromName = null
      let resourceToName = null

      let processedArchivePath = null

      before(() => {

        torrentName = 'Archive'
        torrentPath = Path.join(Configuration.path.downloaded, torrentName)
 
        resourceFromName = 'Sleeping Beauties by Stephen King'
        resourceToName = resourceFromName
  
        processedArchivePath = Path.join(Configuration.path.processed.other, `${resourceToName}.zip`)

        return Torrent.createTorrent(torrentPath).process(connection)

      })

      it('should create the correct file', () => {
        return FileSystem.access(processedArchivePath, FileSystem.F_OK)
      })
    
      it('should create the correct record', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      after(() => {
        return Promise.all([
          connection.deleteResource(resourceFromName, resourceToName),
          FileSystem.remove(Configuration.path.processed.other)
        ])
      })
  
    })

    after(async () => {
      await Migration.installMigrations(connection)
      await connection.close()
    })
  
  })

  // describe('transfer()', () => {

  //   describe('(when called)', () => {

  //     before(async () => {

  //       return FileSystem.mkdir(Configuration.path.library.to, { 'recursive': true })

  //       return Torrent.transfer()

  //     })

  //     for (let fromPath of Object.values(Configuration.path.processed)) {

  //       it(`should create '${Path.trim(fromPath)}'`, async () => {
  //         return FileSystem.access(fromPath, FileSystem.F_OK)
  //       })

  //     }

  //     after(async () => {
  //       return FileSystem.remove(Configuration.path.processed)
  //     })

  //   })

  //   for (let fromPath of Object.values(Configuration.path.processed)) {

  //     describe(`(when called with content in '${Path.basename(fromPath)}')`, () => {

  //       let contentFromPath = null
  //       let contentToPath = null

  //       before(async () => {

  //         contentFromPath = Path.join(fromPath, `${Process.pid}.pid`)
  //         contentToPath = Path.join(Configuration.path.library.to, Path.basename(fromPath), `${Process.pid}.pid`)
  
  //         return FileSystem.mkdir(Path.dirname(contentFromPath), { 'recursive': true })
  //         return FileSystem.writeFile(contentFromPath, Process.pid, { 'encoding': 'utf-8' })

  //         return FileSystem.mkdir(Configuration.path.library.to, { 'recursive': true })

  //         return Torrent.transfer()
  
  //       })
  
  //       it('should create the correct file', async () => {
  //         return FileSystem.access(contentToPath, FileSystem.F_OK)
  //       })

  //       after(async () => {
  //         return FileSystem.remove(Configuration.path.processed)
  //       })

  //     })

  //   }

  // })

})