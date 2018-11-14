function MatchError(message) {

  Error.call(this)
  Error.captureStackTrace(this, MatchError)

  this.message = message

}

MatchError.prototype = Object.create(Error.prototype)
MatchError.prototype.constructor = MatchError
MatchError.prototype.name = MatchError.name

export default MatchError
