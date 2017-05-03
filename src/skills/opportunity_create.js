const createController = require('../skillsControllers/create_controller.js');

const opportunityCreate = (controller, jsforceConn) => {
  controller.hears(['opp create <(.*)> <(.*)> <(.*)>'], 'direct_message,direct_mention', (bot, message) => {
    const opportunity = {
      Name: message.match[1],
      StageName: message.match[2],
      CloseDate: message.match[3],
    };

    createController.replyWithStatus('Opportunity', opportunity, 'Opportunity', bot, message, jsforceConn);
  });
};

module.exports = opportunityCreate;
