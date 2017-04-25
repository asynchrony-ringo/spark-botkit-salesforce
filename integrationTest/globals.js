const jsforce = require('jsforce');

const globals = {
  jsforceConn: null
};

before(() => {
  globals.jsforceConn = new jsforce.Connection({ loginUrl: process.env.base_url });

  globals.jsforceConn.login(process.env.salesforce_username,
      process.env.salesforce_password + process.env.salesforce_security_token);
});

module.exports = globals;
