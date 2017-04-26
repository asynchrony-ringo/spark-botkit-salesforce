const statusController = require('../skillsControllers/status_controller.js');

const leadStatus = (controller, jsforceConn) => {
  controller.hears(['lead status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    statusController.replyWithStatus('Lead', message.match[1], ['Name', 'Email'], bot, message, jsforceConn);
  });
};

module.exports = leadStatus;
