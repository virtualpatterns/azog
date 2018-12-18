
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = function () {
  return migrationPrototype.install.call(this)
}

migration.uninstall = function ()  {
  return migrationPrototype.uninstall.call(this)
}

export default migration
