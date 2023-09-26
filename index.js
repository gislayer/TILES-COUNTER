const pointInPolygon = require('@turf/boolean-point-in-polygon');
const BBox = require('@turf/bbox');
const intersect = require('@turf/boolean-intersects');

class TilesCounter {

  constructor(polygon){
    this.area = polygon;
    this.status=false;
    try{
      if(this.checker()){
        this.status=true;
      }
    }catch(error){
      console.error('Error :', error.message);
    }
  }

  checker(){
    this.isCorrectType();
    this.isGeoJSON();
    return true;
  }

  isCorrectType(){
    if(typeof this.area !== 'object'){
      throw new Error('Polygon parameter is not an object!');
    }
  }

  isGeoJSON(){
    if(this.area['type']==undefined){
      throw new Error('Polygon type is not valid!');
    }
    if(this.area['geometry']==undefined){
      throw new Error('Polygon geometry is not valid!');
    }
    if(this.area.geometry['type']!=='Polygon'){
      throw new Error('GeoJSON is not a Polygon!');
    }
    if(this.area.geometry.coordinates==undefined){
      throw new Error('Polygon coordinates are not valid!');
    }
    if(this.area.geometry.coordinates.length!==1){
      throw new Error('Polygon coordinates are not a ring!');
    }
    if(this.area.geometry.coordinates[0].length<4){
      throw new Error('Polygon must have 3 coordinates!');
    }
  }

  getMiddleFrom2Coord(latlng1,latlng2){
    return [(latlng1[0]+latlng2[0])/2,(latlng1[1]+latlng2[1])/2];
  }

  checkTileInPolygon(tile){
    var p1 = this.tile2LatLong(tile);
    var p2 = this.tile2LatLong(this.getRightTile(tile));
    var p3 = this.tile2LatLong(this.getRightTile(this.getBottomTile(tile)));
    var p4 = this.tile2LatLong(this.getBottomTile(tile));
    var line = {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[p1,p2,p3,p4]}};
    var point = this.getMiddleFrom2Coord(p1,p3);
    var intersects = intersect.default(line,this.area);
    var inpolygon = pointInPolygon.default(point,this.area);
    if(intersects || inpolygon){
      return true;
    }else{
      return false;
    }
  }

  getTilesAtZoom(zoom){
    if(this.status==false){
      return [];
    }
    var bbox = BBox.default(this.area);
    var LT_tile = this.latLong2tile([bbox[0],bbox[3]],zoom);
    var RB_tile = this.latLong2tile([bbox[2],bbox[1]],zoom);
    if(LT_tile.x==RB_tile.x && LT_tile.y==RB_tile.y){
      return [LT_tile];
    }
    var tiles = [];
    for(var x=LT_tile.x;x<=RB_tile.x;x++){
      for(var y=LT_tile.y;y<=RB_tile.y;y++){
        var tile = {x:x,y:y,z:zoom};
        if(this.checkTileInPolygon(tile)){
          tiles.push(tile);
        }
      }
    }
    return tiles;
  }

  getTilesFromZoomRange(minZoom, maxZoom){
    var tileset = {};
    var tilesCount = 0;
    for(var z=minZoom;z<=maxZoom;z++){
      var tile = this.getTilesAtZoom(z);
      tilesCount+=tile.length;
      tileset[z] = tile;
    }
    return {count:tilesCount,zoom:tileset};
  }

  getRightTile(tile){
    return {
      x:tile.x+1,
      y:tile.y,
      z:tile.z
    }
  }

  getBottomTile(tile){
    return {
      x:tile.x,
      y:tile.y+1,
      z:tile.z
    }
  }

  latLong2tile(coord,z){
    var xtile = Math.floor((coord[0] + 180) / 360 * Math.pow(2, z));
    var ytile = Math.floor((1 - Math.log(Math.tan(coord[1] * Math.PI / 180) + 1 / Math.cos(coord[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
    return {
      x: xtile,
      y: ytile,
      z: z
    };
  }

  tile2LatLong(tile){
    var {x,y,z} = tile;
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    var lng = x / Math.pow(2, z) * 360 - 180;
    var lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return [lng, lat];
  }
}

module.export = TilesCounter;