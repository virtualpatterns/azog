import { FileSystem, Process } from '@virtualpatterns/mablung'
import OS from 'os'

let userExtensionsPath = `${Process.env.HOME}/Deluge/extensions.json`
let userExtensions = FileSystem.accessRequireSync(userExtensionsPath, FileSystem.F_OK) || {}

let userKeysPath = `${Process.env.HOME}/Deluge/keys.json`
let userKeys = FileSystem.accessRequireSync(userKeysPath, FileSystem.F_OK) || {}

export default {

  'command': {

    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Deluge/Logs/azog.log`,

    'extensions': {

      'book': [ '.epub', '.mobi', '.pdf', ...(userExtensions.book || [])],
      'music': [ '.flac', '.m4a', '.mp3', ...(userExtensions.music || [])],
      'video': [ '.avi', '.m4v', '.mkv', '.mov', '.mp4', ...(userExtensions.video || [])],
      'other': [ '.rar', '.zip', ...(userExtensions.other || [])]

    },

    'keys': {

      'movieDB': userKeys.movieDB || 'ABC',
      'tvDB': userKeys.tvDB || 'XYZ'

    },

    'options': {

      'queue': {

        'autoStart': false,
        'concurrency': OS.cpus().length

      }

    },

    'paths': {

      'downloaded': `${Process.env.HOME}/Deluge/Downloaded`,
      'processing': `${Process.env.HOME}/Deluge/Processing`,
      'processed': `${Process.env.HOME}/Deluge/Processed`,
      'failed': `${Process.env.HOME}/Deluge/Failed`,

      'ffmpeg': '/usr/local/bin/ffmpeg',
      'ffprobe': '/usr/local/bin/ffprobe'

    }
        
  },

  'tasks': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-tasks.log`
  },

  'tests': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-tests.log`
  }

}
