
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  let query = 'create table \
               movie    ( title text not null, \
                          "yearReleased" int, \
                          constraint "movieKey" primary key ( "fromName", "toName" ) ) \
               inherits ( resource );'

  await this.connection.query(query)
  await migrationPrototype.install.call(this)

}

migration.uninstall = async function ()  {

  let query = 'drop table movie;'
  
  await this.connection.query(query)
  await migrationPrototype.uninstall.call(this)

}

export default migration
