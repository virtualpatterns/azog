import { assert as Assert } from 'chai'
import { Path, Process } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'
import Connection from '../../library/connection'

describe('connection', () => {

  let connection = null

  before(async () => {
    connection = await Connection.openConnection({ 'database': 'azog-connection' })
  })

  describe('existsTable(name)', () => {

    it('should exist', async () => {
      Assert.isTrue(await connection.existsTable('pg_class'))
    })
  
    it('should not exist', async () => {
      Assert.isFalse(await connection.existsTable('ssalc_gp'))
    })
  
  })

  describe('createMigration()', () => {

    before(async () => {
      await connection.createMigration()
    })
  
    it('should exist', async () => {
      Assert.isTrue(await connection.existsTable('migration'))
    })
  
    after(async () => {
      await connection.dropMigration()
    })
  
  })

  describe('dropMigration()', () => {

    before(async () => {
      await connection.createMigration()
      await connection.dropMigration()
    })
  
    it('should not exist', async () => {
      Assert.isFalse(await connection.existsTable('migration'))
    })
  
  })

  describe('existsMigration(path), etc.', () => {

    before(async () => {
      await connection.createMigration()
    })
  
    describe('existsMigration(path)', () => {

      let existsMigrationPath = Path.join(Configuration.path.migration.distributable, `${Process.pid} - existsMigration.js`)
      let notExistsMigrationPath = Path.join(Configuration.path.migration.distributable, `${Process.pid} - notExistsMigration.js`)

      before(async () => {
        await connection.insertMigration(existsMigrationPath)
      })
    
      it('should exist', async () => {
        Assert.isTrue(await connection.existsMigration(existsMigrationPath))
      })
    
      it('should not exist', async () => {
        Assert.isFalse(await connection.existsMigration(notExistsMigrationPath))
      })
    
      after(async () => {
        await connection.deleteMigration(existsMigrationPath)
      })
    
    })
  
    describe('insertMigration(path)', () => {

      let migrationName = Path.join(Configuration.path.migration.distributable, `${Process.pid} - insertMigration.js`)

      before(async () => {
        await connection.insertMigration(migrationName)
      })
    
      it('should exist', async () => {
        Assert.isTrue(await connection.existsMigration(migrationName))
      })
    
      describe('selectMigration(path)', () => {

        let migration = null

        before(async () => {
          migration = await connection.selectMigration(migrationName)
        })

        it('inserted should not be null', async () => {
          Assert.isNotNull(migration.inserted)
        })
  
        it('deleted should be null', async () => {
          Assert.isNull(migration.deleted)
        })
  
      })

      after(async () => {
        await connection.deleteMigration(migrationName)
      })
    
    })
  
    describe('deleteMigration(path)', () => {

      let migrationName = Path.join(Configuration.path.migration.distributable, `${Process.pid} - deleteMigration.js`)

      before(async () => {
        await connection.insertMigration(migrationName)
        await connection.deleteMigration(migrationName)
      })
    
      it('should not exist', async () => {
        Assert.isFalse(await connection.existsMigration(migrationName))
      })
    
      describe('selectMigration(path)', () => {

        let migration = null

        before(async () => {
          migration = await connection.selectMigration(migrationName)
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
        await connection.insertMigration(migrationName)
        await connection.deleteMigration(migrationName)
        await connection.insertMigration(migrationName)
      })
    
      it('should exist', async () => {
        Assert.isTrue(await connection.existsMigration(migrationName))
      })
    
      describe('selectMigration(path)', () => {

        let migration = null

        before(async () => {
          migration = await connection.selectMigration(migrationName)
        })

        it('inserted should not be null', async () => {
          Assert.isNotNull(migration.inserted)
        })
  
        it('deleted should be null', async () => {
          Assert.isNull(migration.deleted)
        })
  
      })

      after(async () => {
        await connection.deleteMigration(migrationName)
      })
    
    })
  
    after(async () => {
      await connection.dropMigration()
    })
  
  })

  describe('createResource()', () => {

    before(async () => {
      await connection.createResource()
    })
  
    it('should exist', async () => {
      Assert.isTrue(await connection.existsTable('resource'))
    })
  
    after(async () => {
      await connection.dropResource()
    })
  
  })

  describe('dropResource()', () => {

    before(async () => {
      await connection.createResource()
      await connection.dropResource()
    })
  
    it('should not exist', async () => {
      Assert.isFalse(await connection.existsTable('resource'))
    })
  
  })

  describe('existsResource(fromName, toName), etc.', () => {

    before(async () => {
      await connection.createResource()
    })
  
    describe('existsResource(fromName, toName)', () => {

      let existsResourceFromName = `${Process.pid}.existsResource`
      let existsResourceToName = 'existsResource'

      let notExistsResourceFromName = `${Process.pid}.notExistsResource`
      let notExistsResourceToName = 'notExistsResource'

      before(async () => {
        await connection.insertResource(existsResourceFromName, existsResourceToName)
      })
    
      it('should exist', async () => {
        Assert.isTrue(await connection.existsResource(existsResourceFromName, existsResourceToName))
      })
    
      it('should not exist', async () => {
        Assert.isFalse(await connection.existsResource(notExistsResourceFromName, notExistsResourceToName))
      })
    
      after(async () => {
        await connection.deleteResource(existsResourceFromName, existsResourceToName)
      })
    
    })
  
    describe('insertResource(fromName, toName)', () => {

      let resourceFromName = `${Process.pid}.insertResource`
      let resourceToName = 'insertResource'

      before(async () => {
        await connection.insertResource(resourceFromName, resourceToName)
      })
    
      it('should exist', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      describe('selectResource(fromName, toName)', () => {

        let resource = null

        before(async () => {
          resource = await connection.selectResource(resourceFromName, resourceToName)
        })

        it('inserted should not be null', async () => {
          Assert.isNotNull(resource.inserted)
        })
  
        it('deleted should be null', async () => {
          Assert.isNull(resource.deleted)
        })
  
      })

      after(async () => {
        await connection.deleteResource(resourceFromName, resourceToName)
      })
    
    })
  
    describe('deleteResource(fromName, toName)', () => {

      let resourceFromName = `${Process.pid}.deleteResource`
      let resourceToName = 'deleteResource'

      before(async () => {
        await connection.insertResource(resourceFromName, resourceToName)
        await connection.deleteResource(resourceFromName, resourceToName)
      })
    
      it('should not exist', async () => {
        Assert.isFalse(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      describe('selectResource(fromName, toName)', () => {

        let resource = null

        before(async () => {
          resource = await connection.selectResource(resourceFromName, resourceToName)
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
        await connection.insertResource(resourceFromName, resourceToName)
        await connection.deleteResource(resourceFromName, resourceToName)
        await connection.insertResource(resourceFromName, resourceToName)
      })
    
      it('should exist', async () => {
        Assert.isTrue(await connection.existsResource(resourceFromName, resourceToName))
      })
    
      describe('selectResource(path)', () => {

        let resource = null

        before(async () => {
          resource = await connection.selectResource(resourceFromName, resourceToName)
        })

        it('inserted should not be null', async () => {
          Assert.isNotNull(resource.inserted)
        })
  
        it('deleted should be null', async () => {
          Assert.isNull(resource.deleted)
        })
  
      })

      after(async () => {
        await connection.deleteResource(resourceFromName, resourceToName)
      })
    
    })
  
    after(async () => {
      await connection.dropResource()
    })
  
  })

  after(async () => {
    await connection.close()
  })

})
