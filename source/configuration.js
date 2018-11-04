import { FileSystem, Process } from '@virtualpatterns/mablung'
import OS from 'os'

let userExtensionPath = `${Process.env.HOME}/Deluge/extension.json`
let userExtension = FileSystem.accessRequireSync(userExtensionPath, FileSystem.F_OK) || {}

let userKeysPath = `${Process.env.HOME}/Deluge/key.json`
let userKeys = FileSystem.accessRequireSync(userKeysPath, FileSystem.F_OK) || {}

export default {

  'command': {

    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Deluge/Log/azog.log`,

    'extension': {

      'book': [ '.epub', '.mobi', '.pdf', ...(userExtension.book || [])],
      'music': [ '.flac', '.m4a', '.mp3', ...(userExtension.music || [])],
      'video': [ '.avi', '.m4v', '.mkv', '.mov', '.mp4', ...(userExtension.video || [])],
      'other': [ '.rar', '.zip', ...(userExtension.other || [])]

    },

    'key': {

      'movieDB': userKeys.movieDB || 'ABC',
      'tvDB': userKeys.tvDB || 'XYZ'

    },

    'option': {

      'queue': {

        'autoStart': false,
        'concurrency': OS.cpus().length

      }

    },

    'path': {

      'downloaded': `${Process.env.HOME}/Deluge/Downloaded`,
      'processing': `${Process.env.HOME}/Deluge/Processing`,
      'processed': `${Process.env.HOME}/Deluge/Processed`,
      'failed': `${Process.env.HOME}/Deluge/Failed`,

      'ffmpeg': '/usr/local/bin/ffmpeg',
      'ffprobe': '/usr/local/bin/ffprobe'

    }
        
  },

  'task': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-task.log`
  },

  'test': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-test.log`
  }

}
