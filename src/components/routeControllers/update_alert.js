const updateAlertDifferenceGatherer = require('./update_alert_difference_gatherer.js');

const validOpportunityListsAlign = (newOppList, oldOppList) => {
  for (let i = 0; i < newOppList.length; i += 1) {
    if (newOppList[i].Id !== oldOppList[i].Id) return false;
  }

  return true;
};

const validOpportunity = opp => opp.attributes && opp.attributes.type === 'Opportunity';

const updateAlertController = {
  messageOwner: (newObj, oldObj, controller, jsforceConn) => {
    if (newObj.OwnerId) {
      jsforceConn.sobject('User').retrieve(newObj.OwnerId, (userRetrievalError, user) => {
        if (userRetrievalError) {
          console.log(`Error retrieving user ${newObj.OwnerId}:`, userRetrievalError);
          return;
        }
        const bot = controller.spawn({});

        bot.startPrivateConversation({ user: user.Email },
          (startConversationError, conversation) => {
            if (startConversationError) {
              console.log(`Error starting conversation with ${user.Email}:`, startConversationError);
              return;
            }
            const diff = updateAlertDifferenceGatherer.formatMessage(newObj, oldObj);
            conversation.say(`An opportunity you own has been updated!${diff}\n[${newObj.Name}](${process.env.base_url}${newObj.Id})`);
          });
      });
    }
  },
  isValid: (newObj, oldObj) => {
    if (!Array.isArray(newObj) || !Array.isArray(oldObj)) {
      return false;
    }
    if (newObj.length !== oldObj.length) {
      return false;
    }
    if (!validOpportunityListsAlign(newObj, oldObj)) {
      return false;
    }

    const newOpportunities = newObj;
    const oldOpportunities = oldObj;

    for (let i = 0; i < newOpportunities.length; i += 1) {
      if (!validOpportunity(newOpportunities[i])) { return false; }
    }

    for (let i = 0; i < oldOpportunities.length; i += 1) {
      if (!validOpportunity(oldOpportunities[i])) { return false; }
    }

    return true;
  },
};

module.exports = updateAlertController;
