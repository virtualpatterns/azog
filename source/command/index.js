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
  .option('--logLevel <level>', `Log level, defaults to '${Configuration.command.logLevel}'`)
  .option('--logPath <path>', `Log path, defaults to '${Path.trim(Configuration.command.logPath)}', 'stdout' outputs to the console`)
  .option('--downloadedPath <path>', `Downloaded torrents path, defaults to '${Path.trim(Configuration.command.path.downloaded)}'`)
  .option('--processingPath <path>', `Processing file path, defaults to '${Path.trim(Configuration.command.path.processing)}'`)
  .option('--processedPath <path>', `Processed file path, defaults to '${Path.trim(Configuration.command.path.processed)}'`)
  .option('--failedPath <path>', `Failed file path, defaults to '${Path.trim(Configuration.command.path.failed)}'`)
  .action(async (torrentId, torrentName, torrentPath, options) => {

    try {

      Configuration.command.logLevel = options.logLevel || Configuration.command.logLevel
      Configuration.command.logPath = options.logPath ? (options.logPath == 'stdout' ? Process.stdout : options.logPath) : Configuration.command.logPath
      Configuration.command.path.downloaded = options.downloadedPath || Configuration.command.path.downloaded
      Configuration.command.path.processing = options.processingPath || Configuration.command.path.processing
      Configuration.command.path.processed = options.processedPath || Configuration.command.path.processed
      Configuration.command.path.failed = options.failedPath || Configuration.command.path.failed

      if (Configuration.command.logPath == Process.stdout) {
        Log.createFormattedLog({ 'level': Configuration.command.logLevel })
      }
      else {
        await FileSystem.mkdir(Path.dirname(Configuration.command.logPath), { 'recursive': true })
        Log.createFormattedLog({ 'level': Configuration.command.logLevel }, Configuration.command.logPath)
      }

      if (options.downloadedPath ||
          options.processingPath ||
          options.processedPath ||
          options.failedPath) {
        Log.debug(Configuration.command.path, 'Configuration.command.path')
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

  })

Command
  .parse(Process.argv)
