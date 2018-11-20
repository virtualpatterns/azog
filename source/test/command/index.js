import { assert as Assert } from 'chai'
import ChildProcess from 'child_process'
import { FileSystem } from '@virtualpatterns/mablung'

import { Command, Test } from '../../configuration'

describe('command', () => {

  describe('index', () => {

    describe('(when launched with an invalid torrent)', () => {

      let childProcess = null

      before(() => {
        childProcess = ChildProcess.fork(Test.path.module, [
          '--configurationPath', `${__dirname}/../../../resource/deluge/configuration.json`,
          '0', '0', `${__dirname}/../../../resource/deluge/downloaded` ], { 'stdio': 'inherit' })
      })
    
      it('should exit with the correct code', (complete) => {
        childProcess.on('exit', (code) => {
          Assert.equal(code, 2)
          complete()
        })
      })

    })

    describe('(when launched with a valid torrent)', () => {

      let torrentId = null
      let torrentName = null
    
      let childProcess = null

      before(async () => {

        torrentId = '6fe895e52e803f58e640e3d8311e1e8e1231e599'
        torrentName = 'Sleeping Beauties by Stephen King'
    
        await FileSystem.remove(Command.path.processed)

        childProcess = ChildProcess.fork(Test.path.module, [ 
          '--configurationPath', `${__dirname}/../../../resource/deluge/configuration.json`,
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

  })

  require('./library/index')

})
