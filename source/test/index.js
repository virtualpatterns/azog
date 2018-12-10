import '@babel/polyfill'
import { assert as Assert } from 'chai'
import ChildProcess from 'child_process'
import { FileSystem, Log } from '@virtualpatterns/mablung'
import Source from 'source-map-support'

import Configuration from '../configuration'

Source.install({ 'handleUncaughtExceptions': false })

Configuration.merge(`${__dirname}/../../resource/deluge/configuration.json`)
Log.createFormattedLog({ 'level': Configuration.test.logLevel }, Configuration.test.logPath)

describe('configuration', () => {

  describe('merge(path)', () => {

    describe('(before called)', () => {

      before(() => {
        Configuration.merge({
          'test': {
            'array': [
              'abc'
            ]
          }
        })
      })

      it('should include \'abc\'', () => {
        Assert.isOk(Configuration.test.array.includes('abc'))
      })

      it('should not include \'def\'', () => {
        Assert.isNotOk(Configuration.test.array.includes('def'))
      })

    })

    describe('(after called)', () => {

      before(() => {
        Configuration.merge({
          'test': {
            'array': [
              'def'
            ]
          }
        })
      })

      it('should include \'abc\'', () => {
        Assert.isOk(Configuration.test.array.includes('abc'))
      })

      it('should include \'def\'', () => {
        Assert.isOk(Configuration.test.array.includes('def'))
      })

    })

  })

})

require('./library/index')

describe('index', () => {

  describe('(when processing an invalid torrent)', () => {

    let process = null

    before(() => {
      process = ChildProcess.fork(Configuration.test.path.module, [
        'process',
        '--configurationPath', `${__dirname}/../../resource/deluge/configuration.json`,
        '--logLevel', Configuration.test.logLevel, '--logPath', Configuration.test.logPath,
        '0', '0', `${__dirname}/../../resource/deluge/downloaded` ], { 'stdio': 'inherit' })
    })
  
    it('should exit with the correct code', (complete) => {
      process.on('exit', (code) => {
        Assert.equal(code, 2)
        complete()
      })
    })

  })

  describe('(when processing a valid torrent)', () => {

    let torrentId = null
    let torrentName = null
  
    let process = null

    before(async () => {

      torrentId = '0'
      torrentName = 'Book'
  
      await FileSystem.remove(Configuration.path.processed)

      process = ChildProcess.fork(Configuration.test.path.module, [ 
        'process',
        '--configurationPath', `${__dirname}/../../resource/deluge/configuration.json`,
        '--logLevel', Configuration.test.logLevel, '--logPath', Configuration.test.logPath,
        torrentId, torrentName, `${__dirname}/../../resource/deluge/downloaded` ], { 'stdio': 'inherit' })

    })
  
    it('should exit with the correct code', (complete) => {
      process.on('exit', (code) => {
        Assert.equal(code, 0)
        complete()
      })
    })
  
    after(async () => {
      await FileSystem.remove(Configuration.path.processed)
    })

  })

  describe('(when transferring)', () => {

    let process = null

    before(() => {
      process = ChildProcess.fork(Configuration.test.path.module, [
        'transfer',
        '--configurationPath', `${__dirname}/../../resource/deluge/configuration.json`,
        '--logLevel', Configuration.test.logLevel, '--logPath', Configuration.test.logPath ], { 'stdio': 'inherit' })
    })
  
    it('should exit with the correct code', (complete) => {
      process.on('exit', (code) => {
        Assert.equal(code, 0)
        complete()
      })
    })

  })

  describe('(when selecting a server)', () => {

    let stdout = ''
    let code = null

    before((complete) => {

      let process = ChildProcess.fork(Configuration.test.path.module, [
        'select',
        '--configurationPath', `${__dirname}/../../resource/deluge/configuration.json`,
        '--logLevel', Configuration.test.logLevel, '--logPath', Configuration.test.logPath 
      ], { 'stdio': 'pipe' })

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.on('exit', (_code) => {
        code = _code
        complete()
      })

    })
  
    it('should exit with a matching server name', () => {
      Assert.match(stdout, /ca\d+\.nordvpn\.com/i)
    })

    it('should exit with the correct code', () => {
      Assert.equal(code, 0)
    })

  })

})
