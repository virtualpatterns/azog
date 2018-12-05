import '@babel/polyfill'
import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import _Program from 'commander'
import Source from 'source-map-support'

import { Command } from '../configuration'
import Package from '../../package.json'
import Torrent from './library/torrent'

Source.install({ 'handleUncaughtExceptions': false })

const Program = Object.create(_Program)

Program.onOptions = async function (options, fn) {

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
  
      Process.once('SIGINT', () => {
        Log.debug('Process.once(\'SIGINT\', () => { ... })')
  
        Process.exit(2)
  
      })
  
      Process.once('SIGTERM', () => {
        Log.debug('Process.once(\'SIGTERM\', () => { ... })')
  
        Process.exit(2)
  
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
  
      await fn()
  
    }
    catch (error) {

      Log.error('catch (error) { ... }')
      Log.error(error)
  
      Process.exit(2)
  
    }

  } 
  catch (error) {

    console.log(error)

    Process.exit(2)

  }

}

Program
  .command('process <torrentId> <torrentName> <torrentPath>')
  .description('Process the indicated torrent (i.e. identify, convert, match, rename, etc.)')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Command.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Command.logPath}'`)
  .action(async (torrentId, torrentName, torrentPath, options) => {

    await Program.onOptions(options, async () => {

      Log.debug(Command.line)
      Log.debug(torrentName)
      Log.debug(Command.line) 

      await Torrent.createTorrent(Path.join(torrentPath, torrentName)).process()

    })

    Process.exit(0)

  })

Program
  .command('transfer')
  .description('Transfer the contents of videos and music folders')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Command.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Command.logPath}'`)
  .action(async (options) => {

    await Program.onOptions(options, async () => {
      await Torrent.transfer()
    })

    Process.exit(0)

  })

Program
  .version(Package.version)
  .parse(Process.argv)
