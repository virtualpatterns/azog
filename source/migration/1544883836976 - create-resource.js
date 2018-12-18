
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {
  await this.connection.createResource()
  await migrationPrototype.install.call(this)
}

migration.uninstall = async function ()  {
  await this.connection.dropResource()
  await migrationPrototype.uninstall.call(this)
}

export default migration
