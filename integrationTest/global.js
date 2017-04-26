const jsforce = require('jsforce');
const clearUnreadMessages = require('./nightmare/clear_unread_messages.js');
const env = require('node-env-file');

const global = {
  jsforceConn: null
};

before(() => {
  env('.env');

  global.jsforceConn = new jsforce.Connection({ loginUrl: process.env.base_url });

  global.jsforceConn.login(process.env.salesforce_username,
      process.env.salesforce_password + process.env.salesforce_security_token);

  return clearUnreadMessages();
});

module.exports = global;
