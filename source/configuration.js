import Is from '@pwn/is'
import Merge from 'deepmerge'
import OS from 'os'
import { Path, Process } from '@virtualpatterns/mablung'
import Property from 'object-path'

const MILLISECONDS_PER_MINUTE = 1000 * 60
const MILLISECONDS_PER_SECOND = 1000
const NANOSECONDS_PER_SECOND = 1000000000

const command = {
  'conversion': {
    'secondsToMilliseconds': (seconds) => seconds * MILLISECONDS_PER_SECOND,
    'minutesToMilliseconds': (minutes) => minutes * MILLISECONDS_PER_MINUTE,
    'toSeconds': (seconds, nanoseconds) => (seconds + nanoseconds / NANOSECONDS_PER_SECOND).toFixed(2)
  },
  'extension': {
    'book': [ '.epub', '.mobi', '.pdf' ],
    'music': [ '.flac', '.m4a', '.mp3' ],
    'video': [ '.avi', '.m4v', '.mkv', '.mov', '.mp4' ],
    'other': [ '.rar', '.zip' ]      
  },
  'key': {
    'movieDB': '',
    'tvDB': ''
  },
  'line': '-'.repeat(80),
  'logLevel': 'debug',
  'logPath': `${Process.env.HOME}/Deluge/Log/azog.log`,
  'path': {
    'downloaded': `${Process.env.HOME}/Deluge/Downloaded`,
    'processing': `${Process.env.HOME}/Deluge/Processing`,
    'processed': `${Process.env.HOME}/Deluge/Processed`,
    'failed': `${Process.env.HOME}/Deluge/Failed`,
    'ffmpeg': '/usr/local/bin/ffmpeg',
    'ffprobe': '/usr/local/bin/ffprobe'
  },
  'queue': {
    'autoStart': false,
    'concurrency': OS.cpus().length
  },
  'range': {
    'videoDurationInMinutes':  [ 15, Infinity ]
  },
  'transform': {
    'remove': [ 
      /[()]/g,
      /\s{2,}/g,
      /^\s/,
      /\s$/ 
    ],
    'replace': [
      { 
        'pattern': /\.+/g, 
        'with': ' ' 
      },
      { 
        'pattern': /-/g, 
        'with': ' ' 
      } 
    ]
  }
}

const task = {
  'logLevel': 'debug',
  'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-task.log`
}

const test = {
  'logLevel': 'debug',
  'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-test.log`,
  'path': {
    'module': `${__dirname}/command/index.js`
  }
}

const Command = Object.create(command)

Command.merge = function (path) {

  let paths = Is.array(path) ? path : [ path ]

  for (let _path of paths) {

    _path = Path.normalize(_path)
    
    let configuration = null
    let transform = null

    configuration = require(_path)

    transform = {}

    transform.remove = Property
      .get(configuration, 'transform.remove', [])
      .map((value) => {
        return new RegExp(value, 'gi')
      })
  
    transform.replace = Property
      .get(configuration, 'transfrom.replace', [])
      .map((value) => {
        return {
          'pattern': new RegExp(value.pattern, 'gi'),
          'with': new RegExp(value.with)
        }
      })

    configuration.transform = transform
  
    let prototype = null

    prototype = Object.getPrototypeOf(Command)
    prototype = Merge(prototype, configuration)
    Object.setPrototypeOf(Command, prototype)

  }

}

const Test = Object.create(test)
const Task = Object.create(task)

export { Command, Test, Task }
