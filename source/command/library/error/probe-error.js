function ProbeError(message) {

  Error.call(this)
  Error.captureStackTrace(this, ProbeError)

  this.message = message

}

ProbeError.prototype = Object.create(Error.prototype)
ProbeError.prototype.constructor = ProbeError
ProbeError.prototype.name = ProbeError.name

export default ProbeError
