import 'babel-polyfill'
import Jake from 'jake'
import { Log } from '@virtualpatterns/mablung'

import Configuration from '../configuration'

Jake.addListener('start', () => {

  Jake.rmRf(Configuration.tasks.logPath, { 'silent': true })

  Jake.rmRf(Configuration.cli.logPath, { 'silent': true })
  Jake.rmRf(Configuration.cli.errorPath, { 'silent': true })
  Jake.rmRf(Configuration.cli.outputPath, { 'silent': true })

  Log.createFormattedLog({ 'level': 'debug' }, Configuration.tasks.logPath)
  Log.debug('Jake.addListener(\'start\', () => { ... })')
  
})

task('clear', [], { 'async': true }, () => {
  Jake.exec([ 'clear' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Remove built folders and files')
task('clean', [], { 'async': false }, () => {
  Jake.rmRf('distributables/sandbox', { 'silent': true })
  Jake.rmRf('distributables/cli', { 'silent': true })
})

desc('Count the number of dirty files')
task('count', [], { 'async': true }, () => {
  Jake.exec([ 'bin/find-dirty-files' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Lint files')
task('lint', [], { 'async': true }, () => {
  Jake.exec([ 'eslint --ignore-path .gitignore --ignore-pattern source/configuration.js --ignore-pattern source/tasks source' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Build files')
task('build', [ 'clean', 'count', 'lint' ], { 'async': true }, () => {
  Jake.exec([
    ...[ 'sandbox', 'cli' ].map((folderName) => `babel source/${folderName} --copy-files --out-dir distributables/${folderName} --source-maps`),
    'npm --no-git-tag-version version prerelease'
  ], { 'printStderr': true, 'printStdout': false }, () => complete())
})

Jake.addListener('complete', () => {
  Log.debug('Jake.addListener(\'complete\', () => { ... })')
})
