const statusController = require('../skillsControllers/status_controller.js');

const leadStatus = (controller, jsforceConn) => {
  controller.hears(['lead status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const leadAttributes = {
      Name: 'Name',
      Email: 'Email',
    };
    statusController.replyWithStatus('Lead', message.match[1], leadAttributes, bot, message, jsforceConn);
  });
};

module.exports = leadStatus;
