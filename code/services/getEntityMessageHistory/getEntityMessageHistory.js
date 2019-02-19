function getEntityMessageHistory(req, resp) {
  ClearBlade.init({ request: req })

  var msg = ClearBlade.Messaging();
  var unixTimeNano = new Date().getTime()
  var unixTimeMilli = unixTimeNano / 1000
  msg.getMessageHistoryWithTimeFrame(
    "entity/position/" + req.params.entity_id,
    25,
    unixTimeMilli,
    unixTimeMilli - 1000,
    unixTimeMilli,
    function (err, data) {
      log(data)
      if (err) {
        resp.error("message history error : " + JSON.stringify(data));
      } else {
        resp.success(data.map(function(d) {
          const item = JSON.parse(d.message)
          item.date = d["send-date"]
          return item
        }));
      }
    });

  // resp.success('Success');
}
