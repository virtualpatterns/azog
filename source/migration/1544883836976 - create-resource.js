
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  let query = 'create table resource (  "fromName" text not null, \
                                        "toName" text not null, \
                                        inserted timestamp not null default current_timestamp, \
                                        deleted timestamp default null, \
                                        constraint "resourceKey" primary key ( "fromName", "toName" ) );'

  await this.connection.query(query)
  await migrationPrototype.install.call(this)

}

migration.uninstall = async function ()  {

  let query = 'drop table resource;'
  
  await this.connection.query(query)
  await migrationPrototype.uninstall.call(this)

}

export default migration
