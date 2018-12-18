import { Client } from 'pg'
import { Log } from '@virtualpatterns/mablung'

import Configuration from '../configuration'

const connectionPrototype = Object.create({})

connectionPrototype.existsTable = async function (name) {
  
  let query = 'select TRUE as "existsTable" from pg_class where pg_table_is_visible(pg_class.oid) and pg_class.relname=$1;'
  let values = [ name ]

  let response = await this.client.query(query, values)

  return response.rowCount == 0 ? false : response.rows[0].existsTable

}

connectionPrototype.createMigration = function () {

  let query = 'create table if not exists migration ( path text primary key, \
                                                      inserted timestamp not null default current_timestamp, \
                                                      deleted timestamp default null );'

  return this.client.query(query)

}

connectionPrototype.dropMigration = function () {

  let query = 'drop table if exists migration;'

  return this.client.query(query)

}

connectionPrototype.selectMigration = async function (path) {

  let query = 'select migration.path as path, \
                      migration.inserted as inserted, \
                      migration.deleted as deleted \
               from   migration \
               where  migration.path = $1;'
  
  let values = [ path ]

  let response = await this.client.query(query, values)

  return response.rowCount == 0 ? {} : response.rows[0]

}

connectionPrototype.selectMigrations = async function () {

  let query = 'select   migration.path as path, \
                        migration.inserted as inserted \
               from     migration \
               where    migration.deleted is null \
               order by migration.inserted desc;'
  
  let response = await this.client.query(query)

  return response.rows

}

connectionPrototype.existsMigration = async function (path) {

  let query = 'select true as "existsMigration" \
               from   migration \
               where  migration.path = $1 and \
                      migration.deleted is null;'
  
  let values = [ path ]

  let response = await this.client.query(query, values)

  return response.rowCount == 0 ? false : response.rows[0].existsMigration

}

connectionPrototype.insertMigration = function (path) {

  let query = 'insert into migration  ( path ) \
               values                 ( $1 ) \
               on conflict            ( path ) \
               do update \
               set  inserted = current_timestamp, \
                    deleted = null;'

  let values = [ path ]

  return this.client.query(query, values)

}

connectionPrototype.deleteMigration = function (path) {

  let query = 'update migration \
               set    deleted = current_timestamp \
               where  path = $1;'

  let values = [ path ]

  return this.client.query(query, values)

}

connectionPrototype.createResource = function () {

  let query = 'create table if not exists resource (  fromName text not null, \
                                                      toName text not null, \
                                                      inserted timestamp not null default current_timestamp, \
                                                      deleted timestamp default null, \
                                                      constraint "resourcePrimaryKey" primary key ( fromName, toName ) );'

  return this.client.query(query)

}

connectionPrototype.dropResource = function () {

  let query = 'drop table if exists resource;'

  return this.client.query(query)

}

connectionPrototype.selectResource = async function (fromName, toName) {

  let query = 'select resource.fromName as "fromName", \
                      resource.toName as "toName", \
                      resource.inserted as inserted, \
                      resource.deleted as deleted \
               from   resource \
               where  resource.fromName = $1 and \
                      resource.toName = $2;'
  
  let values = [ fromName, toName ]

  let response = await this.client.query(query, values)

  return response.rowCount == 0 ? {} : response.rows[0]

}

connectionPrototype.existsResource = async function (fromName, toName) {

  let query = 'select true as "existsResource" \
               from   resource \
               where  resource.fromName = $1 and \
                      resource.toName = $2 and \
                      resource.deleted is null;'
  
  let values = [ fromName, toName ]

  let response = await this.client.query(query, values)

  return response.rowCount == 0 ? false : response.rows[0].existsResource

}

connectionPrototype.insertResource = function (fromName, toName) {

  let query = 'insert into resource ( fromName, \
                                      toName ) \
               values               ( $1, \
                                      $2 ) \
               on conflict \
               on constraint "resourcePrimaryKey" \
               do update \
               set  inserted = current_timestamp, \
                    deleted = null;'

  let values = [ fromName, toName ]

  return this.client.query(query, values)

}

connectionPrototype.deleteResource = function (fromName, toName) {

  let query = 'update resource \
               set    deleted = current_timestamp \
               where  fromName = $1 and \
                      toName = $2;'

  let values = [ fromName, toName ]

  return this.client.query(query, values)

}

connectionPrototype.close = function () {
  Log.debug(`Closing ${this.options.database ? `'${this.options.database}'` : '(default)'} ...`)
  return this.client.end()
}

const Connection = Object.create({})

Connection.openConnection = async function (options = Configuration.connection, prototype = connectionPrototype) {

  let client = new Client(options)

  Log.debug(`Opening ${options.database ? `'${options.database}'` : '(default)'} ...`)
  await client.connect()

  let connection = null

  connection = Object.create(prototype)
  connection.client = client
  connection.options = options

  return connection

}

export default Connection
