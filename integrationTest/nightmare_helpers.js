const nightmareHelpers = {
  goHome: nightmare => nightmare
    .goto('https://web.ciscospark.com')
    .wait('.user-welcome-text')
    .wait(() => document.querySelectorAll('.user-welcome-text').length === 0),
  login: nightmare => nightmare
    .goto('https://web.ciscospark.com/signin')
    .insert('input[type=text]', process.env.integrationUser)
    .click('button.button')
    .wait('input[type=password]')
    .insert('input[type=password]', process.env.integrationPassword)
    .click('button')
    .wait('.user-welcome-text')
    .wait(() => document.querySelectorAll('.user-welcome-text').length === 0),
  startPrivateConversation: nightmare => nightmare
    .insert('input.add-people', 'SFBot@sparkbot.io')
    .insert('input.add-people', '\u000d')
    .click('button.btnCreateRoom')
    .wait('#message-composer')
    .wait(1000),
  startGroupConversation: nightmare => nightmare
    .insert('input.add-people', 'SFBot@sparkbot.io')
    .insert('input.add-people', '\u000d')
    .insert('input.add-people', process.env.integrationUser2)
    .insert('input.add-people', '\u000d')
    .click('button.btnCreateRoom')
    .wait('#message-composer')
    .wait(1000),
  sendMessage: message => nightmare => nightmare
    .type('#message-composer', message)
    .type('#message-composer', '\u000d')
    .use(nightmareHelpers.waitForMyResponse),
  sendMentionMessage: message => nightmare => nightmare
    .type('#message-composer', '@SF')
    .type('#message-composer', '\u000d')
    .type('#message-composer', ` ${message}`)
    .type('#message-composer', '\u000d')
    .use(nightmareHelpers.waitForMyResponse),
  waitForMyResponse: nightmare => nightmare
    .use(nightmareHelpers.waitForNextResponse('You')),
  evaluateNextSFBotResponse: nightmare => nightmare
    .use(nightmareHelpers.waitForNextSFBotResponse)
    .evaluate(() => document.querySelector('.activity-item:last-child').innerText),
  evaluateNextSFBotResponseLinkHref: nightmare => nightmare
    .use(nightmareHelpers.waitForNextSFBotResponse)
    .evaluate(() => document.querySelector('.activity-item:last-child a').href),
  waitForNextSFBotResponse: nightmare => nightmare
    .use(nightmareHelpers.waitForNextResponse('SFBot')),
  waitForNextResponse: displayName => nightmare => nightmare
    .wait((displayNameBrowserParam) => {
      const lastChild = document.querySelector('.activity-item:last-child .display-name');
      return lastChild && lastChild.innerText && lastChild.innerText === displayNameBrowserParam;
    }, displayName),
};

module.exports = nightmareHelpers;
