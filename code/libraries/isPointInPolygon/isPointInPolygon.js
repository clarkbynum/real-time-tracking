/**
 * @typedef Coordinate
 * @property {number} x
 * @property {number} y
 * 
 */

/**
* @param {Coordinate} point
* @param {Coordinate[]} polygonXY
* @returns {number}
*/
function isPointInPolygon(point, polygonXY) {
	var geoObj = new geo('cartesian');

    var myPoint = geoObj.Point( point.x_pos, point.y_pos );

    var polygonPoints = polygonXY.map(function(p) {
        return geoObj.Point( p.x, p.y );
    })
    var polygon = geoObj.Polygon( polygonPoints )


    return geoObj.Within(polygon, myPoint)
    return isInside;
}