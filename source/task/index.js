import '@babel/polyfill'
import Jake from 'jake'
import { Log, Path } from '@virtualpatterns/mablung'

import { Task, Test } from '../configuration'

Jake.addListener('start', () => {

  Jake.rmRf(Task.logPath, { 'silent': true })
  Jake.rmRf(Test.logPath, { 'silent': true })

  console.log(`\nLogging '${Task.logLevel}' to '${Path.trim(Task.logPath)}' ...\n`) // eslint-disable-line no-console
  Log.createFormattedLog({ 'level': Task.logLevel }, Task.logPath)
  Log.debug('Jake.addListener(\'start\', () => { ... })')
  
})

desc('Remove built folders and files')
task('clean', [], { 'async': false }, () => {
  Jake.rmRf('distributable/sandbox', { 'silent': true })
  Jake.rmRf('distributable/command', { 'silent': true })
})

desc('Count the number of dirty files')
task('count', [], { 'async': true }, () => {
  Jake.exec([ 'script/find-dirty-files' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Lint files')
task('lint', [], { 'async': true }, () => {
  Jake.exec([ 'eslint --ignore-path .gitignore --ignore-pattern source/configuration.js --ignore-pattern source/task source' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Build files')
task('build', [ 'clean', 'count', 'lint' ], { 'async': true }, () => {
  Jake.exec([
    ...[ 'command', 'sandbox', 'test' ].map((folderName) => `babel --config-file ./distributable/babel.configuration source/${folderName} --copy-files --out-dir distributable/${folderName} --source-maps`),
    'npm --no-git-tag-version version prerelease'
  ], { 'printStderr': true, 'printStdout': false }, () => complete())
})

desc('Run tests')
task('test', [ 'build' ], { 'async': true }, () => {
  Jake.exec([ 'mocha --bail --timeout 0 distributable/test/index.js' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Publish package')
task('publish', [ 'test' ], { 'async': true }, () => {
  Jake.exec([
    'npm publish --access public',
    'git push',
    'npm --no-git-tag-version version patch',
    'git add package.json',
    'git commit --message="Increment version"'
  ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

Jake.addListener('complete', () => {
  Log.debug('Jake.addListener(\'complete\', () => { ... })')
})
