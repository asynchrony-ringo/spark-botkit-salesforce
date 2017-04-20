const debug = require('debug')('botkit:incoming_webhooks');

const validateRequest = (req, res) => {
  if (!req.body.attributes || !req.body.attributes.type || req.body.attributes.type !== 'Opportunity') {
    res.status(400);
    res.send('Bad Request');
    return false;
  }
  res.status(200);
  res.send('ok');
  return true;
};

const opportunityUpdatedWebhook = (webserver, controller, jsforceConn) => {
  debug('Configured POST /salesforce/update for receiving events');
  webserver.post('/salesforce/update', (req, res) => {
    if (!validateRequest(req, res)) { return; }

    if (req.body.OwnerId) {
      jsforceConn.sobject('User').retrieve(req.body.OwnerId, (userRetrievalError, user) => {
        if (userRetrievalError) {
          console.log(`Error retrieving user ${req.body.OwnerId}:`, userRetrievalError);
          return;
        }
        const bot = controller.spawn({});

        bot.startPrivateConversation({ user: user.Email },
          (startConversationError, conversation) => {
            if (startConversationError) {
              console.log(`Error starting conversation with ${user.Email}:`, startConversationError);
              return;
            }

            conversation.say(`An opportunity you own has been updated! [${req.body.Name}](${process.env.base_url}${req.body.Id})`);
          });
      });
    }
  });
};


module.exports = opportunityUpdatedWebhook;
