import { assert as Assert } from 'chai'
import { FileSystem, Path } from '@virtualpatterns/mablung'
import Shell from 'shelljs'

import Configuration from '../../configuration'
import Connection from '../../library/connection'
import Migration from '../../library/migration'
import Torrent from '../../library/torrent'

describe('torrent', () => {

  describe('(when using a copy of the production database)', () => {

    let administratorConnection = null
    let userConnection = null
  
    before(async () => {
  
      administratorConnection = await Connection.openAdministratorConnection()
      await administratorConnection.createUserDatabase()

      Shell.config.fatal = true
  
      Shell
        .exec('pg_dump --host=RONAN.local --dbname=azog', { 'silent': true })
        .exec(`psql --dbname=${Configuration.connection.user.database}`, { 'silent': true })
  
      userConnection = await Connection.openUserConnection()
      await Migration.installMigrations(userConnection)
  
    })

    describe('process()', () => {

      describe('(when passing text)', () => {
  
        let torrentName = null
        let torrentPath = null
  
        before(() => {
          torrentName = 'Text'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
        })
  
        it('should not throw an error', () => {
          return Torrent.createTorrent(torrentPath, userConnection).process()
        })
      
      })
  
      describe('(when passing a book)', () => {
  
        let torrentName = null
        let torrentPath = null
  
        let resourceFromName = null
        let resourceToName = null
  
        let processedBookPath = null
  
        before(async () => {
  
          torrentName = 'Book'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
  
          resourceFromName = 'Sleeping Beauties by Stephen King'
          resourceToName = resourceFromName
    
          processedBookPath = Path.join(Configuration.path.processed.other, `${resourceToName}.epub`)
  
          await FileSystem.mkdir(Path.dirname(processedBookPath), { 'recursive': true })
          await FileSystem.touch(processedBookPath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedBookPath)).size, 1)
        })
      
        it('should not create a record', async () => {
          Assert.isFalse(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return FileSystem.remove(Configuration.path.processed.other)
        })
    
      })
  
      describe('(when passing music)', () => {
  
        let torrentName = null
        let torrentPath = null
  
        let resourceFromName1 = null
        let resourceToName1 = null
  
        let processedArtistPath1 = null
        let processedAlbumPath1 = null
        let processedSongPath1 = null
  
        let resourceFromName2 = null
        let resourceToName2 = null
  
        let processedArtistPath2 = null
        let processedAlbumPath2 = null
        let processedSongPath2 = null
  
        before(async () => {
  
          torrentName = 'Music'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
  
          resourceFromName1 = '26 - Bold as Love'
          resourceToName1 = '26 Bold as Love'
    
          processedArtistPath1 = Path.join(Configuration.path.processed.music, 'The Jimi Hendrix Experience')
          processedAlbumPath1 = Path.join(processedArtistPath1, 'Axis Bold as Love')
          processedSongPath1 = Path.join(processedAlbumPath1, `${resourceToName1}.mp3`)
  
          await FileSystem.mkdir(Path.dirname(processedSongPath1), { 'recursive': true })
          await FileSystem.touch(processedSongPath1)
  
          resourceFromName2 = '26 - Bold as Love'
          resourceToName2 = '01 World In My Eyes'
    
          processedArtistPath2 = Path.join(Configuration.path.processed.music, 'Depeche Mode')
          processedAlbumPath2 = Path.join(processedArtistPath2, 'Violator')
          processedSongPath2 = Path.join(processedAlbumPath2, `${resourceToName2}.mp3`)
  
          await FileSystem.mkdir(Path.dirname(processedSongPath2), { 'recursive': true })
          await FileSystem.touch(processedSongPath2)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedSongPath1)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName1, resourceToName1))
        })
      
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedSongPath2)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName2, resourceToName2))
        })
      
        after(() => {
          return Promise.all([
            userConnection.deleteResource(resourceFromName1, resourceToName1),
            userConnection.deleteResource(resourceFromName2, resourceToName2),
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
  
          return Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create an empty file', async () => {
          Assert.equal((await FileSystem.stat(failedSongPath)).size, 0)
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
  
        before(async () => {
  
          torrentName = 'Movie'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName = 'The.Equalizer.2.2018.720p.WEBRip.x264-[YTS.AM]'
          resourceToName = 'The Equalizer 2 (2018)'
    
          processedMoviePath = Path.join(Configuration.path.processed.movie, `${resourceToName}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedMoviePath), { 'recursive': true })
          await FileSystem.touch(processedMoviePath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedMoviePath)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return Promise.all([
            userConnection.deleteResource(resourceFromName, resourceToName),
            FileSystem.remove(Configuration.path.processed.movie)
          ])
        })
    
      })
  
      describe('(when passing a movie with no year released)', () => {
  
        let torrentName = null
        let torrentPath = null
        let processedMoviePath = null
  
        before(async () => {
  
          torrentName = 'Movie (no year released)'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
          processedMoviePath = Path.join(Configuration.path.processed.movie, 'They Shall Not Grow Old (2018).mp4')
  
          await FileSystem.mkdir(Path.dirname(processedMoviePath), { 'recursive': true })
          await FileSystem.touch(processedMoviePath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedMoviePath)).size, 1)
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
  
        before(async () => {
  
          torrentName = 'Movie (incorrect year released)'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName = 'Under.the.Silver.Lake.2017.1080p.WEB-DL.H264.AC3-EVO[EtHD]'
          resourceToName = 'Under the Silver Lake (2018)'
    
          processedMoviePath = Path.join(Configuration.path.processed.movie, `${resourceToName}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedMoviePath), { 'recursive': true })
          await FileSystem.touch(processedMoviePath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedMoviePath)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return Promise.all([
            userConnection.deleteResource(resourceFromName, resourceToName),
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
  
          return Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(failedMoviePath)).size, 1)
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
  
          return Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create an empty file', async () => {
          Assert.equal((await FileSystem.stat(failedMoviePath)).size, 0)
        })
      
        after(() => {
          return FileSystem.remove(Configuration.path.failed)
        })
    
      })
  
      describe('(when passing an unrecognized movie)', () => {
  
        let torrentName = null
        let torrentPath = null
  
        let resourceFromName = null
        let resourceToName = null
  
        let processedMoviePath = null
  
        before(async () => {
  
          torrentName = 'Movie (unrecognized)'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName = 'Fart Farter 1970'
          resourceToName = resourceFromName
    
          processedMoviePath = Path.join(Configuration.path.processed.movie, `${resourceToName}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedMoviePath), { 'recursive': true })
          await FileSystem.touch(processedMoviePath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedMoviePath)).size, 1)
        })
      
        it('should not create a record', async () => {
          Assert.isFalse(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return FileSystem.remove(Configuration.path.processed.movie)
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
  
        before(async () => {
  
          torrentName = 'Episodes'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName1 = 'South.Park.S22E05.720p.HDTV.x264-AVS'
          resourceToName1 = 'South Park - 22x05 - The Scoots'
    
          processedSeriesPath1 = Path.join(Configuration.path.processed.episode, 'South Park')
          processedSeasonPath1 = Path.join(processedSeriesPath1, 'Season 22')
          processedEpisodePath1 = Path.join(processedSeasonPath1, `${resourceToName1}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedEpisodePath1), { 'recursive': true })
          await FileSystem.touch(processedEpisodePath1)
   
          resourceFromName2 = 'Will.and.Grace.S10E07.720p.HDTV.x264-AVS'
          resourceToName2 = 'Will & Grace - 10x07 - So Long, Division'
    
          processedSeriesPath2 = Path.join(Configuration.path.processed.episode, 'Will & Grace')
          processedSeasonPath2 = Path.join(processedSeriesPath2, 'Season 10')
          processedEpisodePath2 = Path.join(processedSeasonPath2, `${resourceToName2}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedEpisodePath2), { 'recursive': true })
          await FileSystem.touch(processedEpisodePath2)
   
          resourceFromName3 = 'Leah.Remini.Scientology.and.the.Aftermath.S03E00.The.Jehovahs.Witnesses.WEB.h264-TBS[eztv]'
          resourceToName3 = 'Leah Remini Scientology and the Aftermath - 0x12 - The Jehovah\'s Witnesses'

          processedSeriesPath3 = Path.join(Configuration.path.processed.episode, 'Leah Remini Scientology and the Aftermath')
          processedSeasonPath3 = Path.join(processedSeriesPath3, 'Season 0')
          processedEpisodePath3 = Path.join(processedSeasonPath3, `${resourceToName3}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedEpisodePath3), { 'recursive': true })
          await FileSystem.touch(processedEpisodePath3)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedEpisodePath1)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName1, resourceToName1))
        })
      
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedEpisodePath2)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName2, resourceToName2))
        })
      
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedEpisodePath3)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName3, resourceToName3))
        })
      
        after(() => {
          return Promise.all([
            userConnection.deleteResource(resourceFromName1, resourceToName1),
            userConnection.deleteResource(resourceFromName2, resourceToName2),
            userConnection.deleteResource(resourceFromName3, resourceToName3),
            FileSystem.remove(Configuration.path.processed.episode)
          ])
        })
    
      })
  
      describe('(when passing an unrecognized series)', () => {
  
        let torrentName = null
        let torrentPath = null
  
        let resourceFromName = null
        let resourceToName = null
  
        let processedEpisodePath = null
  
        before(async () => {
  
          torrentName = 'Series (unrecognized)'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName = 'Fart.Farter.S22E05.720p.HDTV.x264-AVS'
          resourceToName = resourceFromName
    
          processedEpisodePath = Path.join(Configuration.path.processed.episode, `${resourceToName}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedEpisodePath), { 'recursive': true })
          await FileSystem.touch(processedEpisodePath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedEpisodePath)).size, 1)
        })
      
        it('should not create a record', async () => {
          Assert.isFalse(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return FileSystem.remove(Configuration.path.processed.episode)
        })
    
      })
  
      describe('(when passing an unrecognized episode)', () => {
  
        let torrentName = null
        let torrentPath = null
  
        let resourceFromName = null
        let resourceToName = null
  
        let processedEpisodePath = null
  
        before(async () => {
  
          torrentName = 'Episode (unrecognized)'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName = 'South.Park.S321E123'
          resourceToName = resourceFromName
    
          processedEpisodePath = Path.join(Configuration.path.processed.episode, `${resourceToName}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedEpisodePath), { 'recursive': true })
          await FileSystem.touch(processedEpisodePath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedEpisodePath)).size, 1)
        })
      
        it('should not create a record', async () => {
          Assert.isFalse(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return FileSystem.remove(Configuration.path.processed.episode)
        })
    
      })
  
      describe('(when passing a series with an id)', () => {
  
        let torrentName = null
        let torrentPath = null
  
        let resourceFromName = null
        let resourceToName = null
  
        let processedSeriesPath = null
        let processedSeasonPath = null
        let processedEpisodePath = null
  
        before(async () => {
  
          torrentName = 'Series (id)'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName = 'The.Crown.S03E01.720p.NF.WEBRip.x264-GalaxyTV.id-305574'
          resourceToName = 'The Crown - 3x01 - Olding'
  
          processedSeriesPath = Path.join(Configuration.path.processed.episode, 'The Crown')
          processedSeasonPath = Path.join(processedSeriesPath, 'Season 3')
          processedEpisodePath = Path.join(processedSeasonPath, `${resourceToName}.mp4`)
  
          await FileSystem.mkdir(Path.dirname(processedEpisodePath), { 'recursive': true })
          await FileSystem.touch(processedEpisodePath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedEpisodePath)).size, 1)
        })
      
        it('should create a record', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return Promise.all([
            userConnection.deleteResource(resourceFromName, resourceToName),
            FileSystem.remove(Configuration.path.processed.episode)
          ])
        })
    
      })
  
      describe('(when passing a zip)', () => {
  
        let torrentName = null
        let torrentPath = null
   
        let resourceFromName = null
        let resourceToName = null
  
        let processedZipPath = null
  
        before(async () => {
  
          torrentName = 'Zip'
          torrentPath = Path.join(Configuration.path.downloaded, torrentName)
   
          resourceFromName = 'Sleeping Beauties by Stephen King'
          resourceToName = resourceFromName
    
          processedZipPath = Path.join(Configuration.path.processed.other, `${resourceToName}.epub`)
  
          await FileSystem.mkdir(Path.dirname(processedZipPath), { 'recursive': true })
          await FileSystem.touch(processedZipPath)
  
          await Torrent.createTorrent(torrentPath, userConnection).process()
  
        })
  
        it('should create a non-empty file', async () => {
          Assert.isAtLeast((await FileSystem.stat(processedZipPath)).size, 1)
        })
      
        it('should not create a record', async () => {
          Assert.isFalse(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        after(() => {
          return FileSystem.remove(Configuration.path.processed.other)
        })
    
      })
  
      after(async () => {
  
        await Migration.uninstallMigrations(userConnection)
        await userConnection.close()
      
        await administratorConnection.dropUserDatabase()
        await administratorConnection.close()
    
      })
    
    })
    
  })

})