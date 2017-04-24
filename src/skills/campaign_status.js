const campaignStatus = (controller, jsforceConn) => {
  controller.hears(['campaign status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const campaignId = message.match[1];
    jsforceConn.sobject('Campaign').retrieve(campaignId, (error, campaign) => {
      if (!error) {
        const campaignResponse = `Information for campaign: [${campaignId}](${process.env.base_url}${campaignId})\n` +
          `* Name: ${campaign.Name}\n` +
          `* Description: ${campaign.Description}\n` +
          `* Start Date: ${campaign.StartDate}\n` +
          `* End Date: ${campaign.EndDate}\n`;

        bot.reply(message, campaignResponse);
      } else {
        bot.reply(message, `Sorry, I was unable to retrieve your campaign: ${campaignId}. ${error}`);
      }
    });
  });
};

module.exports = campaignStatus;
