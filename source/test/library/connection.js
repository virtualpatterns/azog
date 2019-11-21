import { assert as Assert } from 'chai'
import { Path, Process } from '@virtualpatterns/mablung'
import Shell from 'shelljs'

import Configuration from '../../configuration'
import Connection from '../../library/connection'
import Migration from '../../library/migration'

describe('connection', () => {

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

    describe('existsTable(name)', () => {

      it('should exist', async () => {
        Assert.isTrue(await userConnection.existsTable('pg_class'))
      })
    
      it('should not exist', async () => {
        Assert.isFalse(await userConnection.existsTable('ssalc_gp'))
      })
    
    })

    describe('(migration)', () => {

      describe('existsMigration(path)', () => {

        let existsMigrationPath = Path.join(Configuration.path.migration.distributable, `${Process.pid} - existsMigration.js`)
        let notExistsMigrationPath = Path.join(Configuration.path.migration.distributable, `${Process.pid} - notExistsMigration.js`)

        before(async () => {
          await userConnection.insertMigration(existsMigrationPath)
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsMigration(existsMigrationPath))
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsMigration(notExistsMigrationPath))
        })
      
        after(() => {
          return userConnection.deleteMigration(existsMigrationPath)
        })
      
      })

      describe('insertMigration(path)', () => {

        let migrationName = Path.join(Configuration.path.migration.distributable, `${Process.pid} - insertMigration.js`)

        before(() => {
          return userConnection.insertMigration(migrationName)
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsMigration(migrationName))
        })
      
        describe('selectMigration(path)', () => {

          let migration = null

          before(async () => {
            migration = await userConnection.selectMigration(migrationName)
          })

          it('inserted should not be null', () => {
            Assert.exists(migration.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(migration.deleted)
          })

        })

        after(() => {
          return userConnection.deleteMigration(migrationName)
        })
      
      })

      describe('deleteMigration(path)', () => {

        let migrationName = Path.join(Configuration.path.migration.distributable, `${Process.pid} - deleteMigration.js`)

        before(async () => {
          await userConnection.insertMigration(migrationName)
          await userConnection.deleteMigration(migrationName)
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsMigration(migrationName))
        })
      
        describe('selectMigration(path)', () => {

          let migration = null

          before(async () => {
            migration = await userConnection.selectMigration(migrationName)
          })

          it('inserted should not be null', () => {
            Assert.exists(migration.inserted)
          })

          it('deleted should not be null', () => {
            Assert.exists(migration.deleted)
          })

        })

      })

      describe('insert(delete\'d)Migration(path)', () => {

        let migrationName = Path.join(Configuration.path.migration.distributable, `${Process.pid} - insert(delete'd)Migration.js`)

        before(async () => {
          await userConnection.insertMigration(migrationName)
          await userConnection.deleteMigration(migrationName)
          await userConnection.insertMigration(migrationName)
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsMigration(migrationName))
        })
      
        describe('selectMigration(path)', () => {

          let migration = null

          before(async () => {
            migration = await userConnection.selectMigration(migrationName)
          })

          it('inserted should not be null', () => {
            Assert.exists(migration.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(migration.deleted)
          })

        })

        after(() => {
          return userConnection.deleteMigration(migrationName)
        })
      
      })

    })

    describe('(resource)', () => {

      describe('existsResource(fromName, toName)', () => {

        let existsResourceFromName = `${Process.pid}.existsResource`
        let existsResourceToName = 'existsResource'

        before(() => {
          return userConnection.insertResource(existsResourceFromName, existsResourceToName)
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsResource(existsResourceFromName, existsResourceToName))
        })
      
        after(() => {
          return userConnection.deleteResource(existsResourceFromName, existsResourceToName)
        })
      
      })

      describe('insertResource(fromName, toName)', () => {

        let resourceFromName = `${Process.pid}.insertResource`
        let resourceToName = 'insertResource'

        let unchangedResourceFromName = 'unchangedResource'
        let unchangedResourceToName = unchangedResourceFromName

        before(() => {
          return Promise.all([
            userConnection.insertResource(resourceFromName, resourceToName),
            userConnection.insertResource(unchangedResourceFromName, unchangedResourceToName)
          ])
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName, resourceToName))
        })

        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsResource(unchangedResourceFromName, unchangedResourceToName))
        })
            
        describe('selectResource(fromName, toName)', () => {

          let resource = null
          let unchangedResource = null

          before(async () => {
            resource = await userConnection.selectResource(resourceFromName, resourceToName)
            unchangedResource = await userConnection.selectResource(unchangedResourceFromName, unchangedResourceToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(resource.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(resource.deleted)
          })

          it('inserted should not be null', () => {
            Assert.exists(unchangedResource.inserted)
          })

          it('deleted should not be null', () => {
            Assert.exists(unchangedResource.deleted)
          })

        })

        after(() => {
          return userConnection.deleteResource(resourceFromName, resourceToName)
        })
      
      })

      describe('deleteResource(fromName, toName)', () => {

        let resourceFromName = `${Process.pid}.deleteResource`
        let resourceToName = 'deleteResource'

        before(async () => {
          await userConnection.insertResource(resourceFromName, resourceToName)
          await userConnection.deleteResource(resourceFromName, resourceToName)
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        describe('selectResource(fromName, toName)', () => {

          let resource = null

          before(async () => {
            resource = await userConnection.selectResource(resourceFromName, resourceToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(resource.inserted)
          })

          it('deleted should not be null', () => {
            Assert.exists(resource.deleted)
          })

        })

      })

      describe('insert(delete\'d)Resource(fromName, toName)', () => {

        let deletedResourceFromName = `${Process.pid}.deletedResource`
        let deletedResourceToName = 'deletedResource'

        let unchangedResourceFromName = 'unchangedResource'
        let unchangedResourceToName = unchangedResourceFromName

        let resourceFromName = `${Process.pid}.insert(delete'd)Resource`
        let resourceToName = 'insert(delete\'d)Resource'

        before(async () => {

          await userConnection.insertResource(deletedResourceFromName, deletedResourceToName)
          await userConnection.deleteResource(deletedResourceFromName, deletedResourceToName)

          await userConnection.insertResource(unchangedResourceFromName, unchangedResourceToName)
          await userConnection.deleteResource(unchangedResourceFromName, unchangedResourceToName)
          await userConnection.insertResource(unchangedResourceFromName, unchangedResourceToName)

          await userConnection.insertResource(resourceFromName, resourceToName)
          await userConnection.deleteResource(resourceFromName, resourceToName)
          await userConnection.insertResource(resourceFromName, resourceToName)

        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsResource(deletedResourceFromName, deletedResourceToName))
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsResource(unchangedResourceFromName, unchangedResourceToName))
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsResource(resourceFromName, resourceToName))
        })
      
        describe('selectResource(fromName, toName)', () => {

          let resource = null

          before(async () => {
            resource = await userConnection.selectResource(resourceFromName, resourceToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(resource.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(resource.deleted)
          })

        })

        after(() => {
          return userConnection.deleteResource(resourceFromName, resourceToName)
        })
      
      })

    })

    describe('(movie)', () => {

      let title = 'movieTitle'
      let yearReleased = new Date().getFullYear()

      describe('insertMovie(fromName, toName, ...)', () => {

        let movieFromName = `${Process.pid}.insertMovie`
        let movieToName = 'insertMovie'

        let unchangedMovieFromName = 'unchangedMovie'
        let unchangedMovieToName = unchangedMovieFromName

        before(() => {
          return Promise.all([
            userConnection.insertMovie(movieFromName, movieToName, title, yearReleased),
            userConnection.insertMovie(unchangedMovieFromName, unchangedMovieToName, title, yearReleased)
          ])
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsMovie(movieFromName, movieToName))
        })
       
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsMovie(unchangedMovieFromName, unchangedMovieToName))
        })
     
        describe('selectMovie(fromName, toName)', () => {

          let movie = null

          before(async () => {
            movie = await userConnection.selectMovie(movieFromName, movieToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(movie.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(movie.deleted)
          })

          it(`title should be '${title}'`, () => {
            Assert.equal(movie.title, title)
          })

          it(`yearReleased should be ${yearReleased}`, () => {
            Assert.equal(movie.yearReleased, yearReleased)
          })

        })

        after(() => {
          return userConnection.deleteMovie(movieFromName, movieToName)
        })
      
      })

      describe('deleteMovie(fromName, toName)', () => {

        let movieFromName = `${Process.pid}.deleteMovie`
        let movieToName = 'deleteMovie'

        before(async () => {
          await userConnection.insertMovie(movieFromName, movieToName, title, yearReleased)
          await userConnection.deleteMovie(movieFromName, movieToName)
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsMovie(movieFromName, movieToName))
        })
      
        describe('selectMovie(fromName, toName)', () => {

          let movie = null

          before(async () => {
            movie = await userConnection.selectMovie(movieFromName, movieToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(movie.inserted)
          })

          it('deleted should not be null', () => {
            Assert.exists(movie.deleted)
          })

        })

      })

      describe('insert(delete\'d)Movie(fromName, toName)', () => {

        let deletedMovieFromName = `${Process.pid}.deletedMovie`
        let deletedMovieToName = 'deletedMovie'

        let unchangedMovieFromName = 'unchangedMovie'
        let unchangedMovieToName = unchangedMovieFromName

        let movieFromName = `${Process.pid}.insert(delete'd)Movie`
        let movieToName = 'insert(delete\'d)Movie'

        before(async () => {

          await userConnection.insertMovie(deletedMovieFromName, deletedMovieToName, title, yearReleased)
          await userConnection.deleteMovie(deletedMovieFromName, deletedMovieToName)

          await userConnection.insertMovie(unchangedMovieFromName, unchangedMovieToName, title, yearReleased)
          await userConnection.deleteMovie(unchangedMovieFromName, unchangedMovieToName)
          await userConnection.insertMovie(unchangedMovieFromName, unchangedMovieToName, title, yearReleased)

          await userConnection.insertMovie(movieFromName, movieToName, title, yearReleased)
          await userConnection.deleteMovie(movieFromName, movieToName)
          await userConnection.insertMovie(movieFromName, movieToName, title, yearReleased)

        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsMovie(deletedMovieFromName, deletedMovieToName))
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsMovie(unchangedMovieFromName, unchangedMovieToName))
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsMovie(movieFromName, movieToName))
        })
      
        describe('selectMovie(fromName, toName)', () => {

          let movie = null

          before(async () => {
            movie = await userConnection.selectMovie(movieFromName, movieToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(movie.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(movie.deleted)
          })

        })

        after(() => {
          return userConnection.deleteMovie(movieFromName, movieToName)
        })
      
      })

    })

    describe('(episode)', () => {

      let id = 1234
      let seriesTitle = 'seriesTitle'
      let yearReleased = new Date().getFullYear()
      let dateAired = new Date('1973-05-28')
      let seasonNumber = 1
      let episodeNumber = 2
      let episodeTitle = 'episodeTitle'

      describe('insertEpisode(fromName, toName, ...)', () => {

        let episodeFromName = `${Process.pid}.insertEpisode`
        let episodeToName = 'insertEpisode'

        let unchangedEpisodeFromName = 'unchangedEpisode'
        let unchangedEpisodeToName = unchangedEpisodeFromName

        before(() => {
          return Promise.all([
            userConnection.insertEpisode(episodeFromName, episodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle),
            userConnection.insertEpisode(unchangedEpisodeFromName, unchangedEpisodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)
          ])
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsEpisode(episodeFromName, episodeToName))
        })
       
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsEpisode(unchangedEpisodeFromName, unchangedEpisodeToName))
        })
     
        describe('selectEpisode(fromName, toName)', () => {

          let episode = null

          before(async () => {
            episode = await userConnection.selectEpisode(episodeFromName, episodeToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(episode.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(episode.deleted)
          })

          it(`id should be ${id}`, () => {
            Assert.equal(episode.id, id)
          })

          it(`seriesTitle should be '${seriesTitle}'`, () => {
            Assert.equal(episode.seriesTitle, seriesTitle)
          })

          it(`yearReleased should be ${yearReleased}`, () => {
            Assert.equal(episode.yearReleased, yearReleased)
          })

          // it(`dateAired should be ${dateAired}`, () => {
          //   Assert.equal(episode.dateAired, dateAired)
          // })

          it(`seasonNumber should be ${seasonNumber}`, () => {
            Assert.equal(episode.seasonNumber, seasonNumber)
          })

          it(`episodeNumber should be ${episodeNumber}`, () => {
            Assert.equal(episode.episodeNumber, episodeNumber)
          })

          it(`episodeTitle should be '${episodeTitle}'`, () => {
            Assert.equal(episode.episodeTitle, episodeTitle)
          })

        })

        after(() => {
          return userConnection.deleteEpisode(episodeFromName, episodeToName)
        })
      
      })

      describe('deleteEpisode(fromName, toName)', () => {

        let episodeFromName = `${Process.pid}.deleteEpisode`
        let episodeToName = 'deleteEpisode'

        before(async () => {
          await userConnection.insertEpisode(episodeFromName, episodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)
          await userConnection.deleteEpisode(episodeFromName, episodeToName)
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsEpisode(episodeFromName, episodeToName))
        })
      
        describe('selectEpisode(fromName, toName)', () => {

          let episode = null

          before(async () => {
            episode = await userConnection.selectEpisode(episodeFromName, episodeToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(episode.inserted)
          })

          it('deleted should not be null', () => {
            Assert.exists(episode.deleted)
          })

        })

      })

      describe('insert(delete\'d)Episode(fromName, toName)', () => {

        let deletedEpisodeFromName = `${Process.pid}.deletedEpisode`
        let deletedEpisodeToName = 'deletedEpisode'

        let unchangedEpisodeFromName = 'unchangedEpisode'
        let unchangedEpisodeToName = unchangedEpisodeFromName

        let episodeFromName = `${Process.pid}.insert(delete'd)Episode`
        let episodeToName = 'insert(delete\'d)Episode'

        before(async () => {

          await userConnection.insertEpisode(deletedEpisodeFromName, deletedEpisodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)
          await userConnection.deleteEpisode(deletedEpisodeFromName, deletedEpisodeToName)

          await userConnection.insertEpisode(unchangedEpisodeFromName, unchangedEpisodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)
          await userConnection.deleteEpisode(unchangedEpisodeFromName, unchangedEpisodeToName)
          await userConnection.insertEpisode(unchangedEpisodeFromName, unchangedEpisodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)

          await userConnection.insertEpisode(episodeFromName, episodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)
          await userConnection.deleteEpisode(episodeFromName, episodeToName)
          await userConnection.insertEpisode(episodeFromName, episodeToName, id, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle)

        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsEpisode(deletedEpisodeFromName, deletedEpisodeToName))
        })
      
        it('should not exist', async () => {
          Assert.isFalse(await userConnection.existsEpisode(unchangedEpisodeFromName, unchangedEpisodeToName))
        })
      
        it('should exist', async () => {
          Assert.isTrue(await userConnection.existsEpisode(episodeFromName, episodeToName))
        })
      
        describe('selectEpisode(fromName, toName)', () => {

          let episode = null

          before(async () => {
            episode = await userConnection.selectEpisode(episodeFromName, episodeToName)
          })

          it('inserted should not be null', () => {
            Assert.exists(episode.inserted)
          })

          it('deleted should be null', () => {
            Assert.isNull(episode.deleted)
          })

        })

        after(() => {
          return userConnection.deleteEpisode(episodeFromName, episodeToName)
        })
      
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
