const sinon = require('sinon');
const expect = require('chai').expect;
const ownedController = require('../../src/skillsControllers/owned_controller.js');

describe('status controller reply', () => {
  const table = 'entity';
  const description = 'entity_description';
  describe('replyWithStatus', () => {
    let bot;
    let message;
    let execute;
    let find;
    let sort;
    let sobject;
    let jsforceConn;

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { user: 'testuser' };
      execute = sinon.stub();
      sort = sinon.stub().returns({ execute });
      find = sinon.stub();
      find.onCall(0).returns({ execute });
      find.onCall(1).returns({ sort });

      sobject = sinon.stub().returns({ find });
      jsforceConn = {};
      jsforceConn.sobject = sobject;
      process.env.base_url = 'awesomesauce.com/';
      ownedController.replyWithStatus(table, description, bot, message, jsforceConn);
    });

    afterEach(() => {
      delete process.env.base_url;
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

      describe('when user is invalid', () => {
        beforeEach(() => {
          userCallback('Error!', null);
        });

        it('should reply with error message if user invalid', () => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.deep.equal(message);
          expect(bot.reply.args[0][1]).to.equal(`Sorry, I was unable to retrieve your assigned ${description}. Error!`);
        });
      });

      describe('when user is valid', () => {
        const users = [{ Id: 'test id' }];

        beforeEach(() => {
          userCallback(null, users);
        });

        it('should call jsforce connection\'s sobject Entity method', () => {
          expect(sobject.calledTwice).to.be.true;
          expect(sobject.calledWith('entity')).to.be.true;
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

        describe('entity callback', () => {
          let entityCallback;

          beforeEach(() => {
            entityCallback = execute.args[1][0];
          });

          it('should reply with entity error message when error', () => {
            entityCallback('Entity Error!!', null);
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.deep.equal(message);
            expect(bot.reply.args[0][1]).to.equal(`Sorry, I was unable to retrieve your assigned ${description}. Entity Error!!`);
          });

          it('should return correct format when result contains no entities', () => {
            const entities = [];
            entityCallback(null, entities);
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.deep.equal(message);
            const responseMessage = bot.reply.args[0][1];
            expect(responseMessage).to.equal('Found no entity_description.');
          });

          [
            [
              {
                Id: 'Entity 01',
                Name: 'Entity Name 01',
              },
            ],
            [
              {
                Id: 'Entity 01',
                Name: 'Entity Name 01',
              },
              {
                Id: 'Entity 02',
                Name: 'Entity Name 02',
              },
            ],
          ].forEach((testCase) => {
            it(`should return correct format when result contains less than 11 entities: ${JSON.stringify(testCase)}`, () => {
              entityCallback(null, testCase);
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.deep.equal(message);
              const responseMessage = bot.reply.args[0][1];
              const messageParts = responseMessage.split('*');
              expect(messageParts.length).to.equal(testCase.length + 1);
              expect(messageParts[0]).to.equal(`Found ${testCase.length} entity_description:\n`);

              for (let i = 1; i < testCase.length; i += 1) {
                const opp = testCase[i - 1];
                expect(messageParts[i]).to.equal(` [${opp.Id}](${process.env.base_url}/${opp.Id}): ${opp.Name}\n`);
              }
            });
          });

          it('should return a top 10 summary response when more than 10 entities are found', () => {
            const maxEntityCount = 10;
            const entities = [];
            for (let i = 0; i < 25; i += 1) {
              entities.push({ Id: `Entity ${i}`, Name: `Entity Test ${i}` });
            }
            entityCallback(null, entities);
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.deep.equal(message);
            const responseMessage = bot.reply.args[0][1];
            const messageParts = responseMessage.split('*');
            expect(messageParts.length).to.equal(maxEntityCount + 1);
            expect(messageParts[0]).to.equal('Found 25 entity_description. Here are the most recent 10:\n');

            for (let i = 1; i < maxEntityCount; i += 1) {
              const entity = entities[i - 1];
              expect(messageParts[i]).to.equal(` [${entity.Id}](${process.env.base_url}/${entity.Id}): ${entity.Name}\n`);
            }
          });
        });
      });
    });
  });
});
