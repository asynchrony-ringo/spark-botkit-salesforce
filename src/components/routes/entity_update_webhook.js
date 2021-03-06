const debug = require('debug')('botkit:incoming_webhooks');
const updateAlertController = require('../routeControllers/update_alert_controller.js');
const bodyParser = require('body-parser');

const sendFailureResponse = (res) => {
  res.status(400);
  res.send('Bad Request');
};
const sendSuccessResponse = (res) => {
  res.status(200);
  res.send('ok');
};

const opportunityUpdatedWebhook = (webserver, controller, jsforceConn) => {
  debug('Configured POST /salesforce/update for receiving events');

  webserver.use('/salesforce/update', [bodyParser.json(), bodyParser.urlencoded({ extended: true })]);
  webserver.post('/salesforce/update', (req, res) => {
    if (!updateAlertController.isValid(req.body.new, req.body.old)) {
      sendFailureResponse(res);
      return;
    }
    const newList = req.body.new;
    const oldList = req.body.old;
    for (let i = 0; i < newList.length; i += 1) {
      updateAlertController.messageOwner(newList[i], oldList[i], controller, jsforceConn);
    }
    sendSuccessResponse(res);
  });
};


module.exports = opportunityUpdatedWebhook;
