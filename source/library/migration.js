import { DateTime } from 'luxon'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'

import Configuration from '../configuration'

const migrationPrototype = Object.create({})

migrationPrototype.isInstalled = function () {
  return this.connection.existsMigration(this.path)
}

migrationPrototype.install = function () {
  return this.connection.insertMigration(this.path)
}

migrationPrototype.uninstall = function () {
  return this.connection.deleteMigration(this.path)
}

const Migration = Object.create({})

Migration.createMigration = async function (name) {

  let fromPath = Configuration.path.migration.template
  let toPath = Path.join(Configuration.path.migration.source, `${DateTime.local().toMillis()} - ${name}${Path.extname(fromPath)}`)

  await FileSystem.mkdir(Path.dirname(toPath), { 'recursive': true })
  await FileSystem.copy(fromPath, toPath)

  Log.debug(`Created '${Path.relative('', toPath)}' ...`)

  return toPath

}

Migration.requireMigration = function (path, connection) {

  let migration = require(path).default
  
  migration.path = Path.relative(Configuration.path.migration.distributable, path)
  migration.connection = connection

  return migration

}

Migration.getInstalledMigrations = async function (connection, isInstalled = true) {
  
  let migrations = await Migration.getMigrations(connection)

  let migrationPromises = migrations
    .map((migration) => {
      return migration.isInstalled()
        .then((isInstalled) => {
          return {
            'migration': migration,
            'isInstalled': isInstalled
          }
        })
    })

  migrations = await Promise.all(migrationPromises)

  return migrations
    .filter((migration) => {
      return migration.isInstalled == isInstalled
    })
    .map((value) => {
      return value.migration
    })
    .sort((migration1, migration2) => {
      return  migration1.path < migration2.path ? -1 : ( migration1.path > migration2.path ? 1 : 0 )
    })

}

Migration.getMigrations = async function (connection) {

  let migrationPath = Configuration.path.migration.distributable
  let options = {
    'encoding': 'utf-8',
    'withFileTypes': true
  }

  let files = await FileSystem.readdir(migrationPath, options)
  let migrations = files
    .filter((file) => {
      return  file.isFile()
    })
    .filter((file) => {
      return  !Configuration.extension.ignore.includes(Path.extname(file.name))
    })
    .filter((file) => {
      return  file.name != Path.basename(Configuration.path.migration.template)
    })
    .sort((file1, file2) => {
      return  file1.name < file2.name ? -1 : ( file1.name > file2.name ? 1 : 0 )
    })
    .map((file) => {
      return Migration.requireMigration(Path.join(migrationPath, file.name), connection)
    })

  return migrations

}

Migration.installMigrations = async function (connection) {

  let migrations = null
  migrations = await this.getInstalledMigrations(connection, false)

  for (let migration of migrations) {
    Log.debug(`Installing '${migration.path}' ...`)
    await migration.install()
  }

}

Migration.uninstallMigrations = async function (connection) {

  let migrations = null
  migrations = await this.getInstalledMigrations(connection, true)
  migrations = migrations.reverse()

  for (let migration of migrations) {
    Log.debug(`Uninstalling '${migration.path}' ...`)
    await migration.uninstall()
  }

}

Migration.getMigrationPrototype = function () {
  return migrationPrototype
}

Migration.isMigration = function (migration) {
  return migrationPrototype.isPrototypeOf(migration)
}

export default Migration
