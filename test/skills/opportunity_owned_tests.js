const sinon = require('sinon');
const expect = require('chai').expect;
const opportunityOwned = require('../../src/skills/opportunity_owned.js');

describe('opportunity owned', () => {
  const baseUrl = 'baseUrl/';
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };

    jsforceConn = {};
    opportunityOwned(controller, jsforceConn);
    process.env.base_url = baseUrl;
  });

  afterEach(() => {
    delete process.env.base_url;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['opp owned']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let message;
    let listenerCallback;
    let execute;
    let find;
    let sort;
    let sobject;

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { user: 'testuser' };
      execute = sinon.stub();
      sort = sinon.stub().returns({ execute });
      find = sinon.stub();
      find.onCall(0).returns({ execute });
      find.onCall(1).returns({ sort });

      sobject = sinon.stub().returns({ find });
      jsforceConn.sobject = sobject;

      listenerCallback = controller.hears.args[0][2];
    });

    describe('listener callback', () => {
      beforeEach(() => {
        listenerCallback(bot, message);
      });

      it('should call jsforce connection\'s sobject User method', () => {
        expect(sobject.calledOnce).to.be.true;
        expect(sobject.calledWith('User')).to.be.true;
      });

      it('should call jsforce connection\'s find method', () => {
        expect(find.calledOnce).to.be.true;
        expect(find.calledWith({ Email: message.user })).to.be.true;
      });

      it('should call execute after find', () => {
        expect(execute.calledOnce).to.be.true;
        expect(execute.args[0][0]).to.be.a('Function');
      });

      describe('user callback', () => {
        let userCallback;
        beforeEach(() => {
          userCallback = execute.args[0][0];
        });

        it('should reply with error message if user invalid', () => {
          userCallback('Error!', null);
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.deep.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Error: Error!');
        });

        describe('when user is valid', () => {
          const users = [{ Id: 'test id' }];

          beforeEach(() => {
            userCallback(null, users);
          });

          it('should call jsforce connection\'s sobject Opportunity method', () => {
            expect(sobject.calledTwice).to.be.true;
            expect(sobject.calledWith('Opportunity')).to.be.true;
          });

          it('should call jsforce connection\'s find method with ownerId', () => {
            expect(find.calledTwice).to.be.true;
            expect(find.calledWith({ OwnerId: users[0].Id })).to.be.true;
          });

          it('should sort by created date', () => {
            expect(sort.calledOnce).to.be.true;
            expect(sort.args[0][0]).to.deep.equal({ CreatedDate: -1 });
          });

          it('should call execute after sort', () => {
            expect(execute.calledTwice).to.be.true;
            expect(execute.args[1][0]).to.be.a('Function');
          });

          describe('opportunity callback', () => {
            let opportunityCallback;

            beforeEach(() => {
              opportunityCallback = execute.args[1][0];
            });

            it('should reply with opp error message when error', () => {
              opportunityCallback('Opp Error!!', null);
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.deep.equal(message);
              expect(bot.reply.args[0][1]).to.equal('Error: Opp Error!!');
            });

            it('should return correct format when result contains no opportunities', () => {
              const opportunities = [];
              opportunityCallback(null, opportunities);
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.deep.equal(message);
              const responseMessage = bot.reply.args[0][1];
              expect(responseMessage).to.equal('Found no opportunities.');
            });

            [
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
                opportunityCallback(null, testCase);
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

            it('should return a top 10 summary response when more than 10 opportunities are found', () => {
              const maxOpportunitiesCount = 10;
              const opportunities = [];
              for (let i = 0; i < 25; i += 1) {
                opportunities.push({ Id: `Opp ${i}`, Name: `Test ${i}` });
              }
              opportunityCallback(null, opportunities);
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.deep.equal(message);
              const responseMessage = bot.reply.args[0][1];
              const messageParts = responseMessage.split('*');
              expect(messageParts.length).to.equal(maxOpportunitiesCount + 1);
              expect(messageParts[0]).to.equal('Found 25 opportunities. Here are the most recent 10:\n');

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
});
