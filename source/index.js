import '@babel/polyfill'
import { Log, Path, Process } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from './configuration'
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
  .action(async (torrentId, torrentName, torrentPath, options) => {

    Program.onAction(options, async () => {

      Log.debug(Configuration.line)
      Log.debug(torrentName)
      Log.debug(Configuration.line) 

      await Torrent.createTorrent(Path.join(torrentPath, torrentName)).process()

    })

  })

Program
  .command('transfer')
  .description('Transfer the contents of videos and music folders')
  .option('--configurationPath <path>', 'Configuration path(s) separated by , if multiple')
  .option('--logLevel <path>', `Log level, one of 'fatal', 'error', 'warn', 'info', 'debug', or 'trace', defaults to '${Configuration.logLevel}'`)
  .option('--logPath <path>', `Log file path, 'console' ouputs to the console, defaults to '${Configuration.logPath}'`)
  .action((options) => {

    Program.onAction(options, async () => {

      Log.debug(Configuration.line)

      await Torrent.transfer()

    })

  })

Program
  .version(Package.version)
  .parse(Process.argv)
