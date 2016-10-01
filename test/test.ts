import MapboxMap from '../src/createMap'
import * as jsondiffpatch from 'jsondiffpatch'


const token = `pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6ImNpbHJsZnJ3NzA4dHZ1bGtub2hnbGVnbHkifQ.ph2UH9MoZtkVB0_RNBOXwA`
mocha.setup("bdd")
const assert = chai.assert

describe(`Map creating`, function() {
  it(`displays a map`, function(done) {
    assert(1 === 1, "this happened")
    done()
  })
})

describe(`Map creating`, function() {
  it(`displays a map`, function(done) {
    const map = new MapboxMap(token, {
      container: `mapdiv`, 
      style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
      center: [-74.50, 40], // starting position
      zoom: 9 // starting zoom
    })
    done()
  })
})

describe(`Testing diff/patch`, function() {
  it(`basic test`, function () {
    const out = jsondiffpatch.diff({}, {type: `map`, place: { count: 3 }})
    assert(!!out.type, "has expected new property")
    assert(Object.keys(out).length === 2, "has expected length")
  })

})


mocha.checkLeaks()
mocha.run()