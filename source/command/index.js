import '@babel/polyfill'
import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import Program from 'commander'
import Source from 'source-map-support'

import { Command } from '../configuration'
import Package from '../../package.json'
import Torrent from './library/torrent'

Source.install({ 'handleUncaughtExceptions': false })

Program
  .arguments('<torrentId> <torrentName> <torrentPath>')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Command.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Command.logPath}'`)
  .action(async (torrentId, torrentName, torrentPath, options) => {

    try {

      if (options.configurationPath) {
        Command.merge(options.configurationPath.split(','))
      }

      Command.logLevel = options.logLevel || Command.logLevel
      Command.logPath = options.logPath || Command.logPath
  
      if (Command.logPath == 'console') {
        Log.createFormattedLog({ 'level': Command.logLevel })
      }
      else {

        await FileSystem.mkdir(Path.dirname(Command.logPath), { 'recursive': true })

        console.log(Command.line)
        console.log(`Logging to '${Path.trim(Command.logPath)}' (${Command.logLevel}) ...`)
        console.log(Command.line)

        Log.createFormattedLog({ 'level': Command.logLevel }, Command.logPath)

      }

      try {

        Log.debug(Command.line)
        Log.debug(Path.trim(Path.join(torrentPath, torrentName)))
        Log.debug(Command.line) 

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

        await Torrent.createTorrent(Path.join(torrentPath, torrentName)).process()

      } catch (error) {

        Log.error('catch (error) { ... }')
        Log.error(error)

        Process.exit(2)

      }

    } catch (error) {

      console.log(error.stack)

      Process.exit(3)

    }

    Process.exit(0)

  })
  .version(Package.version)
  .parse(Process.argv)
