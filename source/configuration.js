import { Process } from '@virtualpatterns/mablung'
import OS from 'os'

const SECONDS_PER_NANOSECOND = 1 / 1000000000

const userExtension = require(`${Process.env.HOME}/Deluge/extension.json`)
const userKey = require(`${Process.env.HOME}/Deluge/key.json`)
const userTransform = require(`${Process.env.HOME}/Deluge/transform.json`)

export default {

  'command': {

    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Deluge/Log/azog.log`,

    'extension': {

      'book': [ '.epub', '.mobi', '.pdf', ...userExtension.book ],
      'music': [ '.flac', '.m4a', '.mp3', ...userExtension.music ],
      'video': [ '.avi', '.m4v', '.mkv', '.mov', '.mp4', ...userExtension.video ],
      'other': [ '.rar', '.zip', ...userExtension.other ]      

    },

    'key': {

      'movieDB': userKey.movieDB,
      'tvDB': userKey.tvDB

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
        /\s$/,
        ...( userTransform.remove.map((value) => {
          return new RegExp(value, 'gi')
        }) ) ],

      'replace': [
        { 'pattern': /\.+/g, 'with': ' ' },
        { 'pattern': /-/g, 'with': ' ' },
        ...( userTransform.replace.map((value) => {
          return {
            'pattern': new RegExp(value.pattern, 'gi'),
            'with': new RegExp(value.with)
          }
        }) )
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

  },

  'conversion': {

    'toSeconds': (seconds, nanoSeconds) => (seconds + nanoSeconds * SECONDS_PER_NANOSECOND).toFixed(2)

  },

  'line': '-'.repeat(80)

}
