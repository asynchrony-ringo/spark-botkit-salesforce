const debug = require('debug')('botkit:incoming_webhooks');

module.exports = (webserver, controller, jsforceConn) => {
  debug('Configured POST /salesforce/update for receiving events');
  webserver.post('/salesforce/update', (req, res) => {
        // NOTE: we should enforce the token check here

        // respond to spark that the webhook has been received.
    res.status(200);
    res.send('ok');

    jsforceConn.sobject('User').retrieve(req.body.OwnerId, (error, user) => {
      if (!error) {
        const bot = controller.spawn({});

        bot.startPrivateConversation({ user: user.Email }, (err, conversation) => {
          if (err) { console.log('Error: ', err); return; }

          conversation.say(`An opportunity you own has been updated! ${process.env.base_url}${req.body.Id}`);
        });
      }
    });
  });
};
