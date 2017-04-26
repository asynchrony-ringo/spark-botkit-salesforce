const expect = require('chai').expect;
const Nightmare = require('nightmare');
const nightmareHelpers = require('./nightmare_helpers.js');
const uuid = require('uuid/v4');
const globals = require('../globals.js');

const extractSysIdFromHref = (href) => {
  console.log('href: ', href);
  return href.match('.*/([^/]*)$')[1];
};

const createOpportunityAndEvaluateResponseHref = opportunityName => nightmare => nightmare
    .use(nightmareHelpers.login)
    .use(nightmareHelpers.startPrivateConversation)
    .use(nightmareHelpers.sendMessage(`opp create <${opportunityName}}> <Proposal/Price Quote> <2017-04-17T17:14:43.441Z>`))
    .use(nightmareHelpers.evaluateNextSFBotResponseLinkHref);

const editOpportunity = id =>
  new Promise((resolve, reject) => {
    const updatePayload = {
      Id: id,
      Name: `opp integration rename ${uuid()}`
    };
    globals.jsforceConn.sobject('Opportunity').update(updatePayload, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(updatePayload);
      }
    });
  });

describe('opportunity', () => {
  it('should respond with opportunity status after direct message creation in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
        .use(createOpportunityAndEvaluateResponseHref(`opp status integration ${uuid()}`))
        .then(extractSysIdFromHref)
        .then(oppId => nightmare
            .use(nightmareHelpers.sendMessage(`opp status ${oppId}`))
            .use(nightmareHelpers.evaluateNextSFBotResponse)
            .then((directMessageStatusResponse) => {
              const expectedStatusMatch = new RegExp(`Information for opportunity: [${oppId}]`);
              expect(directMessageStatusResponse).to.match(expectedStatusMatch);
              return nightmare
                .use(nightmareHelpers.goHome)
                .use(nightmareHelpers.startGroupConversation)
                .use(nightmareHelpers.sendMentionMessage(`opp status ${oppId}`))
                .use(nightmareHelpers.evaluateNextSFBotResponse)
                .end()
                .then((directMentionStatusResponse) => {
                  expect(directMentionStatusResponse).to.match(expectedStatusMatch);
                });
            }));
  });

  it('should send a direct message to owner on opportunity update', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(createOpportunityAndEvaluateResponseHref(`opp update integration ${uuid()}`))
      .then(extractSysIdFromHref)
        .then(sysId => editOpportunity(sysId))
        .then(result => nightmare
            .use(nightmareHelpers.evaluateNextSFBotResponse)
            .then((response) => {
              const expectedOpportunityUpdateMessage = new RegExp(`The Opportunity ${result.Name} has been updated!`);
              expect(response).to.match(expectedOpportunityUpdateMessage);
            }));
  });

  it('should respond with owned opportunities from direct message and direct mention', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    const opportunityName = `owned opp ${uuid()}`;
    return nightmare
      .use(createOpportunityAndEvaluateResponseHref(opportunityName))
      .then(() => nightmare
          .use(nightmareHelpers.sendMessage('opp assigned'))
          .use(nightmareHelpers.evaluateNextSFBotResponse)
          .then((response) => {
            const expectedResponseToMatch = new RegExp(`${opportunityName}`);
            expect(response).to.match(expectedResponseToMatch);
          }));
  });
});
