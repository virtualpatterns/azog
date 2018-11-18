import '@babel/polyfill'
import { Log } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'

Source.install({ 'handleUncaughtExceptions': false })

Configuration.merge(`${__dirname}/../../resource/deluge/configuration.json`)

Log.createFormattedLog({ 'level': Configuration.test.logLevel }, Configuration.test.logPath)

require('./command/index')
