const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');
const uuid = require('uuid/v4');

env('.env');

describe('opportunity', () => {
  it('should respond with opportunity status after direct message creation in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true });
    return nightmare
        .use(nightmareHelpers.login)
        .use(nightmareHelpers.startPrivateConversation)
        .use(nightmareHelpers.sendMessage(`opp create <opp integration ${uuid()}> <Proposal/Price Quote> <2017-04-17T17:14:43.441Z>`))
        .use(nightmareHelpers.evaluateNextSFBotResponseLinkHref)
        .then((salesforceHref) => {
          const oppId = salesforceHref.match('.*/([^/]*)$')[1];
          return nightmare
            .use(nightmareHelpers.sendMessage(`opp status ${oppId}`))
            .use(nightmareHelpers.evaluateNextSFBotResponse)
            .then((dmOpportunityStatus) => {
              const expectedOpportunityStatus = new RegExp(`Information for opportunity: [${oppId}]`);
              expect(dmOpportunityStatus).to.match(expectedOpportunityStatus);
              return nightmare
                .use(nightmareHelpers.goHome)
                .use(nightmareHelpers.startGroupConversation)
                .use(nightmareHelpers.sendMentionMessage(`opp status ${oppId}`))
                .use(nightmareHelpers.evaluateNextSFBotResponse)
                .end()
                .then((mentionOpportunityStatus) => {
                  expect(mentionOpportunityStatus).to.match(expectedOpportunityStatus);
                });
            });
        });
  });
});
