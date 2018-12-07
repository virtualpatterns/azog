import { assert as Assert } from 'chai'
import ChildProcess from 'child_process'
import { FileSystem } from '@virtualpatterns/mablung'

import { Command, Test } from '../../configuration'

describe('command', () => {

  require('./library/index')

  describe('index', () => {

    describe('(when processing an invalid torrent)', () => {

      let childProcess = null

      before(() => {
        childProcess = ChildProcess.fork(Test.path.module, [
          'process',
          '--configurationPath', `${__dirname}/../../../resource/deluge/configuration.json`,
          '--logLevel', Test.logLevel, '--logPath', Test.logPath,
          '0', '0', `${__dirname}/../../../resource/deluge/downloaded` ], { 'stdio': 'inherit' })
      })
    
      it('should exit with the correct code', (complete) => {
        childProcess.on('exit', (code) => {
          Assert.equal(code, 2)
          complete()
        })
      })

    })

    describe('(when processing a valid torrent)', () => {

      let torrentId = null
      let torrentName = null
    
      let childProcess = null

      before(async () => {

        torrentId = '0'
        torrentName = 'Book'
    
        await FileSystem.remove(Command.path.processed)

        childProcess = ChildProcess.fork(Test.path.module, [ 
          'process',
          '--configurationPath', `${__dirname}/../../../resource/deluge/configuration.json`,
          '--logLevel', Test.logLevel, '--logPath', Test.logPath,
          torrentId, torrentName, `${__dirname}/../../../resource/deluge/downloaded` ], { 'stdio': 'inherit' })

      })
    
      it('should exit with the correct code', (complete) => {
        childProcess.on('exit', (code) => {
          Assert.equal(code, 0)
          complete()
        })
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.processed)
      })

    })

    describe('(when transferring)', () => {

      let childProcess = null

      before(() => {
        childProcess = ChildProcess.fork(Test.path.module, [
          'transfer',
          '--configurationPath', `${__dirname}/../../../resource/deluge/configuration.json`,
          '--logLevel', Test.logLevel, '--logPath', Test.logPath ], { 'stdio': 'inherit' })
      })
    
      it('should exit with the correct code', (complete) => {
        childProcess.on('exit', (code) => {
          Assert.equal(code, 0)
          complete()
        })
      })
    
      after(async () => {
        await FileSystem.remove(Command.path.processed)
      })

    })

  })

})
