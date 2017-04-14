const opportunityStatus = (controller, jsforceConn) => {
  controller.hears(['opp status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const oppId = message.match[1];
    jsforceConn.sobject('Opportunity').retrieve(oppId, (error, opp) => {
      if (!error) {
        const oppResponse = `Opportunity name: ${opp.Name}\n` +
          `* Current stage: ${opp.StageName}\n` +
          `* Close Date: ${opp.CloseDate}\n` +
          `* [View in Salesforce](${process.env.base_url}${oppId})`;

        bot.reply(message, oppResponse);
      } else {
        bot.reply(message, `Sorry, I was unable to retrieve your opportunity: ${error}`);
      }
    });
  });
};

module.exports = opportunityStatus;
