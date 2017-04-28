const statusController = {
  replyWithStatus: (objectType, objectId, attributes, bot, message, jsforceConn) => {
    jsforceConn.sobject(objectType).retrieve(objectId, (error, object) => {
      if (error) { bot.reply(message, `Sorry, I was unable to retrieve the ${objectType}: ${objectId}. ${error}`); return; }

      let responseMessage = `Information for ${objectType}: [${objectId}](${process.env.base_url}${objectId})\n`;
      Object.keys(attributes).forEach((attributeKey) => {
        let value = object[attributeKey];
        if (value === null || value === undefined) {
          value = '';
        }
        responseMessage += `* ${attributes[attributeKey]}: ${value}\n`;
      });

      bot.reply(message, responseMessage);
    });
  },
};

module.exports = statusController;
