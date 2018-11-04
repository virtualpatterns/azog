import '@babel/polyfill'
import { Log, Path } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'

Source.install({ 'handleUncaughtExceptions': true })

before(() => {

  Log.createFormattedLog({ 'level': Configuration.test.logLevel }, Configuration.test.logPath)

  Configuration.command.path.downloaded = `${Path.trim(__dirname)}/../../resource/deluge/downloaded`
  Configuration.command.path.processing = `${Path.trim(__dirname)}/../../resource/deluge/processing`
  Configuration.command.path.processed = `${Path.trim(__dirname)}/../../resource/deluge/processed`
  Configuration.command.path.failed = `${Path.trim(__dirname)}/../../resource/deluge/failed`

})

require('./command/index')

after(() => {})
