import '@babel/polyfill'
import { Log } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'

Source.install({ 'handleUncaughtExceptions': false })

Configuration.command.path.downloaded = './resource/deluge/downloaded'
Configuration.command.path.processing = './resource/deluge/processing'
Configuration.command.path.processed = './resource/deluge/processed'
Configuration.command.path.failed = './resource/deluge/failed'

Log.createFormattedLog({ 'level': Configuration.test.logLevel }, Configuration.test.logPath)

require('./command/index')
