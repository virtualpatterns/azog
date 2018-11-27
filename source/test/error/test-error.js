import { Path } from '@virtualpatterns/mablung'

function TestError(message) {

  Error.call(this)
  Error.captureStackTrace(this, TestError)

  this.message = message

}

TestError.prototype = Object.create(Error.prototype)
TestError.prototype.constructor = TestError
TestError.prototype.name = TestError.name

function FileExists(path) {

  Error.call(this)
  Error.captureStackTrace(this, FileExists)

  this.message = `The file '${Path.trim(path)}' exists.`

}

FileExists.prototype = Object.create(TestError.prototype)
FileExists.prototype.constructor = FileExists
FileExists.prototype.name = FileExists.name

export { TestError, FileExists }
