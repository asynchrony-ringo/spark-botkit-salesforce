const opportunityAssigned = (controller, jsforceConn) => {
  controller.hears(['opp assigned'], 'direct_message,direct_mention', (bot, message) => {
    jsforceConn.sobject('User')
      .find({ Email: message.user })
      .execute((userError, users) => {
        const userId = users[0].Id;
        jsforceConn.sobject('Opportunity')
          .find({ OwnerId: userId })
          .execute((oppError, assignedOpps) => {
            if (!oppError) {
              let oppResponse = `Found ${assignedOpps.length} Opportunities\n`;
              assignedOpps.forEach((opp) => {
                oppResponse += `* [${opp.Id}](${process.env.base_url}${opp.Id}): ${opp.Name}\n`;
              });
              bot.reply(message, oppResponse);
            } else {
              bot.reply(message, `Error: ${oppError}`);
            }
          });
      });
  });
};

module.exports = opportunityAssigned;
