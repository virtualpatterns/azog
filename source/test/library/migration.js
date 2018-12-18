import { assert as Assert } from 'chai'
import { FileSystem } from '@virtualpatterns/mablung'

import Connection from '../../library/connection'
import Migration from '../../library/migration'

describe('migration', () => {

  let connection = null

  before(async () => {
    connection = await Connection.openConnection({ 'database': 'azog-migration' })
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

  describe('installMigrations(connection)', () => {

    before(() => {
      return Migration.installMigrations(connection)
    })

    it('should create the migration table', async () => {
      Assert.isTrue(await connection.existsTable('migration'))
    })
  
    it('should create the resource table', async () => {
      Assert.isTrue(await connection.existsTable('resource'))
    })
  
    after(() => {
      return Migration.uninstallMigrations(connection)
    })

  })

  describe('uninstallMigrations(connection)', () => {

    before(async () => {
      await Migration.installMigrations(connection)
      await Migration.uninstallMigrations(connection)
    })

    it('should drop the migration table', async () => {
      Assert.isFalse(await connection.existsTable('migration'))
    })
  
    it('should create the resource table', async () => {
      Assert.isFalse(await connection.existsTable('resource'))
    })

  })

  after(() => {
    return connection.close()
  })

})
