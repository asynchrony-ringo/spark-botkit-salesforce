const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');

env('.env');

describe('opportunity status', () => {
  [
    {
      description: 'direct message',
      conversationStarter: nightmareHelpers.startPrivateConversation,
      messageSender: nightmareHelpers.sendMessage
    },
    {
      description: 'direct mention',
      conversationStarter: nightmareHelpers.startGroupConversation,
      messageSender: nightmareHelpers.sendDirectMessage
    }
  ].forEach(({ description, conversationStarter, messageSender }) => {
    it(`should respond with opportunity status when ${description}`, () => {
      const nightmare = Nightmare({ show: true });
      return nightmare
        .use(nightmareHelpers.login)
        .use(conversationStarter)
        .use(messageSender('opp status 00618000004efyz'))
        .use(nightmareHelpers.evaluateNextSFBotResponse)
        .end()
        .then((innerText) => {
          // TODO need to change the innerText test to match the text representation
          expect(innerText).to.match(/Information for opportunity: [00618000004efyz]/);
        });
    });
  });
});
