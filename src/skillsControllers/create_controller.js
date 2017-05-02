const createController = {

  replyWithStatus: (tableName, record, description, bot, message, jsforceConn) => {
    jsforceConn.sobject('Users')
      .find({ Email: message.user })
      .execute((userError, users) => {
        if (userError) {
          bot.reply(message, `Sorry, I could not create the ${description}. ${userError}`);
          return;
        }

        const user = users[0];
        const creationRecord = Object.assign({}, record, { OwnerId: user.Id });
        jsforceConn.sobject(tableName).create(creationRecord, (error, result) => {
          if (error) {
            bot.reply(message, `Error: ${error}`);
          } else {
            bot.reply(message, `Success: [${result.id}](${process.env.base_url}${result.id})`);
          }
        });
      });
  },

};

module.exports = createController;
