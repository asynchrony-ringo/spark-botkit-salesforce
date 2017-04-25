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
          .sort({ CreatedDate: -1 })
          .execute((oppError, assignedOpps) => {
            if (oppError) {
              bot.reply(message, `Error: ${oppError}`);
              return;
            }

            let oppResponse = '';
            if (assignedOpps.length > 5) {
              oppResponse = `Found ${assignedOpps.length} opportunities. Here are the most recent 5:\n`;
            } else {
              oppResponse = `Found ${assignedOpps.length} opportunities:\n`;
            }
            const oppSummaryList = assignedOpps.length > 5 ?
              assignedOpps.slice(0, 5) : assignedOpps;

            oppSummaryList.forEach((opp) => {
              oppResponse += `* [${opp.Id}](${process.env.base_url}${opp.Id}): ${opp.Name}\n`;
            });

            bot.reply(message, oppResponse);
          });
      });
  });
};

module.exports = opportunityAssigned;
