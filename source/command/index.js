import '@babel/polyfill'
import Command from 'commander'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import { Command as Configuration } from '../configuration'
import Package from '../../package.json'
import Process from './library/process'

Source.install({ 'handleUncaughtExceptions': false })

Command
  .version(Package.version)

Command
  .command('completed <torrentId> <torrentName> [torrentPath]')
  .description('Process the indicated torrent')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .action(async (torrentId, torrentName, torrentPath, options) => {

    try {

      if (options.configurationPath) {
        Configuration.merge(options.configurationPath.split(','))
      }
    
      if (Configuration.logPath == 'stdout') {
        Log.createFormattedLog({ 'level': Configuration.logLevel })
      }
      else {
        await FileSystem.mkdir(Path.dirname(Configuration.logPath), { 'recursive': true })
        Log.createFormattedLog({ 'level': Configuration.logLevel }, Configuration.logPath)
      }

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

    Process.exit(0)

  })

Command
  .parse(Process.argv)
