const statusController = require('../skillsControllers/status_controller.js');

const campaignStatus = (controller, jsforceConn) => {
  controller.hears(['campaign status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    statusController.replyWithStatus('Campaign', message.match[1], ['Name', 'Description', 'StartDate', 'EndDate'], bot, message, jsforceConn);
  });
};

module.exports = campaignStatus;
