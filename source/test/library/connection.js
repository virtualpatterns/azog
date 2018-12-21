import { assert as Assert } from 'chai'
import { Path, Process } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'
import Connection from '../../library/connection'
import Migration from '../../library/migration'

describe('connection', () => {
  
  let administratorConnection = null
  let userConnection = null

  before(async () => {

    administratorConnection = await Connection.openAdministratorConnection()
    await administratorConnection.createUserDatabase()

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
  
    after(async () => {
      await userConnection.deleteMigration(existsMigrationPath)
    })
  
  })

  describe('insertMigration(path)', () => {

    let migrationName = Path.join(Configuration.path.migration.distributable, `${Process.pid} - insertMigration.js`)

    before(async () => {
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

      it('inserted should not be null', async () => {
        Assert.isNotNull(migration.inserted)
      })

      it('deleted should be null', async () => {
        Assert.isNull(migration.deleted)
      })

    })

    after(async () => {
      await userConnection.deleteMigration(migrationName)
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

      it('inserted should not be null', async () => {
        Assert.isNotNull(migration.inserted)
      })

      it('deleted should not be null', async () => {
        Assert.isNotNull(migration.deleted)
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

      it('inserted should not be null', async () => {
        Assert.isNotNull(migration.inserted)
      })

      it('deleted should be null', async () => {
        Assert.isNull(migration.deleted)
      })

    })

    after(async () => {
      await userConnection.deleteMigration(migrationName)
    })
  
  })

  describe('existsResource(fromName, toName)', () => {

    let existsResourceFromName = `${Process.pid}.existsResource`
    let existsResourceToName = 'existsResource'

    let notExistsResourceFromName = `${Process.pid}.notExistsResource`
    let notExistsResourceToName = 'notExistsResource'

    before(async () => {
      await userConnection.insertResource(existsResourceFromName, existsResourceToName)
    })
  
    it('should exist', async () => {
      Assert.isTrue(await userConnection.existsResource(existsResourceFromName, existsResourceToName))
    })
  
    it('should not exist', async () => {
      Assert.isFalse(await userConnection.existsResource(notExistsResourceFromName, notExistsResourceToName))
    })
  
    after(async () => {
      await userConnection.deleteResource(existsResourceFromName, existsResourceToName)
    })
  
  })

  describe('insertResource(fromName, toName)', () => {

    let resourceFromName = `${Process.pid}.insertResource`
    let resourceToName = 'insertResource'

    before(async () => {
      await userConnection.insertResource(resourceFromName, resourceToName)
    })
  
    it('should exist', async () => {
      Assert.isTrue(await userConnection.existsResource(resourceFromName, resourceToName))
    })
  
    describe('selectResource(fromName, toName)', () => {

      let resource = null

      before(async () => {
        resource = await userConnection.selectResource(resourceFromName, resourceToName)
      })

      it('inserted should not be null', async () => {
        Assert.isNotNull(resource.inserted)
      })

      it('deleted should be null', async () => {
        Assert.isNull(resource.deleted)
      })

    })

    after(async () => {
      await userConnection.deleteResource(resourceFromName, resourceToName)
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

      it('inserted should not be null', async () => {
        Assert.isNotNull(resource.inserted)
      })

      it('deleted should not be null', async () => {
        Assert.isNotNull(resource.deleted)
      })

    })

  })

  describe('insert(delete\'d)Resource(fromName, toName)', () => {

    let resourceFromName = `${Process.pid}.insert(delete'd)Resource`
    let resourceToName = 'insert(delete\'d)Resource'

    before(async () => {
      await userConnection.insertResource(resourceFromName, resourceToName)
      await userConnection.deleteResource(resourceFromName, resourceToName)
      await userConnection.insertResource(resourceFromName, resourceToName)
    })
  
    it('should exist', async () => {
      Assert.isTrue(await userConnection.existsResource(resourceFromName, resourceToName))
    })
  
    describe('selectResource(path)', () => {

      let resource = null

      before(async () => {
        resource = await userConnection.selectResource(resourceFromName, resourceToName)
      })

      it('inserted should not be null', async () => {
        Assert.isNotNull(resource.inserted)
      })

      it('deleted should be null', async () => {
        Assert.isNull(resource.deleted)
      })

    })

    after(async () => {
      await userConnection.deleteResource(resourceFromName, resourceToName)
    })
  
  })

  after(async () => {

    await Migration.uninstallMigrations(userConnection)
    await userConnection.close()
  
    await administratorConnection.dropUserDatabase()
    await administratorConnection.close()

  })

})
