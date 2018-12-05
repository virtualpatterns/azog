
import Directory from '../directory'

const directoryPrototype = Directory.getDirectoryPrototype()
const remotePrototype = Object.create(directoryPrototype)

remotePrototype.getParameters = function () {

  let parameters = null
  parameters = directoryPrototype.getParameters.call(this)

  return [
    ...parameters, 
    '--rsh=ssh'
  ]

}

const Remote = Object.create(Directory)

Remote.createDirectory = function (fromPath, toServer, toPath, prototype = remotePrototype) {
  return Directory.createDirectory.call(this, fromPath, `${toServer}:${toPath}`, prototype)
}

Remote.getDirectoryPrototype = function () {
  return remotePrototype
}

Remote.isDirectory = function (remote) {
  return remotePrototype.isPrototypeOf(remote)
}

export default Remote
