
# Map Tiles Generator

This npm package is designed to obtain an XYZ tile list within and along the boundaries of the provided GeoJSON polygon data at the desired zoom levels. You can use this package to obtain the tile list for offline maps or run it in your own algorithm. It has two important methods, which we will explain with examples.

## Installation
intall npm package
```javascript
npm install map-tiles-generator
```

## Usage
```javascript
const TilesCounter = require('map-tiles-generator');

const polygon = {type:"Feature",properties:{},geometry:{type:"Polygon",coordinates:[...]}}

const generator = new TilesCounter(polygon);
```

### Getting Tiles for a Zoom Levels
returned data like below method -> [{x:12312,y:34343,z:15},....]
```javascript
var tiles = generator.getTilesAtZoom(15); // for 15th zoom level
```


### Getting Total Tile Count and Tiles for a Zoom Levels Range
returned data like below method -> {count:232352,zoom:{0:[...],1:[...],...,18:[...]}
```javascript
var tiles = generator.getTilesFromZoomRange(0,18); // for 0 to 18th levels
```