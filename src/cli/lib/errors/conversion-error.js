function ConversionError(message) {

  Error.call(this)
  Error.captureStackTrace(this, ConversionError)

  this.message = message

}

ConversionError.prototype = Object.create(Error.prototype)
ConversionError.prototype.constructor = ConversionError
ConversionError.prototype.name = ConversionError.name

export default ConversionError
