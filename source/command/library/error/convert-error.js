function ConvertError(message) {

  Error.call(this)
  Error.captureStackTrace(this, ConvertError)

  this.message = message

}

ConvertError.prototype = Object.create(Error.prototype)
ConvertError.prototype.constructor = ConvertError
ConvertError.prototype.name = ConvertError.name

export default ConvertError
