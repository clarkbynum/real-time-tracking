var STEP_SIZE = 3;

function getRandomDirection() {
  return Math.round(Math.random()) ? STEP_SIZE : -STEP_SIZE;
}

function safeMove(currentPosition, distance, max) {
  return currentPosition + distance > max || currentPosition + distance < 0 ? currentPosition - distance : currentPosition + distance;
}

function moveTag(tagMsg, mapWidth, mapHeight) {
  var distanceX = getRandomDirection();
  var distanceY = getRandomDirection();

  tagMsg.x_pos = safeMove(tagMsg.x_pos, distanceX, mapWidth);
  tagMsg.y_pos = safeMove(tagMsg.y_pos, distanceY, mapHeight);
  tagMsg.timestamp = (new Date()).toISOString()
}

function generateFakeMovement(req, resp) {
  ClearBlade.init({ request: req })
  var msg = ClearBlade.Messaging();
  return Q.all([
    cbFetchPromise({ collectionName: 'views' }),
    cbFetchPromise({ collectionName: 'tags' }),
  ]).then(function (resArr) {
    var view = resArr[0].DATA[0]
    var tags = resArr[1].DATA
    var mapWidth = view.width
    var mapHeight = view.height
    var underscoredViewName = view.name.replace(/\s/g, '_')    

    var tagMsgs = tags.map(function (tag) {
      return {
        timestamp: (new Date()).toISOString(),
        name: tag.name,
        x_pos: Math.floor(Math.random() * mapWidth),
        y_pos: Math.floor(Math.random() * mapHeight)
      }
    })
    mySetInterval(function () {
      log('tick')
      tagMsgs.forEach(function (tagMsg) {
        moveTag(tagMsg, mapWidth, mapHeight);
        // should be this
        // msg.publish(underscoredViewName + '/tag/' + tagMsg.name, JSON.stringify(
        msg.publish('section1/tag/' + tagMsg.name, JSON.stringify(
          tagMsg
        ))
      })
    }, 500)
  })
}

var startTime = Date.now()
function mySetInterval(func, wait) {
  var oldTime = Date.now()
  // stops after timeout in Advanced tab
  while (true) {
    if (Date.now() - oldTime > wait) {
      oldTime = Date.now()
      func()
    }
  }
}