import { Path } from '@virtualpatterns/mablung'

function DirectoryError (message) {

  Error.call(this)
  Error.captureStackTrace(this, DirectoryError)

  this.message = message

}

DirectoryError.prototype = Object.create(Error.prototype)
DirectoryError.prototype.constructor = DirectoryError
DirectoryError.prototype.name = DirectoryError.name

function DirectoryTransferError (path) {

  Error.call(this)
  Error.captureStackTrace(this, DirectoryTransferError)

  this.message = `Unable to transfer the directory '${Path.trim(path)}'.`

}

DirectoryTransferError.prototype = Object.create(DirectoryError.prototype)
DirectoryTransferError.prototype.constructor = DirectoryTransferError
DirectoryTransferError.prototype.name = DirectoryTransferError.name

export { DirectoryError, DirectoryTransferError }
