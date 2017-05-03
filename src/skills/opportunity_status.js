const statusController = require('../skillsControllers/status_controller.js');

const opportunityStatus = (controller, jsforceConn) => {
  controller.hears(['opp status[ ]+(.*)[ ]*'], 'direct_message,direct_mention', (bot, message) => {
    const oppAttributes = {
      Name: 'Name',
      StageName: 'Stage Name',
      CloseDate: 'Close Date',
    };
    statusController.replyWithStatus('Opportunity', message.match[1], oppAttributes, bot, message, jsforceConn);
  });
};

module.exports = opportunityStatus;
