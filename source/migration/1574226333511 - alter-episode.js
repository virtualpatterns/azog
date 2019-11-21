
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  let query = 'alter table episode add column "id" int;'

  await this.connection.query(query)
  await migrationPrototype.install.call(this)

}

migration.uninstall = async function ()  {
 
  let query = 'alter table episode drop column "id";'

  await this.connection.query(query)
  await migrationPrototype.uninstall.call(this)

}

export default migration
