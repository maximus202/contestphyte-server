const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('contests endpoint', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean tables', () => helpers.cleanTables(db));

  afterEach('clean tables', () => helpers.cleanTables(db));

  describe('GET /api/contests/', () => {
    context('given no bearer token', () => {
      it('responds with 401 and error message', () => supertest(app)
        .get('/api/contests/')
        .expect(401, {
          error: {
            message: 'missing bearer token',
          },
        }));
    });

    context('given no contest exists for user', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      it('responds with 401', () => supertest(app)
        .get('/api/contests')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLoginAsSallyField))
        .expect(404), {
        error: {
          message: 'no contests found',
        },
      });
    });

    context('given valid request', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('responds with 200 and all contests belonging to the user in bearer token', () => supertest(app)
        .get('/api/contests')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(200)
        .expect((res) => {
          expect(res.body[0].contest_name).to.eql(helpers.contests[0].contest_name);
        }));
    });

    context('given xss attack', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedMaliciousContest(db));
      it('responds with 200 and sanitized object', () => supertest(app)
        .get('/api/contests')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(200)
        .expect((res) => {
          expect(res.body[0].company_name).to.eql(helpers.sanitizedContest.company_name);
        }));
    });
  });

  describe('POST /api/contests/', () => {
    beforeEach('insert users in db', () => helpers.seedUsersTable(db));

    context('given no bearer token', () => {
      it('responds with 401 and error', () => supertest(app)
        .get('/api/contests')
        .send(helpers.newValidContest)
        .expect(401), {
        error: {
          message: 'missing bearer token',
        },
      });
    });

    context('given a value is missing in the body', () => {
      it('responds with 400 and error message', () => supertest(app)
        .post('/api/contests/')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .send(helpers.newContestMissingField)
        .expect(400, {
          error: {
            message: 'company_name missing in request body',
          },
        }));
    });

    context('given valid request', () => {
      it('responds with 201 and newly created contest', () => supertest(app)
        .post('/api/contests/')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .send(helpers.newValidContest)
        .expect(201)
        .expect((res) => {
          expect(res.body.company_name).to.eql(helpers.newValidContest.company_name);
          expect(res.body.company_url).to.eql(helpers.newValidContest.company_url);
          expect(res.body.company_email).to.eql(helpers.newValidContest.company_email);
          expect(res.body.contest_name).to.eql(helpers.newValidContest.contest_name);
          expect(res.body.image_url).to.eql(helpers.newValidContest.image_url);
          expect(res.body.contest_description).to.eql(helpers.newValidContest.contest_description);
          expect(res.body.prize_value).to.eql(helpers.newValidContest.prize_value);
          expect(res.body.official_rules_url).to.eql(helpers.newValidContest.official_rules_url);
          expect(res.body.business_mailing_address).to.eql(helpers.newValidContest.business_mailing_address);
          expect(res.body.business_state).to.eql(helpers.newValidContest.business_state);
          expect(res.body.business_zip_code).to.eql(helpers.newValidContest.business_zip_code);
        }));
    });
  });

  describe('GET /api/contests/:contest_id', () => {
    context('given no bearer token', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedMaliciousContest(db));
      it('responds with 401 and error message', () => supertest(app)
        .get('/api/contests/1')
        .expect(401, {
          error: {
            message: 'missing bearer token',
          },
        }));
    });

    context('given contest_id does not exist', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('respond with 404 and error message', () => supertest(app)
        .get('/api/contests/100000')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLoginAsSallyField))
        .expect(404), {
        error: {
          message: 'Contest not found',
        },
      });
    });

    context('given contest_id does not belong to user', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('respond with 404 and error message', () => supertest(app)
        .get('/api/contests/1')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLoginAsSallyField))
        .expect(404), {
        error: {
          message: 'Contest not found',
        },
      });
    });

    context('given a valid request', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('respond with 200 and contest', () => supertest(app)
        .get('/api/contests/1')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(200)
        .expect((res) => {
          expect(res.body.contest_name).to.eql(helpers.users[0].contest_name);
        }));
    });
  });

  describe('DELETE /api/contests/:contest_id', () => {
    context('given no bearer token', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('responds with 401 and error message', () => supertest(app)
        .delete('/api/contests/1')
        .expect(401, {
          error: {
            message: 'missing bearer token',
          },
        }));
    });

    context('given no contest_id provided', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('responds with 404', () => supertest(app)
        .delete('/api/contests/')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(404));
    });

    context('given invalid contest_id', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('responds with 404', () => supertest(app)
        .delete('/api/contests/199')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(404));
    });

    context('given contest_id not owned by user', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('responds with 404', () => supertest(app)
        .delete('/api/contests/1')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLoginAsSallyField))
        .expect(404));
    });

    context('given valid request', () => {
      beforeEach('insert users in db', () => helpers.seedUsersTable(db));
      beforeEach('insert contests in db', () => helpers.seedContestsTable(db));
      it('responds with 204', () => supertest(app)
        .delete('/api/contests/1')
        .set('Authorization', helpers.makeAuthHeader(helpers.authRequestValidLogin))
        .expect(204));
    });
  });
});
