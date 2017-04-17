const opportunityCreate = (controller, jsforceConn) => {
  const goToNextQuestion = (response, convo) => convo.next();
  const createOpportunity = (response, convo) => {
    jsforceConn.sobject('Opportunity').create(
      {
        Name: convo.responses.oppName.text,
        StageName: convo.responses.stageName.text,
        CloseDate: convo.responses.closeDate.text,
      },
      (error, result) => {
        if (error) {
          convo.say(`Error: ${error}`);
        } else {
          convo.say(`Success: [${convo.responses.oppName.text}](${process.env.base_url}${result.id})`);
        }
        convo.next();
      });
  };
  controller.hears(['opp create'], 'direct_message', (bot, message) => {
    bot.startConversation(message, (error, convo) => {
      if (error) {
        bot.say('Error starting conversation');
      } else {
        convo.addQuestion('What is the opportunity name?', goToNextQuestion, { key: 'oppName' });
        convo.addQuestion('What stage is the opportunity in?', goToNextQuestion, { key: 'stageName' });
        convo.addQuestion('What is the close date?', createOpportunity, { key: 'closeDate' });
      }
    });
  });
};

module.exports = opportunityCreate;
