const statusController = require('../skillsControllers/status_controller.js');

const campaignStatus = (controller, jsforceConn) => {
  controller.hears(['campaign status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const campaignAttributes = {
      Name: 'Name',
      Description: 'Description',
      StartDate: 'Start Date',
      EndDate: 'End Date',
    };

    statusController.replyWithStatus('Campaign', message.match[1].trim(), campaignAttributes, bot, message, jsforceConn);
  });
};

module.exports = campaignStatus;
