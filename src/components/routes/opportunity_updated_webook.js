const debug = require('debug')('botkit:incoming_webhooks');

const validOpportunityListsAlign = (newOppList, oldOppList) => {
  for (let i = 0; i < newOppList.length; i += 1) {
    if (newOppList[i].Id !== oldOppList[i].Id) return false;
  }

  return true;
};

const validOpportunity = opp => opp.attributes && opp.attributes.type === 'Opportunity';

const returnFailure = (res) => {
  res.status(400);
  res.send('Bad Request');
  return false;
};
const returnSuccess = (res) => {
  res.status(200);
  res.send('ok');
  return true;
};

const isValidRequest = (req) => {
  if (!Array.isArray(req.body.new) || !Array.isArray(req.body.old)) {
    return false;
  }
  if (req.body.new.length !== req.body.old.length) {
    return false;
  }
  if (!validOpportunityListsAlign(req.body.new, req.body.old)) {
    return false;
  }

  const newOpportunities = req.body.new;
  const oldOpportunities = req.body.old;

  for (let i = 0; i < newOpportunities.length; i += 1) {
    if (!validOpportunity(newOpportunities[i])) { return false; }
  }

  for (let i = 0; i < oldOpportunities.length; i += 1) {
    if (!validOpportunity(oldOpportunities[i])) { return false; }
  }

  return true;
};

const diffBetweenOpportunities = (newOpp, oldOpp) => {
  let diffOutput = '';
  const diffs = [];

  Object.keys(newOpp).forEach((key) => {
    if (typeof newOpp[key] === 'string') {
      if (newOpp[key] !== oldOpp[key]) {
        diffs.push(`${key} was updated to: ${newOpp[key]}`);
      }
    }
  });

  if (diffs.length > 0) {
    diffOutput += '\n';
    diffOutput += diffs.join('\n');
  }

  return diffOutput;
};

const messageOpportunityOwner = (newOpp, oldOpp, controller, jsforceConn) => {
  if (newOpp.OwnerId) {
    jsforceConn.sobject('User').retrieve(newOpp.OwnerId, (userRetrievalError, user) => {
      if (userRetrievalError) {
        console.log(`Error retrieving user ${newOpp.OwnerId}:`, userRetrievalError);
        return;
      }
      const bot = controller.spawn({});

      bot.startPrivateConversation({ user: user.Email },
        (startConversationError, conversation) => {
          if (startConversationError) {
            console.log(`Error starting conversation with ${user.Email}:`, startConversationError);
            return;
          }
          const diff = diffBetweenOpportunities(newOpp, oldOpp);
          conversation.say(`An opportunity you own has been updated!${diff}\n[${newOpp.Name}](${process.env.base_url}${newOpp.Id})`);
        });
    });
  }
};

const opportunityUpdatedWebhook = (webserver, controller, jsforceConn) => {
  debug('Configured POST /salesforce/update for receiving events');
  webserver.post('/salesforce/update', (req, res) => {
    if (!isValidRequest(req)) {
      return returnFailure(res);
    }
    const newOppList = req.body.new;
    const oldOppList = req.body.old;
    for (let i = 0; i < newOppList.length; i += 1) {
      messageOpportunityOwner(newOppList[i], oldOppList[i], controller, jsforceConn);
    }
    return returnSuccess(res);
  });
};


module.exports = opportunityUpdatedWebhook;
