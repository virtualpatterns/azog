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
  .command('process <torrentId> <torrentName> <torrentPath>')
  .description('Process the indicated torrent (i.e. identify, convert, match, rename, etc.)')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)
  .action((torrentId, torrentName, torrentPath, options) => {

    return Program.onAction(options, async () => {

      Log.debug(Configuration.line)
      Log.debug(torrentName)
      Log.debug(Configuration.line) 

      let connection = null
      connection = await Connection.openConnection()

      try {

        let torrent = null
        torrent = Torrent.createTorrent(Path.join(torrentPath, torrentName))
        
        await torrent.process(connection)

      }
      finally {
        await connection.close()
      }

    })

  })

// Program
//   .command('transfer')
//   .description('Transfer the contents of videos and music folders')
//   .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
//   .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
//   .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)
//   .action((options) => {

//     return Program.onAction(options, () => {

//       Log.debug(Configuration.line)

//       return Torrent.transfer()

//     })

//   })

Program
  .command('create <migrationName>')
  .description('Create a migration with the indicated name')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)
  .action((migrationName, options) => {

    return Program.onAction(options, () => {
      return Migration.createMigration(migrationName)
    })

  })

Program
  .command('install')
  .description('Install migrations that have not been installed')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)
  .action((options) => {

    return Program.onAction(options, async () => {

      let connection = null
      connection = await Connection.openConnection()

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
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)
  .action((options) => {

    return Program.onAction(options, async () => {

      let connection = null
      connection = await Connection.openConnection()

      try {
        await Migration.uninstallMigrations(connection)
      }
      finally {
        await connection.close()
      }

    })

  })

Program
  .version(Package.version)
  .parse(Process.argv)
