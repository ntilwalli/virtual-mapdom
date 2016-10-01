//import 'mapbox-gl'

export default class MapboxMap {
  constructor(
    private _accessToken: string,
    private _options: mapboxgl.MapboxOptions
  ) {

    if(!mapboxgl.accessToken) {
      mapboxgl.accessToken =  _accessToken
    }

    const map = new mapboxgl.Map(_options)
  }


}