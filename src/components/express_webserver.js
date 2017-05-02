/* eslint-disable */
const express = require('express');
const debug = require('debug')('botkit:webserver');

module.exports = function (controller, jsforceConn) {
  const webserver = express();

  webserver.use(express.static('public'));
  webserver.listen(process.env.PORT || 3000, null, () => {
    debug(`Express webserver configured and listening at http://localhost:${process.env.PORT}` || 3000);
  });

    // import all the pre-defined routes that are present in /components/routes
  const normalizedPath = require('path').join(__dirname, 'routes');
  require('fs').readdirSync(normalizedPath).forEach((file) => {
    require(`./routes/${file}`)(webserver, controller, jsforceConn);
  });

  controller.webserver = webserver;

  return webserver;
};
