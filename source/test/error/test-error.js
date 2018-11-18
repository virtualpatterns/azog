function TestError(message) {

  Error.call(this)
  Error.captureStackTrace(this, TestError)

  this.message = message

}

TestError.prototype = Object.create(Error.prototype)
TestError.prototype.constructor = TestError
TestError.prototype.name = TestError.name

export default TestError
