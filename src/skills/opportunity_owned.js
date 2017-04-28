const createMessage = (ownedOpportunities) => {
  const maxOpportunityCount = 10;

  if (ownedOpportunities.length === 0) {
    return 'Found no opportunities.';
  }

  let message;
  let oppMessageList;
  if (ownedOpportunities.length <= maxOpportunityCount) {
    message = `Found ${ownedOpportunities.length} opportunities:\n`;
    oppMessageList = ownedOpportunities;
  } else {
    message = `Found ${ownedOpportunities.length} opportunities. Here are the most recent ${maxOpportunityCount}:\n`;
    oppMessageList = ownedOpportunities.slice(0, maxOpportunityCount);
  }
  oppMessageList.forEach((opp) => {
    message += `* [${opp.Id}](${process.env.base_url}${opp.Id}): ${opp.Name}\n`;
  });

  return message;
};

const opportunityOwned = (controller, jsforceConn) => {
  controller.hears(['opp owned'], 'direct_message,direct_mention', (bot, message) => {
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
          .execute((oppError, ownedOpps) => {
            if (oppError) {
              bot.reply(message, `Error: ${oppError}`);
              return;
            }

            bot.reply(message, createMessage(ownedOpps));
          });
      });
  });
};

module.exports = opportunityOwned;
