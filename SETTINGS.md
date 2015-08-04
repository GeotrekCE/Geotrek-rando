# GEOTREK RANDO V2 - Settings

In order to extend the default configuration, you just need to add your customisation to the `src/app/config/settings.custom.json` main object.


## LIST OF SETTINGS

### Global settings

* PLATFORM_ID:
*type: string*
*default:* `"geotrek-rando"`
Unique id for your geotrek website. You need to change it.
It's used for Localstorage between other things.
`"PLATFORM_ID": "my-geotrek"`

* API_URL:
*type: string(url)*
*default:* `"tests/dataset"`
URL of the location where geotrek rando should find the api. If you're using Geotrek Admin, it can be either the admin server url or the rando server url (if you activate data sync on the admi nside)
`"API_URL": "http://mygeotrek-rando.com/data"`

* BACKOFFICE_URL:
*type: string(url)*
*default:* `""`
URL of your backoffice where rando can send requests like for the warning module.
`"BACKOFFICE_URL": "http://mygeotrek-admin.com"`

* ENABLE_HTML_MODE:
*type: boolean*
*default:* `false`
When you have html5Mode enabled, the # character will no longer be used in your urls. The # symbol is useful because it requires no server side configuration. Without #, the url looks much nicer, but it also requires server side rewrites. Please refer to [ui-router FAQ](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode)
`"ENABLE_HTML_MODE": true`


### Interface parameters

* LOGO_FILE:
*type: string(file name)*
*default:* `""`
*accept: .jpg, .png, .svg*
If you want to use a logo in the app. It's just the name of the file, which goes into `src/images/custom`.
`"LOGO_FILE": "mon-logo.svg"`

* FAVICON:
*type: string(file name)*
*default:* `""`
*accept: .ico, .png*
If you want to use a custom favicon in the app. It's just the name of the file, which goes into `src/images/custom`.
`"FAVICON": "my-favicon.png"`

* SHOW_HOME:
*type: boolean*
*default:* `false`
`"SHOW_HOME": true`

* HOME_TEMPLATE_FILE
*type: object*
*default:* `{}`
*keys: string(lang code)*
*values: string(file name)*
```
"HOME_TEMPLATE_FILE": {
    "fr": "my-home-fr.html",
    "en": "my-home-en.html",
    "de": "my-home-de.html",
    "nl": ""
}
```

* SHOW_FOOTER:
*type: boolean*
*default:* `false`
`"SHOW_FOOTER": false`

* FOOTER_TEMPLATE_FILE:
*type: string(file name)*
*default:* `""`
`"FOOTER_TEMPLATE_FILE": "my-footer.html"`

* HEADER_TEMPLATE_FILE:
*type: string(file name)*
*default:* `""`
`"HEADER_TEMPLATE_FILE": ""`

* ENABLE_DISTRICTS_FILTERING:
*type: boolean*
*default:* `true`
`"ENABLE_DISTRICTS_FILTERING": true`

* ENABLE_CITIES_FILTERING:
*type: boolean*
*default:* `true`
`"ENABLE_CITIES_FILTERING": true`

* ENABLE_STRUCTURE_FILTERING:
*type: boolean*
*default:* `true`
`"ENABLE_STRUCTURE_FILTERING": true`

* RULES_FLAT_PAGES_ID:
*type: string*
*default:* `""`
`"RULES_FLAT_PAGES_ID": ""`

* FAVORITES_ICON:
*type: string([font awesome icon](http://fortawesome.github.io/Font-Awesome/icons/))*
*default:* `"heart"`
`"FAVORITES_ICON": "star"`

* SHARE_ICON:
*type: string([font awesome icon](http://fortawesome.github.io/Font-Awesome/icons/))*
*default:* `"share-alt"`
`"SHARE_ICON": "share"`

* PLACEHOLDER_IMAGE:
*type: string(file name)*
*default:* `""`
`"PLACEHOLDER_IMAGE": ""`


### Languages

* DEFAULT_LANGUAGE:
*type: string(lang code)*
*default:* `"en"`
`"DEFAULT_LANGUAGE": "fr"`

* ENABLED_LANGUAGES:
*type: array of strings(lang codes)*
*default:* `["fr", "en", "de", "nl"]`
*available translations: fr, en, de, nl*
This is the list of the enabled languages in the header lang menu and the app.
```
"AVAILABLE_LANGUAGES": ["fr", "en"]
```


### Categories

* ENABLE_TREKS:
*type: boolean*
*default:* `true`
`"ENABLE_TREKS": true`

* ENABLE_TOURISTIC_CONTENT:
*type: boolean*
*default:* `true`
`"ENABLE_TOURISTIC_CONTENT": true`

* ENABLE_TOURISTIC_EVENTS:
*type: boolean*
*default:* `true`
`"ENABLE_TOURISTIC_EVENTS": true`

* DEFAULT_ACTIVE_CATEGORIES:
*type: array of strings(categories id)*
*default:* `["T"]`
`"DEFAULT_ACTIVE_CATEGORIES": ["T"]`

* LIST_EXCLUDE_CATEGORIES:
*type: array of strings(categories id)*
*default:* `[]`
`"LIST_EXCLUDE_CATEGORIES": []`

* ENABLE_UNIQUE_CAT:
*type: boolean*
*default:* `false`
`"ENABLE_UNIQUE_CAT": false`

* DEFAULT_INTEREST:
*type: string*
*default:* `"pois"`
*possible values: `"pois"`, `"near"`, `"children"`, `"parent"`, ""*
Chose which interest to open by default on detail page
`"DEFAULT_INTEREST": "pois"`


### Social networks

* FACEBOOK_APP_ID:
*type: string*
*default:* `""`
`"FACEBOOK_APP_ID": "12345678912345678"`

* TWITTER_ID:
*type: string*
*default:* `""`
`"TWITTER_ID": "@my-geotrek"`

* DEFAULT_SHARE_IMG:
*type: string(file name)*
*default:* `""`
`"DEFAULT_SHARE_IMG": "my-sharing-image.jpg"`

* GOOGLE_ANALYTICS_ID:
*type: string*
*default:* *
`"GOOGLE_ANALYTICS_ID": "UA-12345678-9"`


### Map

* MAIN_LEAFLET_BACKGROUND:
*type: object*

    - LAYER_URL:
    *type: string(tiles server url)*
    *default:* `"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"`

    - OPTIONS:
    *type: object([Leaflet tileLyer options](http://leafletjs.com/reference.html#tilelayer-options))*
    *default:*
    ```
        {
            "id": "main",
            "attribution": "(c) OpenstreetMap"
        }
    ```

```
"MAIN_LEAFLET_BACKGROUND": {
    "LAYER_URL": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "OPTIONS": {
        "id": "main",
        "attribution": "(c) OpenstreetMap"
    }
},
```

* SATELLITE_LEAFLET_BACKGROUND:
*type: object*

    - LAYER_URL:
    *type: string(tiles server url)*
    *default:* `"http://{s}.tile.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png"`

    - OPTIONS:
    *type: object([Leaflet tileLyer options](http://leafletjs.com/reference.html#tilelayer-options))*
    *default:*
    ```
        {
            "id": "satellite",
            "attribution": "(c) MapBox Satellite"
        }
    ```

```
"SATELLITE_LEAFLET_BACKGROUND": {
    "LAYER_URL": "http://{s}.tile.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png",
    "OPTIONS": {
        "id": "satellite",
        "attribution": "(c) MapBox Satellite"
    }
}
```

* LEAFLET_CONF:
*type: object*
    - CENTER_LATITUDE:
    *type: float(latitude)*
    *default:* `44.83`

    - CENTER_LONGITUDE:
    *type: float(longitude)*
    *default:* `6.34`

    - DEFAULT_ZOOM:
    *type: int*
    *default:* `12`

    - DEFAULT_MIN_ZOOM:
    *type: int*
    *default:* `8`

    - DEFAULT_MAX_ZOOM:
    *type: int*
    *default:* `17`

```
"LEAFLET_CONF": {
    "CENTER_LATITUDE": 44.83,
    "CENTER_LONGITUDE": 6.34,
    "DEFAULT_ZOOM": 12,
    "DEFAULT_MIN_ZOOM": 8,
    "DEFAULT_MAX_ZOOM": 17
}
```

* TREKS_TO_GEOJSON_ZOOM_LEVEL:
*type: int*
*default:* `14`
`"TREKS_TO_GEOJSON_ZOOM_LEVEL" : 14`

* UPDATE_MAP_ON_FILTER:
*type: boolean*
*default:* `false`
`"UPDATE_MAP_ON_FILTER": false`

* ACTIVE_MINIMAP:
*type: boolean*
*default:* `true`
`"ACTIVE_MINIMAP": true`

* MINIMAP_ZOOM:
*type: object*
    - MINI:
    *type: int*
    *default:* `0`
    - MAX:
    *type: int*
    *default:* `12`

```
"MINIMAP_ZOOM": {
    "MINI": 0,
    "MAX": 12
}
```

* MINIMAP_OFFSET:
*type: int*
*default:* `-3`
`"MINIMAP_OFFSET": -3`

* ALWAYS_HIGHLIGHT_TREKS:
*type: boolean*
*default:* `false`
`"ALWAYS_HIGHLIGHT_TREKS": false`

* SHOW_FILTERS_ON_MAP:
*type: boolean*
*default:* `true`
`"SHOW_FILTERS_ON_MAP": true`


### Markers

* MARKER_BASE_ICON:
*type: object*
*default:* `""`
    - iconUrl:
    *type: string(file name)*
    `"iconUrl": "/images/custom/map/marker.svg"`

    - iconSize:
    *type: array of int(width and height)*
    `"iconSize": [34, 48]`

    - iconAnchor:
    *type: array of int(positions x and y)*
    `"iconAnchor": [17, 48]`

    -labelAnchor:
    *type: array of int(positions x and y)*
    `"labelAnchor": [17, 17]`

```
"MARKER_BASE_ICON": {
    "iconUrl": "/images/custom/map/marker.svg",
    "iconSize": [34, 48],
    "iconAnchor": [17, 48],
    "labelAnchor": [17, 17]
}
```

* POI_BASE_ICON:
*type: object*
*default:* `""`
    - iconUrl:
    *type: string(file name)*
    `"iconUrl": "/images/custom/map/poi.svg"`

    - iconSize:
    *type: array of int(width and height)*
    `"iconSize": [34, 48]`

    - iconAnchor:
    *type: array of int(positions x and y)*
    `"iconAnchor": [17, 48]`

    -labelAnchor:
    *type: array of int(positions x and y)*
    `"labelAnchor": [17, 17]`

```
"POI_BASE_ICON": {
    "iconUrl": "/images/custom/map/poi.svg",
    "iconSize": [34, 48],
    "iconAnchor": [17, 48],
    "labelAnchor": [17, 17]
}
```

* DEPARTURE_ICON:
*type: object*
*default:* `""`
    - iconUrl:
    *type: string(file name)*
    `"iconUrl": "/images/custom/map/departure.svg"`

    - iconSize:
    *type: array of int(width and height)*
    `"iconSize": [34, 48]`

    - iconAnchor:
    *type: array of int(positions x and y)*
    `"iconAnchor": [17, 48]`

    -className:
    *type: string(class name)*
    `"className": "departure-marker"`

```
"DEPARTURE_ICON": {
    "iconUrl": "/images/custom/map/departure.svg",
    "iconSize": [60, 50],
    "iconAnchor": [40, 50],
    "className": "departure-marker"
}
```

* ARRIVAL_ICON:
*type: object*
*default:* `""`
    - iconUrl:
    *type: string(file name)*
    `"iconUrl": "/images/custom/map/arrival.svg"`

    - iconSize:
    *type: array of int(width and height)*
    `"iconSize": [34, 48]`

    - iconAnchor:
    *type: array of int(positions x and y)*
    `"iconAnchor": [17, 48]`

    -className:
    *type: string(class name)*
    `"className": "arrival-marker"`

```
"ARRIVAL_ICON": {
    "iconUrl": "/images/custom/map/arrival.svg",
    "iconSize": [34, 48],
    "iconAnchor": [17, 48],
    "className": "arrival-marker"
}
```

* DEPARTURE_ARRIVAL_ICON:
*type: object*
*default:* `""`
    - iconUrl:
    *type: string(file name)*
    `"iconUrl": "/images/custom/map/departure-arrival.svg"`

    - iconSize:
    *type: array of int(width and height)*
    `"iconSize": [34, 48]`

    - iconAnchor:
    *type: array of int(positions x and y)*
    `"iconAnchor": [17, 48]`

    -className:
    *type: string(class name)*
    `"className": "departure-arrival-marker"`

```
"DEPARTURE_ARRIVAL_ICON": {
    "iconUrl": "/images/custom/map/departure-arrival.svg",
    "iconSize": [34, 48],
    "iconAnchor": [17, 48],
    "className": "departure-arrival-marker"
}
```


### Filters

* DURATION_FILTER:
*type: array of objects*
    - id:
    *type: int(filter value)*
    - label:
    *type: string*
*default:*
```
"DURATION_FILTER": [
    { "id": 0, "label": "<1/2 J"},
    { "id": 10, "label": "1/2 J"},
    { "id": 24, "label": "1 J"},
    { "id": 999, "label": "> 1 J"}
]
```

* ASCENT_FILTER:
*type: array of objects*
    - id:
    *type: int(filter value)*
    - label:
    *type: string*
*default:*
```
"ASCENT_FILTER": [
    { "id": 0, "label": "<300m"},
    { "id": 300, "label": "300"},
    { "id": 600, "label": "600"},
    { "id": 1000, "label": "1000"},
    { "id": 9999, "label": ">1000m"}
]
```

* LENGTH_FILTER:
*type: array of objects*
    - id:
    *type: int(filter value)*
    - label:
    *type: string*
*default:*
```
"LENGTH_FILTER": [
    { "id": 0, "label": "<10km"},
    { "id": 10000, "label": "10km"},
    { "id": 20000, "label": "20km"},
    { "id": 30000, "label": "30km"},
    { "id": 99999, "label": ">30km"}
]
```
