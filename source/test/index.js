import '@babel/polyfill'
import { assert as Assert } from 'chai'
import { Log } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import { Command, Test } from '../configuration'

Source.install({ 'handleUncaughtExceptions': false })

Command.merge(`${__dirname}/../../resource/deluge/configuration.json`)
Log.createFormattedLog({ 'level': Test.logLevel }, Test.logPath)

describe('configuration', () => {

  describe('merge(path)', () => {

    describe('(before called)', () => {

      before(() => {
        Command.merge({
          'test': {
            'array': [
              'abc'
            ]
          }
        })
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
        Command.merge({
          'test': {
            'array': [
              'def'
            ]
          }
        })
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
