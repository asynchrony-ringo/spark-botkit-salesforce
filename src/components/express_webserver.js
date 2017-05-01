const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('botkit:webserver');
const hmacSHA1 = require('crypto-js/hmac-sha1');
const utf8 = require('crypto-js/enc-utf8');


module.exports = function (controller, jsforceConn) {
  const webserver = express();

  webserver.use(bodyParser.json({ verify: (req, res, buff, encoding) => {
    req.hmacSHA1 = hmacSHA1(buff.toString(encoding), process.env.secret).toString();
  },
  }));
  webserver.use(bodyParser.urlencoded({ extended: true }));

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
