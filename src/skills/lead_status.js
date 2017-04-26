const leadStatus = (controller, jsforceConn) => {
  controller.hears(['lead status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const leadId = message.match[1];
    jsforceConn.sobject('Lead').retrieve(leadId, (error, lead) => {
      if (!error) {
        const leadResponse = `Information for lead: [${leadId}](${process.env.base_url}${leadId})\n` +
          `* Name: ${lead.Name}\n` +
          `* Email: ${lead.Email}\n`;
        bot.reply(message, leadResponse);
      } else {
        bot.reply(message, `Sorry, I was unable to retrieve the lead: ${leadId}. ${error}`);
      }
    });
  });
};

module.exports = leadStatus;
