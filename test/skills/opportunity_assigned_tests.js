const sinon = require('sinon');
const expect = require('chai').expect;
const opportunityAssigned = require('../../src/skills/opportunity_assigned.js');

describe('opportunity assigned', () => {
  const baseUrl = 'baseUrl/';
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };

    jsforceConn = {};
    opportunityAssigned(controller, jsforceConn);
    process.env.base_url = baseUrl;
  });

  afterEach(() => {
    delete process.env.base_url;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['opp assigned']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let message;
    let listenerCallback;
    let multiPurposeCallback;
    let execute;
    const userError = 'Error Finding User';
    const oppError = 'Error Finding Opportunities';
    const users = [{ Id: 'test id' }];
    let find;
    let sort;
    let sobject;

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { user: 'testuser' };

      execute = sinon.spy((cb) => {
        multiPurposeCallback = cb;
      });
      sort = sinon.stub().returns({ execute });
      find = sinon.stub();
      find.onCall(0).returns({ execute });
      find.onCall(1).returns({ sort });

      sobject = sinon.spy(() => ({ find }));
      jsforceConn.sobject = sobject;

      listenerCallback = controller.hears.args[0][2];
    });

    describe('listener callback', () => {
      beforeEach(() => {
        listenerCallback(bot, message);
      });

      it('calls jsforce connection\'s sobject User method', () => {
        expect(sobject.calledOnce).to.be.true;
        expect(sobject.calledWith('User')).to.be.true;
      });

      it('calls jsforce connection\'s find method', () => {
        expect(find.calledOnce).to.be.true;
        expect(find.calledWith({ Email: message.user })).to.be.true;
      });

      describe('When user is invalid', () => {
        beforeEach(() => {
          multiPurposeCallback(userError, null);
        });

        it('should reply with user error message', () => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.deep.equal(message);
          expect(bot.reply.args[0][1]).to.equal(`Error: ${userError}`);
        });
      });

      describe('When user is valid', () => {
        beforeEach(() => {
          multiPurposeCallback(null, users);
        });

        it('calls jsforce connection\'s sobject Opportunity method', () => {
          expect(sobject.calledTwice).to.be.true;
          expect(sobject.calledWith('Opportunity')).to.be.true;
        });

        it('calls jsforce connection\'s find method with ownerId', () => {
          expect(find.calledTwice).to.be.true;
          expect(find.calledWith({ OwnerId: users[0].Id })).to.be.true;
        });

        it('should sort by created date', () => {
          expect(sort.calledOnce).to.be.true;
          expect(sort.args[0][0]).to.deep.equal({ CreatedDate: -1 });
        });

        describe('When Opportunity find results in error', () => {
          beforeEach(() => {
            multiPurposeCallback(oppError, null);
          });

          it('should reply with opp error message', () => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.deep.equal(message);
            expect(bot.reply.args[0][1]).to.equal(`Error: ${oppError}`);
          });
        });

        describe('When Opportunity find succeeds', () => {
          [
            [],
            [
              {
                Id: 'Opp 01',
                Name: 'Test 01',
              },
            ],
            [
              {
                Id: 'Opp 01',
                Name: 'Test 01',
              },
              {
                Id: 'Opp 02',
                Name: 'Test 02',
              },
            ],
          ].forEach((testCase) => {
            it(`should return correct format when result contains opportunities: ${JSON.stringify(testCase)}`, () => {
              multiPurposeCallback(null, testCase);
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.deep.equal(message);
              const responseMessage = bot.reply.args[0][1];
              const messageParts = responseMessage.split('*');
              expect(messageParts.length).to.equal(testCase.length + 1);
              expect(messageParts[0]).to.equal(`Found ${testCase.length} opportunities:\n`);

              for (let i = 1; i < testCase.length; i += 1) {
                const opp = testCase[i - 1];
                expect(messageParts[i]).to.equal(` [${opp.Id}](${baseUrl}${opp.Id}): ${opp.Name}\n`);
              }
            });
          });

          it('should return a top 5 summary response when more than 5 opportunities are found', () => {
            const maxOpportunitiesCount = 5;
            const opportunities = [];
            for (let i = 0; i < 25; i += 1) {
              opportunities.push({ Id: `Opp ${i}`, Name: `Test ${i}` });
            }
            multiPurposeCallback(null, opportunities);
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.deep.equal(message);
            const responseMessage = bot.reply.args[0][1];
            const messageParts = responseMessage.split('*');
            expect(messageParts.length).to.equal(maxOpportunitiesCount + 1);
            expect(messageParts[0]).to.equal('Found 25 opportunities. Here are the most recent 5:\n');

            for (let i = 1; i < maxOpportunitiesCount; i += 1) {
              const opp = opportunities[i - 1];
              expect(messageParts[i]).to.equal(` [${opp.Id}](${baseUrl}${opp.Id}): ${opp.Name}\n`);
            }
          });
        });
      });
    });
  });
});
