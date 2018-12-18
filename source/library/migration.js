import { DateTime } from 'luxon'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'

// import Connection from './connection'
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

Migration.installMigrations = async function (connection) {

  await connection.createMigration()

  let migrationPath = Configuration.path.migration.distributable

  let options = null
  options = {
    'encoding': 'utf-8',
    'withFileTypes': true
  }

  let files = null
  files = await FileSystem.readdir(migrationPath, options)

  files = files
    .filter((file) => {
      return  file.isFile()
    })
    .filter((file) => {
      return  !Configuration.extension.ignore.includes(Path.extname(file.name))
    })
    .filter((file) => {
      return  Path.basename(Path.join(migrationPath, file.name)) !=
              Path.basename(Configuration.path.migration.template)
    })
    .sort((file1, file2) => {
      return  file1.name < file2.name ? -1 : ( file1.name > file2.name ? 1 : 0 )
    })

  for (let file of files) {

    let migration = Migration.requireMigration(Path.join(migrationPath, file.name), connection)

    if (!(await migration.isInstalled())) {
      Log.debug(`Installing '${migration.path}' ...`)
      await migration.install()
    }
    
  }

}

Migration.uninstallMigrations = async function (connection) {

  let migrationPath = Configuration.path.migration.distributable

  for (let migration of (await connection.selectMigrations())) {
  
    let _migration = Migration.requireMigration(Path.join(migrationPath, migration.path), connection)

    Log.debug(`Uninstalling '${_migration.path}' ...`)
    await _migration.uninstall()

  }

  await connection.dropMigration()

}

Migration.getMigrationPrototype = function () {
  return migrationPrototype
}

Migration.isMigration = function (migration) {
  return migrationPrototype.isPrototypeOf(migration)
}

export default Migration
