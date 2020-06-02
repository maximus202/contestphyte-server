/* eslint-disable no-undef */

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('participants endpoint', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean tables', () => helpers.cleanTables(db));

  afterEach('clean tables', () => helpers.cleanTables(db));

  describe('GET /api/participants/:contest_id', () => {
    context('given missing bearer token', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert participants', () => helpers.seedParticipantsTable(db));
      it('responds with 401 and error message', () => supertest(app)
        .get('/api/participants/1')
        .expect(401), {
        error: {
          message: 'missing bearer token',
        },
      });
    });

    context('given no contest_id', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert participants', () => helpers.seedParticipantsTable(db));
      it('responds with 404', () => supertest(app)
        .get('/api/participants')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(404));
    });

    context('given invalid contest_id', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert participants', () => helpers.seedParticipantsTable(db));
      it('responds with 404 and error message', () => supertest(app)
        .get('/api/participants/1456345')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(404, {
          error: {
            message: 'contest not found',
          },
        }));
    });

    context('given contest_id is not owned by owner', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert participants', () => helpers.seedParticipantsTable(db));
      it('responds with 404 and error message', () => supertest(app)
        .get('/api/participants/1')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLoginAsSallyField))
        .expect(404, {
          error: {
            message: 'contest not found',
          },
        }));
    });

    context('given xss attack', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert malicious participant', () => helpers.seedMaliciousParticipant(db));
      it('responds with 200 and sanitized participant', () => supertest(app)
        .get('/api/participants/1')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(200)
        .expect((res) => {
          expect(res.body[0].first_name).to.eql(helpers.sanitizedParticipant.first_name);
          expect(res.body[0].last_name).to.eql(helpers.sanitizedParticipant.last_name);
        }));
    });

    context('given valid request', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert participants', () => helpers.seedParticipantsTable(db));
      it('responds with 200', () => supertest(app)
        .get('/api/participants/1')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(200)
        .expect((res) => {
          expect(res.body.first_name).to.eql(helpers.participants.first_name);
          expect(res.body.last_name).to.eql(helpers.participants.last_name);
          expect(res.body.email_address).to.eql(helpers.participants.email_address);
        }));
    });
  });

  describe('POST /api/participants/new/:contest_id', () => {
    context('given no contest_id', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert participants', () => helpers.seedParticipantsTable(db));
      it('responds with 400 and error message', () => supertest(app)
        .post('/api/participants/new/')
        .send(helpers.newParticipantNoContest)
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(404));
    });

    context('given duplicate email inserted in the same contest', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      beforeEach('insert participants', () => helpers.seedParticipantsTable(db));
      it('responds with 400 and error message', () => supertest(app)
        .post('/api/participants/new/1')
        .send(helpers.newParticipantDupEmail)
        .expect(400, {
          error: {
            message: 'this user has already entered this contest',
          },
        }));
    });

    context('given xss attack', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      it('responds with 200 and sanitized participant', () => supertest(app)
        .post('/api/participants/new/1')
        .send(helpers.newMaliciousParticipant)
        .expect(200)
        .expect((res) => {
          expect(res.body.first_name).to.eql(helpers.sanitizedParticipant.first_name);
          expect(res.body.last_name).to.eql(helpers.sanitizedParticipant.last_name);
        }));
    });

    context('given valid request with no referrer', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      it('responds with 200 and new participant', () => supertest(app)
        .post('/api/participants/new/1')
        .send(helpers.newParticipantNoReferrer)
        .expect(200)
        .expect((res) => {
          expect(res.body.referrer_id).to.eql('');
          expect(res.body.first_name).to.eql(helpers.newParticipantNoReferrer.first_name);
          expect(res.body.last_name).to.eql(helpers.newParticipantNoReferrer.last_name);
          expect(res.body.email_address).to.eql(helpers.newParticipantNoReferrer.email_address);
        }));
    });

    context('given valid request with referrer', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      beforeEach('insert contests', () => helpers.seedContestsTable(db));
      it('responds with 200 and new participant', () => supertest(app)
        .post('/api/participants/new/1')
        .send(helpers.newParticipantWithReferrer)
        .expect(200)
        .expect((res) => {
          expect(res.body.first_name).to.eql(helpers.newParticipantNoReferrer.first_name);
          expect(res.body.last_name).to.eql(helpers.newParticipantNoReferrer.last_name);
          expect(res.body.email_address).to.eql(helpers.newParticipantNoReferrer.email_address);
        }));
    });
  });
});
