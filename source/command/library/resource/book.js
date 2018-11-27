import { Path } from '@virtualpatterns/mablung'

import { Command } from '../../../configuration'

import Resource from '../resource'

const resourcePrototype = Resource.getResourcePrototype()
const bookPrototype = Object.create(resourcePrototype)

const Book = Object.create(Resource)

Book.createResource = function (path, prototype = bookPrototype) {
  return Resource.createResource.call(this, path, prototype)
}

Book.getResourcePrototype = function () {
  return bookPrototype
}

Book.isResource = function (book) {
  return bookPrototype.isPrototypeOf(book)
}

Book.isResourceClass = function (path) {
  return Command.extension.book.includes(Path.extname(path))
}

export default Book
