import '@babel/polyfill'
import { Log, Path } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'

Source.install({ 'handleUncaughtExceptions': true })

before(() => {

  Log.createFormattedLog({ 'level': Configuration.tests.logLevel }, Configuration.tests.logPath)

  Configuration.command.paths.downloaded = `${Path.trim(__dirname)}/../../resources/deluge/downloaded`
  Configuration.command.paths.processing = `${Path.trim(__dirname)}/../../resources/deluge/processing`
  Configuration.command.paths.processed = `${Path.trim(__dirname)}/../../resources/deluge/processed`
  Configuration.command.paths.failed = `${Path.trim(__dirname)}/../../resources/deluge/failed`

})

require('./command/index')

after(() => {})
