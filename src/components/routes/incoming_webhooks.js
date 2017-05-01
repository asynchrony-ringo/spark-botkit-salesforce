const debug = require('debug')('botkit:incoming_webhooks');

module.exports = function (webserver, controller) {
  debug('Configured POST /ciscospark/receive url for receiving events');

  webserver.post('/ciscospark/receive', (req, res) => {
    if (req.hmacSHA1 !== req.get('X-Spark-Signature')) {
      res.status(403).send(`HMAC validation error\n${req.hmacSHA1}${typeof req.hmacSHA1}\n${req.get('X-Spark-Signature')}${typeof req.get('X-Spark-Signature')}`);
      return;
    }
    res.status(200).send('ok');

    const bot = controller.spawn({});

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res, bot);
  });
};
