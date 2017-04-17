const sinon = require('sinon');
const expect = require('chai').expect;
const opportunityCreate = require('../../src/skills/opportunity_create.js');

describe('opportunity create', () => {
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };

    jsforceConn = { };
    opportunityCreate(controller, jsforceConn);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['opp create']);
    expect(controller.hears.args[0][1]).to.equal('direct_message');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let message;

    beforeEach(() => {
      bot = {
        startConversation: sinon.stub(),
        say: sinon.stub(),
      };
      message = { something: 'cool' };
      const listenerCallback = controller.hears.args[0][2];
      listenerCallback(bot, message);
    });

    it('should start a conversation', () => {
      expect(bot.startConversation.calledOnce).to.be.true;
      expect(bot.startConversation.args[0][0]).to.equal(message);
      expect(bot.startConversation.args[0][1]).to.be.a('Function');
    });

    describe('convo callback', () => {
      let convo;
      let convoCallback;

      beforeEach(() => {
        convo = {
          addQuestion: sinon.stub(),
          say: sinon.stub(),
          next: sinon.stub(),
        };
        convoCallback = bot.startConversation.args[0][1];
      });

      it('should do something when error', () => {
        convoCallback({ error: 'error' }, convo);
        expect(bot.say.calledOnce).to.be.true;
        expect(bot.say.args[0][0]).to.equal('Error starting conversation');
      });

      describe('without error', () => {
        let question1Args;
        let question2Args;
        let question3Args;
        beforeEach(() => {
          convoCallback(false, convo);
          question1Args = convo.addQuestion.args[0];
          question2Args = convo.addQuestion.args[1];
          question3Args = convo.addQuestion.args[2];
        });

        it('should add three questions to the conversation', () => {
          expect(convo.addQuestion.calledThrice).to.be.true;
        });

        describe('question 1', () => {
          it('should add a question for opportunity name', () => {
            expect(question1Args[0]).to.equal('What is the opportunity name?');
          });
          it('should add callback that continues the conversation', () => {
            const questioncallback = question1Args[1];
            questioncallback({}, convo);
            expect(convo.next.calledOnce).to.be.true;
          });
          it('should have the correct key', () => {
            expect(question1Args[2]).to.deep.equal({ key: 'oppName' });
          });
        });

        describe('question 2', () => {
          it('should add a question for stage name', () => {
            expect(question2Args[0]).to.equal('What stage is the opportunity in?');
          });
          it('should add callback that continues the conversation', () => {
            const questioncallback = question2Args[1];
            questioncallback({}, convo);
            expect(convo.next.calledOnce).to.be.true;
          });
          it('should have the correct key', () => {
            expect(question2Args[2]).to.deep.equal({ key: 'stageName' });
          });
        });

        describe('question 3', () => {
          it('should add a question for close date', () => {
            expect(question3Args[0]).to.equal('What is the close date?');
          });

          it('should have the correct key', () => {
            expect(question3Args[2]).to.deep.equal({ key: 'closeDate' });
          });

          describe('create opportunity callback', () => {
            let create;
            let createCallback;

            beforeEach(() => {
              const questioncallback = question3Args[1];
              create = sinon.stub();
              jsforceConn.sobject = sinon.stub().withArgs('Opportunity').returns({ create });
              convo.responses =
              { stageName: { text: 'stageName blah' },
                oppName: { text: 'oppName blah' },
                closeDate: { text: 'closeDate blah' } };

              questioncallback({}, convo);
              createCallback = create.args[0][1];
            });

            it('should call sobject create', () => {
              expect(create.calledOnce).to.be.true;
              expect(create.args[0][0]).to.deep.equal({
                Name: 'oppName blah',
                StageName: 'stageName blah',
                CloseDate: 'closeDate blah',
              });
            });

            describe('when there is an error', () => {
              beforeEach(() => {
                createCallback('error', null);
              });

              it('should return with an error', () => {
                expect(convo.say.args[0][0]).to.equal('Error: error');
              });
              it('should call convo.next', () => {
                expect(convo.next.calledOnce).to.be.true;
              });
            });

            describe('when it is successful', () => {
              beforeEach(() => {
                createCallback(null, { id: 'bogusId' });
              });

              it('should return success with link to created opportunity', () => {
                expect(convo.say.args[0][0]).to.equal(`Success: [oppName blah](${process.env.base_url}bogusId)`);
              });
              it('should call convo.next', () => {
                expect(convo.next.calledOnce).to.be.true;
              });
            });
          });
        });
      });
    });
  });
});
