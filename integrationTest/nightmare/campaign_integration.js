const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');

const campaignId = '70118000000260AAAQ';
env('.env');


describe('campaign', () => {
  it('should respond with campaign status after query in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(nightmareHelpers.login)
      .use(nightmareHelpers.startPrivateConversation)
      .use(nightmareHelpers.sendMessage(`campaign status ${campaignId}`))
      .use(nightmareHelpers.evaluateNextSFBotResponse)
      .then((dmCampaignStatus) => {
        const expectedCampaignStatus = new RegExp(`Information for campaign: [${campaignId}]`);
        expect(dmCampaignStatus).to.match(expectedCampaignStatus);
        return nightmare
          .use(nightmareHelpers.goHome)
          .use(nightmareHelpers.startGroupConversation)
          .use(nightmareHelpers.sendMentionMessage(`campaign status ${campaignId}`))
          .use(nightmareHelpers.evaluateNextSFBotResponse)
          .end()
          .then((mentionCampaignStatus) => {
            expect(mentionCampaignStatus).to.match(expectedCampaignStatus);
          });
      });
  });
});
