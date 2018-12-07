import { Path } from '@virtualpatterns/mablung'

function LibraryError (message) {

  Error.call(this)
  Error.captureStackTrace(this, LibraryError)

  this.message = message

}

LibraryError.prototype = Object.create(Error.prototype)
LibraryError.prototype.constructor = LibraryError
LibraryError.prototype.name = LibraryError.name

function LibraryTransferError (path) {

  Error.call(this)
  Error.captureStackTrace(this, LibraryTransferError)

  this.message = `Unable to transfer the library '${Path.trim(path)}'.`

}

LibraryTransferError.prototype = Object.create(LibraryError.prototype)
LibraryTransferError.prototype.constructor = LibraryTransferError
LibraryTransferError.prototype.name = LibraryTransferError.name

export { LibraryError, LibraryTransferError }
