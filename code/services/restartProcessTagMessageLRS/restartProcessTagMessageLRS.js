function restartProcessTagMessageLRS(req, resp) {
	ClearBlade.init({ request: req })

	var msg = ClearBlade.Messaging();
	msg.publish('section1/tag/killProcessTagMessageLRS', JSON.stringify({
		name: "killProcessTagMessageLRS",
	}))

	var codeEngine = ClearBlade.Code()
	var serviceToCall = "processTagMessageLRS"
	var loggingEnabled = false
	var params = {}
	mySetTimeout(function () {
		codeEngine.execute(serviceToCall, params, loggingEnabled, function (err, res) {
			if (err) {
				resp.error(res);
			}
		})
	}, 200)
	resp.success('Success');
}

var startTime = Date.now()
function mySetTimeout(func, wait) {
	var oldTime = Date.now()
	// stops after timeout in Advanced tab
	while (true) {
		if (Date.now() - oldTime > wait) {
			func()
			break
		}
	}
}
