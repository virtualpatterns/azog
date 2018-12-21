
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  if (await this.connection.existsColumn('resource', 'fromname') &&
      await this.connection.existsColumn('resource', 'toname')) {
    
    let query = 'alter table resource rename fromName to "fromName"; \
                 alter table resource rename toName to "toName";'

    await this.connection.query(query)

  }

  return migrationPrototype.install.call(this)

}

export default migration
