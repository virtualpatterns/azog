import '@babel/polyfill'
import Command from 'commander'
import { FileSystem, Log, Path } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import { Command as Configuration } from '../configuration'
import Package from '../../package.json'
import Process from './library/process'

Source.install({ 'handleUncaughtExceptions': false })

Command
  .arguments('<torrentId> <torrentName> <torrentPath>')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)
  .action(async (torrentId, torrentName, torrentPath, options) => {

    try {

      if (options.configurationPath) {
        Configuration.merge(options.configurationPath.split(','))
      }

      Configuration.logLevel = options.logLevel || Configuration.logLevel
      Configuration.logPath = options.logPath || Configuration.logPath
  
      if (Configuration.logPath == 'console') {
        Log.createFormattedLog({ 'level': Configuration.logLevel })
      }
      else {

        await FileSystem.mkdir(Path.dirname(Configuration.logPath), { 'recursive': true })

        console.log(`\nLogging '${Configuration.logLevel}' to '${Path.trim(Configuration.logPath)}' ...\n`) // eslint-disable-line no-console
        Log.createFormattedLog({ 'level': Configuration.logLevel }, Configuration.logPath)

      }

      Log.debug(Configuration.line)
      Log.debug(`${torrentId} '${torrentName}' '${Path.normalize(torrentPath)}'`)
      Log.debug(Configuration.line)

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

        await Process.processTorrent(Path.join(torrentPath, torrentName))

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
  .version(Package.version)
  .parse(Process.argv)
