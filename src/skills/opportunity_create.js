const opportunityCreate = (controller, jsforceConn) => {
  controller.hears(['opp create <(.*)> <(.*)> <(.*)>'], 'direct_message', (bot, message) => {
    jsforceConn.sobject('Opportunity').create(
      {
        Name: message.match[1],
        StageName: message.match[2],
        CloseDate: message.match[3],
      },
      (error, result) => {
        if (error) {
          bot.reply(message, `Error: ${error}`);
        } else {
          bot.reply(message, `Success: [${message.match[1]}](${process.env.base_url}${result.id})`);
        }
      });
  });
};

module.exports = opportunityCreate;
