import '@babel/polyfill'
import { assert as Assert } from 'chai'
import ChildProcess from 'child_process'
import { FileSystem, Log } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'
// import Migration from '../library/migration'

Source.install({ 'handleUncaughtExceptions': false })

Configuration.merge(`${__dirname}/../../resource/deluge/configuration.json`)
Log.createFormattedLog({ 'level': Configuration.test.logLevel }, Configuration.test.logPath)

require('./configuration')
require('./library/index')

describe('index', () => {

  [
    {
      'parameters': [ 'create', 'azog-test' ],
      'exitCode': 0,
      'afterFn': () => {
        return FileSystem.remove(Configuration.path.migration.source)
      }
    },
    {
      'parameters': [ 'install' ],
      'exitCode': 0,
      'afterFn': () => {}
    },
    {
      'parameters': [ 'process', '0', '0', '0' ],
      'exitCode': 2,
      'afterFn': () => {}
    },
    {
      'parameters': [ 'process', '0', 'Book', `${__dirname}/../../resource/deluge/downloaded` ],
      'exitCode': 0,
      'afterFn': () => {
        return FileSystem.remove(Configuration.path.processed.other)
      }
    },
    {
      'parameters': [ 'uninstall' ],
      'exitCode': 0,
      'afterFn': () => {}
    }
  ].forEach((test) => {

    describe(`(when passing '${test.parameters.join('\' \'')}')`, () => {

      let process = null
  
      before(() => {
        process = ChildProcess.fork(Configuration.test.path.module, [
          '--configurationPath', `${__dirname}/../../resource/deluge/configuration.json`,
          '--logLevel', Configuration.test.logLevel, '--logPath', Configuration.test.logPath,
          ...test.parameters
        ], { 'stdio': 'inherit' })
      })
    
      it(`should exit with ${test.exitCode}`, (complete) => {
        process.on('exit', (code) => {
          Assert.equal(code, test.exitCode)
          complete()
        })
      })
      
      after(() => {
        return test.afterFn()
      })
  
    })
     
  })

  // describe.only('(when transferring)', () => {

  //   let process = null

  //   before(() => {
  //     process = ChildProcess.fork(Configuration.test.path.module, [
  //       'transfer',
  //       '--configurationPath', `${__dirname}/../../resource/deluge/configuration.json`,
  //       '--logLevel', Configuration.test.logLevel, '--logPath', Configuration.test.logPath ], { 'stdio': 'inherit' })
  //   })
  
  //   it('should exit with the correct code', (complete) => {
  //     process.on('exit', (code) => {
  //       Assert.equal(code, 0)
  //       complete()
  //     })
  //   })
  
  //   // after(async () => {
  //   //   await FileSystem.remove(Configuration.path.processed)
  //   // })

  // })
    
})
