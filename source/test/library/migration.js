import { assert as Assert } from 'chai'
import { FileSystem } from '@virtualpatterns/mablung'
import Shell from 'shelljs'

import Configuration from '../../configuration'
import Connection from '../../library/connection'
import Migration from '../../library/migration'

describe('migration', () => {

  describe('(when using an empty database)', () => {
  
    let administratorConnection = null
    let userConnection = null

    before(async () => {

      administratorConnection = await Connection.openAdministratorConnection()
      await administratorConnection.createUserDatabase()

      userConnection = await Connection.openUserConnection()

    })
  
    describe('createMigration(name)', () => {
  
      let migrationPath = null
  
      before(async () => {
        migrationPath = await Migration.createMigration('azog-migration')
      })
  
      it('should create the correct file', () => {
        return FileSystem.access(migrationPath, FileSystem.F_OK)
      })
  
      after(() => {
        return FileSystem.remove(migrationPath)
      })
  
    })
  
    describe('installMigrations(userConnection)', () => {
  
      before(() => {
        return Migration.installMigrations(userConnection)
      })
  
      it('should create the \'migration\' table', async () => {
        Assert.isTrue(await userConnection.existsTable('migration'))
      })
    
      it('should create the \'resource\' table', async () => {
        Assert.isTrue(await userConnection.existsTable('resource'))
      })
    
      after(() => {
        return Migration.uninstallMigrations(userConnection)
      })
  
    })
  
    describe('uninstallMigrations(userConnection)', () => {
  
      before(async () => {
        await Migration.installMigrations(userConnection)
        await Migration.uninstallMigrations(userConnection)
      })
  
      it('should drop the \'migration\' table', async () => {
        Assert.isFalse(await userConnection.existsTable('migration'))
      })
  
      it('should drop the \'resource\' table', async () => {
        Assert.isFalse(await userConnection.existsTable('resource'))
      })
    
    })
  
    after(async () => {

      await userConnection.close()
  
      await administratorConnection.dropUserDatabase()
      await administratorConnection.close()

    })
  
  })

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

    })  
  
    describe('installMigrations(userConnection)', () => {
  
      before(() => {
        return Migration.installMigrations(userConnection)
      })
  
      it('should rename the primary key of \'migration\' from its default to \'migrationKey\'', async () => {

        let query = 'select  pg_constraint.conname as "constraintName" \
                     from    pg_constraint \
                               inner join pg_class on \
                                 pg_constraint.conrelid = pg_class.oid and \
                                 pg_class.relname = \'migration\' and \
                                 pg_constraint.contype = \'p\';'

        let response = await userConnection.query(query)
        let constraintName = response.rows[0].constraintName
                                                          
        Assert.equal(constraintName, 'migrationKey')

      })

      it('should rename the primary key of \'resource\' from \'resourcePrimaryKey\' to \'resourceKey\'', async () => {

        let query = 'select  pg_constraint.conname as "constraintName" \
                     from    pg_constraint \
                               inner join pg_class on \
                                 pg_constraint.conrelid = pg_class.oid and \
                                 pg_class.relname = \'resource\' and \
                                 pg_constraint.contype = \'p\';'

        let response = await userConnection.query(query)
        let constraintName = response.rows[0].constraintName
                                                          
        Assert.equal(constraintName, 'resourceKey')

      })

      describe('(when the migration \'0000000000000 - create-migration.js\' is installed)', () => {

        let response = null

        before(async () => {

          let query = 'select   migration.inserted = minimumInserted.value as "isMinimumInserted" \
                       from     migration, \
                                ( select  min(migration.inserted) as value \
                                  from    migration \
                                  where   migration.deleted is null ) as minimumInserted \
                       where    migration.path = \'0000000000000 - create-migration.js\' and \
                                migration.deleted is null;'

          response = await userConnection.query(query)

        })  

        it('should return 1 row', async () => {
          Assert.equal(response.rowCount, 1)
        })

        it('should be the minimum \'inserted\'', async () => {
          Assert.isTrue(response.rows[0].isMinimumInserted)
        })

      })

      describe('(when the \'fromname\' column of \'resource\' is renamed \'fromName\')', () => {

        it('the \'fromName\' column should exist', async () => {
          Assert.isTrue(await userConnection.existsColumn('resource', 'fromName'))
        })

        it('the \'fromname\' column should not exist', async () => {
          Assert.isFalse(await userConnection.existsColumn('resource', 'fromname'))
        })
    
      })
    
      describe('(when the \'toname\' column of \'resource\' is renamed \'toName\')', () => {

        it('the \'toName\' column should exist', async () => {
          Assert.isTrue(await userConnection.existsColumn('resource', 'toName'))
        })

        it('the \'toname\' column should not exist', async () => {
          Assert.isFalse(await userConnection.existsColumn('resource', 'toname'))
        })
    
      })
    
      after(() => {
        return Migration.uninstallMigrations(userConnection)
      })
    
    })
  
    after(async () => {

      await userConnection.close()
  
      await administratorConnection.dropUserDatabase()
      await administratorConnection.close()

    })
  
  })

})
