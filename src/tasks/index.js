import 'babel-polyfill'
import Jake from 'jake'
import { Log } from '@virtualpatterns/mablung'

import Configuration from '../config'

Jake.addListener('start', () => {
  Log.createFormattedLog({ 'level': Configuration.tasks.logLevel }, Configuration.tasks.logPath)
  Log.debug('Jake.addListener(\'start\', () => { ... })')
})

task('clear', [], { 'async': true }, () => {
  Jake.exec([ 'clear' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Remove built folders and files')
task('clean', [], { 'async': false }, () => {
  Jake.rmRf('dist/sandbox', { 'silent': true })
  Jake.rmRf('dist/cli', { 'silent': true })
})

desc('Count the number of dirty files')
task('count', [], { 'async': true }, () => {
  Jake.exec([ 'bin/find-dirty-files' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Lint files')
task('lint', [], { 'async': true }, () => {
  Jake.exec([ 'eslint --ignore-path .gitignore --ignore-pattern src/configuration.js --ignore-pattern src/tasks src' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Build files')
task('build', [ 'clean', 'count', 'lint' ], { 'async': true }, () => {
  Jake.exec([
    ...[ 'sandbox', 'cli' ].map((folderName) => `babel src/${folderName} --copy-files --out-dir dist/${folderName} --source-maps`),
    'npm --no-git-tag-version version prerelease'
  ], { 'printStderr': true, 'printStdout': false }, () => complete())
})

Jake.addListener('complete', () => {
  Log.debug('Jake.addListener(\'complete\', () => { ... })')
})
