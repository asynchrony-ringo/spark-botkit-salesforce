const Nightmare = require('nightmare');
const nightmareHelpers = require('./nightmare_helpers.js');

const batchCloseSize = 25;

const queueClearingUnread = (nightmare) => {
  for (let i = 0; i < batchCloseSize; i += 1) {
    nightmare
      .wait('.convo-filter-menu-list-header')
      .click('.convo-filter-menu-list-header')
      .wait('.convoFilters-FILTER_UNREAD')
      .click('.convoFilters-FILTER_UNREAD')
      .wait(500)
      .click('.roomListItem:nth-of-type(1)')
      .wait(1500)
      .click('.navigation-bar [title=Message]');
  }
};

const clearUnreadMessages = () => {
  console.log('Clearing unread messages.');
  const nightmare = Nightmare(Object.assign({ show: true, waitTimeout: 60000 }));
  return nightmare
    .use(nightmareHelpers.login)
    .use(queueClearingUnread)
    .end()
    .then(() => Promise.reject('too many unread'))
    .catch((error) => {
      if (error === 'too many unread') {
        console.log(`More than ${batchCloseSize} unread messages existed. Starting over`);
        return clearUnreadMessages();
      }
      console.log('all unread messages have been cleared');
      return true;
    }
  );
};

module.exports = clearUnreadMessages;
