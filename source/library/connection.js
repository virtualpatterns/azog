import { Client } from 'pg'
import EventEmitter from 'events'
import { Log } from '@virtualpatterns/mablung'

import Configuration from '../configuration'

const connectionPrototype = Object.create(EventEmitter.prototype)

connectionPrototype.existsUserDatabase = async function () {

  let query = `select TRUE as "existsDatabase"
               from   pg_database
               where  pg_database.datname = '${Configuration.connection.user.database}';`

  let response = await this.query(query)

  return response.rowCount == 0 ? false : response.rows[0].existsDatabase

}

connectionPrototype.createUserDatabase = async function () {

  if (await this.existsUserDatabase()) {
    await this.dropUserDatabase()
  }

  await this.query(`create database "${Configuration.connection.user.database}";`)

}

connectionPrototype.dropUserDatabase = function () {
  return this.query(`drop database "${Configuration.connection.user.database}";`)
}

connectionPrototype.existsTable = async function (name) {
  
  let query = 'select TRUE as "existsTable" \
               from   pg_class \
               where  pg_table_is_visible(pg_class.oid) and \
                      pg_class.relname = $1;'

  let values = [ name ]

  let response = await this.query(query, values)

  return response.rowCount == 0 ? false : response.rows[0].existsTable

}

connectionPrototype.existsColumn = async function (tableName, columnName) {
  
  let query = 'select TRUE as "existsColumn" \
               from   information_schema.columns \
               where  information_schema.columns.table_name = $1 and \
                      information_schema.columns.column_name = $2;'

  let values = [ tableName, columnName ]

  let response = await this.query(query, values)

  return response.rowCount == 0 ? false : response.rows[0].existsColumn

}

connectionPrototype.selectMigration = async function (path) {

  let query = 'select migration.path as path, \
                      migration.inserted as inserted, \
                      migration.deleted as deleted \
               from   migration \
               where  migration.path = $1;'
  
  let values = [ path ]

  let response = await this.query(query, values)

  return response.rowCount == 0 ? {} : response.rows[0]

}

connectionPrototype.selectMigrations = async function () {

  let query = 'select   migration.path as path, \
                        migration.inserted as inserted \
               from     migration \
               where    migration.deleted is null \
               order by migration.inserted desc;'
  
  let response = await this.query(query)

  return response.rows

}

connectionPrototype.existsMigration = async function (path) {

  if (await this.existsTable('migration')) {

    let query = 'select true as "existsMigration" \
                 from   migration \
                 where  migration.path = $1 and \
                        migration.deleted is null;'

    let values = [ path ]

    let response = await this.query(query, values)

    return response.rowCount == 0 ? false : response.rows[0].existsMigration

  }

  return false

}

connectionPrototype.insertMigration = function (path) {

  let query = 'insert into migration  ( path ) \
               values                 ( $1 ) \
               on conflict \
               on constraint "migrationKey" \
               do update \
               set  inserted = current_timestamp, \
                    deleted = null;'

  let values = [ path ]

  return this.query(query, values)

}

connectionPrototype.deleteMigration = function (path) {

  let query = 'update migration \
               set    deleted = current_timestamp \
               where  path = $1;'

  let values = [ path ]

  return this.query(query, values)

}

connectionPrototype.selectResource = async function (fromName, toName) {

  let query = 'select resource."fromName" as "fromName", \
                      resource."toName" as "toName", \
                      resource.inserted as inserted, \
                      resource.deleted as deleted \
               from   resource \
               where  resource."fromName" = $1 and \
                      resource."toName" = $2;'
  
  let values = [ fromName, toName ]

  let response = await this.query(query, values)

  return response.rowCount == 0 ? {} : response.rows[0]

}

connectionPrototype.selectMovie = async function (fromName, toName) {

  let query = 'select movie."fromName" as "fromName", \
                      movie."toName" as "toName", \
                      movie.title as title, \
                      movie."yearReleased" as "yearReleased", \
                      movie.inserted as inserted, \
                      movie.deleted as deleted \
               from   movie \
               where  movie."fromName" = $1 and \
                      movie."toName" = $2;'
  
  let values = [ fromName, toName ]

  let response = await this.query(query, values)

  return response.rowCount == 0 ? {} : response.rows[0]

}

connectionPrototype.selectEpisode = async function (fromName, toName) {

  let query = 'select episode."fromName" as "fromName", \
                      episode."toName" as "toName", \
                      episode."seriesTitle" as "seriesTitle", \
                      episode."yearReleased" as "yearReleased", \
                      episode."dateAired" as "dateAired", \
                      episode."seasonNumber" as "seasonNumber", \
                      episode."episodeNumber" as "episodeNumber", \
                      episode."episodeTitle" as "episodeTitle", \
                      episode.inserted as inserted, \
                      episode.deleted as deleted \
               from   episode \
               where  episode."fromName" = $1 and \
                      episode."toName" = $2;'
  
  let values = [ fromName, toName ]

  let response = await this.query(query, values)

  return response.rowCount == 0 ? {} : response.rows[0]

}

connectionPrototype.existsResource = async function (fromName, toName) {

  let query = 'select true as "existsResource" \
               from   resource \
               where  resource."fromName" = $1 and \
                      resource."toName" = $2 and \
                      resource.deleted is null;'
  
  let values = [ fromName, toName ]

  let response = await this.query(query, values)

  return response.rowCount == 0 ? false : response.rows[0].existsResource

}

connectionPrototype.existsMovie = async function (fromName, toName) {
  return this.existsResource(fromName, toName)
}

connectionPrototype.existsEpisode = async function (fromName, toName) {
  return this.existsResource(fromName, toName)
}

connectionPrototype.insertResource = function (fromName, toName) {

  let query = 'insert into resource ( "fromName", \
                                      "toName" ) \
               values               ( $1, \
                                      $2 ) \
               on conflict \
               on constraint "resourceKey" \
               do update \
               set  inserted = current_timestamp, \
                    deleted = null;'

  let values = [ fromName, toName ]

  return this.query(query, values)

}

connectionPrototype.insertMovie = async function (fromName, toName, title, yearReleased) {

  let query = 'insert into movie (  "fromName", \
                                    "toName", \
                                    title, \
                                    "yearReleased" ) \
               values            (  $1, \
                                    $2, \
                                    $3, \
                                    $4 ) \
               on conflict \
               on constraint "movieKey" \
               do update \
               set  inserted = current_timestamp, \
                    deleted = null;'

  let values = [ fromName, toName, title, yearReleased ]

  return this.query(query, values)

}

connectionPrototype.insertEpisode = async function (fromName, toName, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle) {

  let query = 'insert into episode (  "fromName", \
                                      "toName", \
                                      "seriesTitle", \
                                      "yearReleased", \
                                      "dateAired", \
                                      "seasonNumber", \
                                      "episodeNumber", \
                                      "episodeTitle" ) \
               values            (    $1, \
                                      $2, \
                                      $3, \
                                      $4, \
                                      $5, \
                                      $6, \
                                      $7, \
                                      $8 ) \
               on conflict \
               on constraint "episodeKey" \
               do update \
               set  inserted = current_timestamp, \
                    deleted = null;'

  let values = [ fromName, toName, seriesTitle, yearReleased, dateAired, seasonNumber, episodeNumber, episodeTitle ]

  return this.query(query, values)

}

connectionPrototype.deleteResource = function (fromName, toName) {

  let query = 'update resource \
               set    deleted = current_timestamp \
               where  "fromName" = $1 and \
                      "toName" = $2;'

  let values = [ fromName, toName ]

  return this.query(query, values)

}

connectionPrototype.deleteMovie = function (fromName, toName) {

  let query = 'update movie \
               set    deleted = current_timestamp \
               where  "fromName" = $1 and \
                      "toName" = $2;'

  let values = [ fromName, toName ]

  return this.query(query, values)

}

connectionPrototype.deleteEpisode = function (fromName, toName) {

  let query = 'update episode \
               set    deleted = current_timestamp \
               where  "fromName" = $1 and \
                      "toName" = $2;'

  let values = [ fromName, toName ]

  return this.query(query, values)

}

connectionPrototype.query = function (...parameters) {
  return this.client.query.apply(this.client, parameters)
}

connectionPrototype.close = function () {
  Log.debug(`Closing '${this.options.database}' ...`)
  return this.client.end()
}

const Connection = Object.create({})

Connection.openConnection = async function (options, prototype = connectionPrototype) {

  let connection = Object.create(prototype)
  let client = new Client(options)

  connection.client = client
  connection.options = options

  client.on('notification', (notification) => {
    connection.emit('notification', notification)
  })

  client.on('notice', (message) => {
    connection.emit('notice', message)
  })

  client.on('error', (error) => {
    connection.emit('error', error)

  })

  client.on('end', () => {
    connection.emit('end')
  })
  
  Log.debug(`Opening '${options.database}' ...`)
  await client.connect()

  return connection

}

Connection.openAdministratorConnection = function (prototype = connectionPrototype) {
  return this.openConnection(Configuration.connection.administrator, prototype)
}

Connection.openUserConnection = function (prototype = connectionPrototype) {
  return this.openConnection(Configuration.connection.user, prototype)
}

export default Connection
