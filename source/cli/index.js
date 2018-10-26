import 'babel-polyfill'
import Command from 'commander'
import { Log } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'
import Package from '../../package.json'
import Process from './process'

Source.install({ 'handleUncaughtExceptions': false })

Command
  .version(Package.version)

Command
  .command('completed <torrentId> <torrentName> [torrentPath]')
  .description('Process the indicated torrent')
  .action(async (torrentId, torrentName) => {

    try {

      Log.createFormattedLog({ 'level': Configuration.cli.logLevel }, Configuration.cli.logPath)

      try {

        Process.once('SIGINT', async () => {
          Log.debug('Process.once(\'SIGINT\', async () => { ... })')

          Process.exit(1)

        })

        Process.once('SIGTERM', async () => {
          Log.debug('Process.once(\'SIGTERM\', async () => { ... })')

          Process.exit(1)

        })

        Process.once('uncaughtException', async (error) => {
          Log.error('Process.once(\'uncaughtException\', async (error) => { ... })')
          Log.error(error)

          Process.exit(2)

        })

        Process.on('warning', (error) => {
          Log.error('Process.on(\'warning\', (error) => { ... })')
          Log.error(error)
        })

        await Process.onTorrent(torrentId, torrentName)

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