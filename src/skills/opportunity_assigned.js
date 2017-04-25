const createMessage = (assignedOpportunities) => {
  const maxOpportunityCount = 10;

  if (assignedOpportunities.length === 0) {
    return 'Found no opportunities.';
  }

  let message;
  let oppMessageList;
  if (assignedOpportunities.length <= maxOpportunityCount) {
    message = `Found ${assignedOpportunities.length} opportunities:\n`;
    oppMessageList = assignedOpportunities;
  } else {
    message = `Found ${assignedOpportunities.length} opportunities. Here are the most recent ${maxOpportunityCount}:\n`;
    oppMessageList = assignedOpportunities.slice(0, maxOpportunityCount);
  }
  oppMessageList.forEach((opp) => {
    message += `* [${opp.Id}](${process.env.base_url}${opp.Id}): ${opp.Name}\n`;
  });

  return message;
};

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

            bot.reply(message, createMessage(assignedOpps));
          });
      });
  });
};

module.exports = opportunityAssigned;
