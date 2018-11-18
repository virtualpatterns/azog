import '@babel/polyfill'
import Command from 'commander'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'
import Package from '../../package.json'
import Process from './library/process'

Source.install({ 'handleUncaughtExceptions': false })

Command
  .version(Package.version)

Command
  .command('completed <torrentId> <torrentName> [torrentPath]')
  .description('Process the indicated torrent')
  .option('--configurationPath <path>', 'Configuration path (configuration overrides defaults)')
  .action(async (torrentId, torrentName, torrentPath, options) => {

    try {

      if (options.configurationPath) {
        Configuration.merge(options.configurationPath)
      }

      if (Configuration.command.logPath == 'stdout') {
        Log.createFormattedLog({ 'level': Configuration.command.logLevel })
      }
      else {
        await FileSystem.mkdir(Path.dirname(Configuration.command.logPath), { 'recursive': true })
        Log.createFormattedLog({ 'level': Configuration.command.logLevel }, Configuration.command.logPath)
      }

      Log.trace(Configuration.command, 'Configuration.command')

      try {

        Process.once('SIGINT', () => {
          Log.debug('Process.once(\'SIGINT\', () => { ... })')

          Process.exit(1)

        })

        Process.once('SIGTERM', () => {
          Log.debug('Process.once(\'SIGTERM\', () => { ... })')

          Process.exit(1)

        })

        Process.once('uncaughtException', (error) => {
          Log.error('Process.once(\'uncaughtException\', (error) => { ... })')
          Log.error(error)

          Process.exit(2)

        })

        Process.on('warning', (error) => {
          Log.error('Process.on(\'warning\', (error) => { ... })')
          Log.error(error)
        })

        await Process.processTorrent(torrentId, torrentName)

      } catch (error) {

        Log.error('catch (error) { ... }')
        Log.error(error)

        Process.exit(2)

      }

    } catch (error) {

      console.log(error.stack) // eslint-disable-line no-console

      Process.exit(3)

    }

  })

Command
  .parse(Process.argv)
