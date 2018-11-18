import Merge from 'deepmerge'
import OS from 'os'
import { Process } from '@virtualpatterns/mablung'
import Property from 'object-path'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_NANOSECOND = 1 / 1000000000

const Configuration = Object.create({
  'command': {
    'conversion': {
      'toMilliseconds': (seconds) => seconds * MILLISECONDS_PER_SECOND,
      'toSeconds': (seconds, nanoSeconds) => (seconds + nanoSeconds * SECONDS_PER_NANOSECOND).toFixed(2)
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
    'minimum': {
      'minutes': 15
    },
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
  },

  'task': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-task.log`
  },

  'test': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-test.log`,
    'path': {
      'module': `${__dirname}/command/index.js`,
    }
  }

})

Configuration.merge = function (path) {

  let inputPath = path.replace(/^\./, Process.cwd())
  let inputConfiguration = require(inputPath)

  inputConfiguration.transform = {

    'remove': Property.get(inputConfiguration, 'transform.remove', [])
      .map((value) => {
        return new RegExp(value, 'gi')
      }),

    'replace': Property.get(inputConfiguration, 'transfrom.replace', [])
      .map((value) => {
        return {
          'pattern': new RegExp(value.pattern, 'gi'),
          'with': new RegExp(value.with)
        }
      })

  }

  Configuration.command = Merge(Configuration.command, inputConfiguration)

}

export default Configuration