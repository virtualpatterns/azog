
import { assert as Assert } from 'chai'
import { Path } from '@virtualpatterns/mablung'

import Configuration from '../../configuration'
import Resource from '../../library/resource'

describe('resource', () => {

  describe('getToPath()', () => {

    [
      {
        'fromPath': 'Loaded Edibles - Cooking with Cannabis Basics.pdf',
        'toPath': Path.join(Configuration.path.processed.other, 'Loaded Edibles - Cooking with Cannabis Basics.pdf')
      }
    ].forEach((test) => {

      describe(`(when passing '${test.fromPath}')`, () => {
    
        let resource = null 

        before(() => {
          resource = Resource.createResource(test.fromPath)
        })
  
        it(`should return '${test.toPath}'`, async () => {
          Assert.equal(await resource.getToPath(), test.toPath)
        })

      })

    })

  })

})
