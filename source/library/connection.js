import { Client } from 'pg'
import EventEmitter from 'events'
import { Log } from '@virtualpatterns/mablung'

import Configuration from '../configuration'

const connectionPrototype = Object.create(EventEmitter.prototype)

connectionPrototype.createUserDatabase = function () {
  return this.query(`create database "${Configuration.connection.user.database}";`)
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

connectionPrototype.deleteResource = function (fromName, toName) {

  let query = 'update resource \
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
