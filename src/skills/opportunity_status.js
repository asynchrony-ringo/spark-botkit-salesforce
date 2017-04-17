const opportunityStatus = (controller, jsforceConn) => {
  controller.hears(['opp status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const oppId = message.match[1];
    jsforceConn.sobject('Opportunity').retrieve(oppId, (error, opp) => {
      if (!error) {
        const oppResponse = `Information for opportunity: [${oppId}](${process.env.base_url}${oppId})\n` +
          `* Name: ${opp.Name}\n` +
          `* Current stage: ${opp.StageName}\n` +
          `* Close Date: ${opp.CloseDate}\n`;

        bot.reply(message, oppResponse);
      } else {
        bot.reply(message, `Sorry, I was unable to retrieve your opportunity: ${oppId}. ${error}`);
      }
    });
  });
};

module.exports = opportunityStatus;
