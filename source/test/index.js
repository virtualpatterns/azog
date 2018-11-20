import '@babel/polyfill'
import { assert as Assert } from 'chai'
import { Log, Path } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import { Command, Test } from '../configuration'

Source.install({ 'handleUncaughtExceptions': false })

Command.merge(`${__dirname}/../../resource/deluge/configuration.json`)

console.log(`\nLogging '${Test.logLevel}' to '${Path.trim(Test.logPath)}' ...\n`) // eslint-disable-line no-console
Log.createFormattedLog({ 'level': Test.logLevel }, Test.logPath)

describe('configuration', () => {

  describe('merge', () => {

    describe('(before called)', () => {

      before(() => {
        Command.merge(`${__dirname}/before.json`)
      })

      it('should include \'abc\'', () => {
        Assert.isOk(Command.test.array.includes('abc'))
      })

      it('should not include \'def\'', () => {
        Assert.isNotOk(Command.test.array.includes('def'))
      })

    })

    describe('(after called)', () => {

      before(() => {
        Command.merge(`${__dirname}/after.json`)
      })

      it('should include \'abc\'', () => {
        Assert.isOk(Command.test.array.includes('abc'))
      })

      it('should include \'def\'', () => {
        Assert.isOk(Command.test.array.includes('def'))
      })

    })

  })

})

require('./command/index')
