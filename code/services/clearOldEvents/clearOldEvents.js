function clearOldEvents(req, resp) {
  ClearBlade.init({ request: req })
  ClearBlade.Collection({ collectionName: 'events' }).remove({}, function (err, data) {
    log(data);
    if (err) {
      resp.error(data);
    } else {
      log(data)
    }
  });
  ClearBlade.Collection({ collectionName: 'event_activity' }).remove({}, function (err, data) {
    log(data);
    if (err) {
      resp.error(data);
    } else {
      log(data);
    }
  });
  resp.success('Success');
}
