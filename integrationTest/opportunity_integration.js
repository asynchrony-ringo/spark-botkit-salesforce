const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');
const uuid = require('uuid/v4');
const jsforce = require('jsforce');

env('.env');


const extractSysIdFromHref = (href) => {
  console.log('href: ', href);
  return href.match('.*/([^/]*)$')[1];
};

const createOpportunity = nightmare => nightmare
    .use(nightmareHelpers.login)
    .use(nightmareHelpers.startPrivateConversation)
    .use(nightmareHelpers.sendMessage(`opp create <opp integration ${uuid()}> <Proposal/Price Quote> <2017-04-17T17:14:43.441Z>`))
    .use(nightmareHelpers.evaluateNextSFBotResponseLinkHref);

const editOpportunity = (id, jsforceConn) =>
  new Promise((resolve, reject) => {
    const updatePayload = {
      Id: id,
      Name: `opp integration rename ${uuid()}`
    };
    jsforceConn.sobject('Opportunity').update(updatePayload, (error) => {
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
        .use(createOpportunity)
        .then(extractSysIdFromHref)
        .then(oppId => nightmare
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
            }));
  });

  it('should send a direct message to owner on opportunity update', () => {
    const jsforceConn = new jsforce.Connection({ loginUrl: process.env.base_url });

    jsforceConn.login(process.env.salesforce_username,
      process.env.salesforce_password + process.env.salesforce_security_token);

    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(createOpportunity)
      .then(extractSysIdFromHref)
        .then(sysId => editOpportunity(sysId, jsforceConn))
        .then(result => nightmare
            .use(nightmareHelpers.evaluateNextSFBotResponse)
            .then((response) => {
              const expectedOpportunityUpdateMessage = new RegExp(`The Opportunity ${result.Name} has been updated!`);
              expect(response).to.match(expectedOpportunityUpdateMessage);
            }));
  });
});
