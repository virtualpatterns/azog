import { Log, Path } from '@virtualpatterns/mablung'
import _Zip from 'adm-zip'

import Configuration from '../../configuration'

import Archive from './archive'

const archivePrototype = Archive.getResourcePrototype()
const zipPrototype = Object.create(archivePrototype)

zipPrototype.process = function () {

  Log.debug(`Extracting '${Path.basename(this.path)}' ...`);

  (new _Zip(this.path)).extractAllTo(Configuration.path.processed.other, true)
  
}

const Zip = Object.create(Archive)

Zip.createResource = function (path, connection, prototype = zipPrototype) {
  return Archive.createResource.call(this, path, connection, prototype)
}

Zip.getResourcePrototype = function () {
  return zipPrototype
}

Zip.isResource = function (zip) {
  return zipPrototype.isPrototypeOf(zip)
}

Zip.isResourceClass = function (path) {
  return Configuration.extension.zip.includes(Path.extname(path))
}

export default Zip
