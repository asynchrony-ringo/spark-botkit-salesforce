const jsforce = require('jsforce');
const env = require('node-env-file');

const globals = {
  jsforceConn: null
};

before(() => {
  env('.env');

  globals.jsforceConn = new jsforce.Connection({ loginUrl: process.env.base_url });

  globals.jsforceConn.login(process.env.salesforce_username,
      process.env.salesforce_password + process.env.salesforce_security_token);
});

module.exports = globals;
