const debug = require('debug')('botkit:incoming_webhooks');
const bodyParser = require('body-parser');
const hmacSHA1 = require('crypto-js/hmac-sha1');

const addSHA1ToRequest = (req, res, buff, encoding) => {
  req.hmacSHA1 = hmacSHA1(buff.toString(encoding), process.env.secret).toString();
};

module.exports = (webserver, controller) => {
  debug('Configured POST /ciscospark/receive url for receiving events');

  webserver.use('/salesforce/update', [
    bodyParser.json({ verify: addSHA1ToRequest }),
    bodyParser.urlencoded({ extended: true })]);

  webserver.post('/ciscospark/receive', (req, res) => {
    if (req.hmacSHA1 !== req.get('X-Spark-Signature')) {
      res.status(403).send('HMAC validation error');
      return;
    }
    res.status(200).send('ok');

    const bot = controller.spawn({});

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res, bot);
  });
};
