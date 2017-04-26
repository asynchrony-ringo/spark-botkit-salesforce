const statusController = {
  replyWithStatus: (objectType, objectId, attributes, bot, message, jsforceConn) => {
    jsforceConn.sobject(objectType).retrieve(objectId, (error, object) => {
      if (!error) {
        let responseMessage = `Information for ${objectType}: [${objectId}](${process.env.base_url}${objectId})\n`;
        attributes.forEach((attribute) => {
          responseMessage += `* ${attribute.replace(/([A-Z])/g, ' $1').trim()}: ${object[attribute]}\n`;
        });
        bot.reply(message, responseMessage);
      } else {
        bot.reply(message, `Sorry, I was unable to retrieve the ${objectType}: ${objectId}. ${error}`);
      }
    });
  },
};

module.exports = statusController;
