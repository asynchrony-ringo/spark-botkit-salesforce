const ownedController = require('../skillsControllers/owned_controller.js');

const opportunityOwned = (controller, jsforceConn) => {
  controller.hears(['^opp owned$'], 'direct_message,direct_mention', (bot, message) => {
    ownedController.replyWithStatus('Opportunity', 'opportunities', bot, message, jsforceConn);
  });
};

module.exports = opportunityOwned;
