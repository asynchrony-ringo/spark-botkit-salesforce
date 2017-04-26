const statusController = require('../skillsControllers/status_controller.js');

const opportunityStatus = (controller, jsforceConn) => {
  controller.hears(['opp status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    statusController.replyWithStatus('Opportunity', message.match[1], ['Name', 'StageName', 'CloseDate'], bot, message, jsforceConn);
  });
};

module.exports = opportunityStatus;
