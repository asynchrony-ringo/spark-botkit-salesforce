const ownedController = require('../skillsControllers/owned_controller.js');

const campaignOwned = (controller, jsforceConn) => {
  controller.hears(['campaign owned'], 'direct_message,direct_mention', (bot, message) => {
    ownedController.replyWithStatus('Campaign', 'Campaigns', bot, message, jsforceConn);
  });
};

module.exports = campaignOwned;
