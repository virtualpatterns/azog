import { Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'

import Resource from '../resource'

const resourcePrototype = Resource.getResourcePrototype()
const bookPrototype = Object.create(resourcePrototype)

const Book = Object.create(Resource)

Book.createResource = function (path, connection, prototype = bookPrototype) {
  return Resource.createResource.call(this, path, connection, prototype)
}

Book.getResourcePrototype = function () {
  return bookPrototype
}

Book.isResource = function (book) {
  return bookPrototype.isPrototypeOf(book)
}

Book.isResourceClass = function (path) {
  return Configuration.extension.book.includes(Path.extname(path))
}

export default Book
