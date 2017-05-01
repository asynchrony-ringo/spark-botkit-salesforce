const ownedController = require('../skillsControllers/owned_controller.js');

const opportunityOwned = (controller, jsforceConn) => {
  controller.hears(['lead owned'], 'direct_message,direct_mention', (bot, message) => {
    ownedController.replyWithStatus('Lead', 'Leads', bot, message, jsforceConn);
  });
};

module.exports = opportunityOwned;
