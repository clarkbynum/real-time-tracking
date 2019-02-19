function test_isPointInPolygon(req, resp) {
  var expect = chai.expect;

  var squarePolygon = [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 1 }];


  expect(isPointInPolygon({ x_pos: 1.5, y_pos: 1.5 }, squarePolygon)).to.equal(true)
  log('true when point is inside square')


  expect(isPointInPolygon({ x_pos: 3, y_pos: 3 }, squarePolygon)).to.equal(false)
  log('false when point is not inside square')

  var rectPolygon = [
    { x: 1, y: 1 }, { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 2, y: 1 }
  ];

  // making sure x and y don't get switched
  expect(isPointInPolygon({ x_pos: 1.5, y_pos: 5 }, rectPolygon)).to.equal(true)
  log('true when point is inside rect')


  expect(isPointInPolygon({ x_pos: 5, y_pos: 1.5 }, rectPolygon)).to.equal(false)
  log('false when point is not inside rect')

  resp.success('All tests passed')
}
