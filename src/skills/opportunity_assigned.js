const opportunityAssigned = (controller, jsforceConn) => {
  controller.hears(['opp assigned'], 'direct_message,direct_mention', (bot, message) => {
    jsforceConn.sobject('User')
      .find({ Email: message.user })
      .execute((userError, users) => {
        if (userError) {
          bot.reply(message, `Error: ${userError}`);
          return;
        }

        jsforceConn.sobject('Opportunity')
          .find({ OwnerId: users[0].Id })
          .execute((oppError, assignedOpps) => {
            if (oppError) {
              bot.reply(message, `Error: ${oppError}`);
              return;
            }

            let oppResponse = `Found ${assignedOpps.length} opportunities:\n`;
            assignedOpps.forEach((opp) => {
              oppResponse += `* [${opp.Id}](${process.env.base_url}${opp.Id}): ${opp.Name}\n`;
            });
            bot.reply(message, oppResponse);
          });
      });
  });
};

module.exports = opportunityAssigned;
