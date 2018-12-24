
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  let query = 'create table \
               episode  ( "seriesTitle" text not null, \
                          "yearReleased" int, \
                          "dateAired" date, \
                          "seasonNumber" int, \
                          "episodeNumber" int, \
                          "episodeTitle" text, \
                          constraint "episodeKey" primary key ( "fromName", "toName" ) ) \
               inherits ( resource );'

  await this.connection.query(query)
  await migrationPrototype.install.call(this)

}

migration.uninstall = async function ()  {

  let query = 'drop table episode;'
  
  await this.connection.query(query)
  await migrationPrototype.uninstall.call(this)

}

export default migration
