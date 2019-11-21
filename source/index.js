import '@babel/polyfill'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from './configuration'
import Connection from './library/connection'
import Migration from './library/migration'
import Package from '../package.json'
import Program from './library/program'
import Torrent from './library/torrent'

Source.install({ 'handleUncaughtExceptions': false })

Program
  .version(Package.version)
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)

Program
  .command('process <torrentId> <torrentName> <torrentPath>')
  .description('Process the indicated torrent (i.e. identify, convert, match, rename, etc.)')
  .action((torrentId, torrentName, torrentPath, options) => {

    return Program.onAction(options, async () => {

      Log.debug(Configuration.line)
      Log.debug(torrentName)
      Log.debug(Configuration.line) 

      let connection = null
      connection = await Connection.openUserConnection()

      try {
        await Torrent.createTorrent(Path.join(torrentPath, torrentName), connection).process()
      }
      finally {
        await connection.close()
      }

    })

  })

Program
  .command('initialize')
  .description('Create the user database and install migrations')
  .action((migrationName, options) => {

    return Program.onAction(options, async () => {

      let administratorConnection = null
      administratorConnection = await Connection.openAdministratorConnection()

      try {

        await administratorConnection.createUserDatabase()

        let userConnection = null
        userConnection = await Connection.openUserConnection()
  
        try {
          await Migration.installMigrations(userConnection)
        }
        finally {
          await userConnection.close()
        }
  
      }
      finally {
        await administratorConnection.close()
      }

    })

  })

Program
  .command('create <migrationName>')
  .description('Create a migration with the indicated name')
  .action((migrationName, options) => {

    return Program.onAction(options, () => {
      return Migration.createMigration(migrationName)
    })

  })

Program
  .command('install')
  .description('Install migrations that have not been installed')
  .action((options) => {

    return Program.onAction(options, async () => {

      let connection = null
      connection = await Connection.openUserConnection()

      try {
        await Migration.installMigrations(connection)
      }
      finally {
        await connection.close()
      }

    })

  })

Program
  .command('uninstall')
  .description('Uninstall migrations that have been installed')
  .action((options) => {

    return Program.onAction(options, async () => {

      let connection = null
      connection = await Connection.openUserConnection()

      try {
        await Migration.uninstallMigrations(connection)
      }
      finally {
        await connection.close()
      }

    })

  })

Program
  .command('uninitialize')
  .description('Uninstall migrations and drop the user database')
  .action((migrationName, options) => {

    return Program.onAction(options, async () => {

      let administratorConnection = null
      administratorConnection = await Connection.openAdministratorConnection()

      try {

        let userConnection = null
        userConnection = await Connection.openUserConnection()
  
        try {
          await Migration.uninstallMigrations(userConnection)
        }
        finally {
          await userConnection.close()
        }
  
        await administratorConnection.dropUserDatabase()

      }
      finally {
        await administratorConnection.close()
      }

    })

  })

Program
  .parse(Process.argv)
