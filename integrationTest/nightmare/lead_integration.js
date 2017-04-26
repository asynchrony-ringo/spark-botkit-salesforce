const expect = require('chai').expect;
const Nightmare = require('nightmare');
const nightmareHelpers = require('./nightmare_helpers.js');

const leadId = '00Q18000002t4w8';

describe('lead', () => {
  it.only('should respond with lead status after query in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(nightmareHelpers.login)
      .use(nightmareHelpers.startPrivateConversation)
      .use(nightmareHelpers.sendMessage(`lead status ${leadId}`))
      .use(nightmareHelpers.evaluateNextSFBotResponse)
      .then((directMessageStatusResponse) => {
        const expectedStatusMatch = new RegExp(`Information for lead: [${leadId}]`);
        expect(directMessageStatusResponse).to.match(expectedStatusMatch);
        return nightmare
          .use(nightmareHelpers.goHome)
          .use(nightmareHelpers.startGroupConversation)
          .use(nightmareHelpers.sendMentionMessage(`lead status ${leadId}`))
          .use(nightmareHelpers.evaluateNextSFBotResponse)
          .end()
          .then((directMentionStatusResponse) => {
            expect(directMentionStatusResponse).to.match(expectedStatusMatch);
          });
      });
  });
});
