const opportunityCreate = (controller, jsforceConn) => {
  controller.hears(['opp create <(.*)> <(.*)> <(.*)>'], 'direct_message', (bot, message) => {
    jsforceConn.sobject('User').find({ Email: message.user }).execute((userError, users) => {
      if (userError) {
        bot.reply(message, `Error finding user: ${userError}`);
      } else {
        const user = users[0];

        jsforceConn.sobject('Opportunity').create(
          {
            Name: message.match[1],
            StageName: message.match[2],
            CloseDate: message.match[3],
            OwnerId: user.Id,
          },
          (oppError, result) => {
            if (oppError) {
              bot.reply(message, `Error: ${oppError}`);
            } else {
              bot.reply(message, `Success: [${message.match[1]}](${process.env.base_url}${result.id})`);
            }
          });
      }
    });
  });
};

module.exports = opportunityCreate;
