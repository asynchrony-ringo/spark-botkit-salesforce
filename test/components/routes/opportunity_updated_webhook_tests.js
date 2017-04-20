const testModule = require('../../../src/components/routes/opportunity_updated_webook.js');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('incoming web hook for opportunity update', () => {
  let webserver;
  let jsforceConn;

  beforeEach(() => {
    webserver = {
      post: sinon.stub(),
    };

    jsforceConn = {
    };
    testModule(webserver, null, jsforceConn);
  });


  afterEach(() => {

  });

  it('should register a post event', () => {
    expect(webserver.post.calledOnce).to.be.true;
    expect(webserver.post.args[0][0]).to.equal('/salesforce/update');
    expect(webserver.post.args[0][1]).to.be.a('Function');
  });

  describe('webserver post callback', () => {
    let webserverPostCallback;
    let retrieveStub;
    beforeEach(() => {
      webserverPostCallback = webserver.post.args[0][1];
      retrieveStub = sinon.stub();
      jsforceConn.sobject = sinon.stub();
      jsforceConn.sobject.returns({ retrieve: retrieveStub });
    });

    it('should return a successful status and message when the request is of correct type', () => {
      const res = {
        status: sinon.stub(),
        send: sinon.stub(),
      };

      webserverPostCallback({
        body: {
          attributes: {
            type: 'Opportunity',
          },
        },
      }, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledWith('ok')).to.be.true;
    });

    [{ attributes: { type: 'Foo' } }, { attributes: {} }, {}].forEach((requestBody) => {
      it(`should return a failing status and message when the request is ${JSON.stringify(requestBody)}`, () => {
        const res = {
          status: sinon.stub(),
          send: sinon.stub(),
        };

        webserverPostCallback({
          body: requestBody,
        }, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.send.calledWith('Bad Request')).to.be.true;
      });
    });
  });
});
