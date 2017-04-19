const uuid = require('uuid/v4');

var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {
    const channelId = uuid();
    debug('Configured POST /salesforce/update for receiving events');
    webserver.post('/salesforce/update', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);
        res.send('ok');

        var bot = controller.spawn({});

        bot.startPrivateConversation({ user: 'apple-research@asynchrony.com' }, function(err, conversation) {
          if (err) { console.log('Error: ', err); return; }

          conversation.say("Hello Success");
        });

        // bot.api.im.open({
        //   user: 'apple-research@asynchrony.com'
        // }, (err, res) => {
        //   if (err) { console.log('Error: ', err); return; }
        //
        //   console.log(res);
        //
        //   bot.startConversation({
        //       user: 'apple-research@asynchrony.com',
        //       channel: res.channel.id,
        //       text: "Testing123",
        //     }, function(err, convo) {
        //       if(err) { console.log('ERROR: ', err); return; }
        //
        //       convo.say('Hi there. This is a success.');
        //   });
        //
        // })

        // bot.startConversation({
        //     user: 'apple-research@asynchrony.com',
        //     channel: channelId,
        //     text: "Testing123",
        //   }, function(err, convo) {
        //     if(err) {
        //       console.log('ERROR: ', err);
        //       return;
        //     }
        //     convo.say({
        //       channel: channelId,
        //       text: 'Just what do you think you are doing, Dave?'
        //     });
        // });

        // Now, pass the webhook into be processed
        console.log('WE GOT SOMETHING!', req.body.OwnerId)

    });

}
