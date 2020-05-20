const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('users endpoint', () => {
  let db;

  before('make Knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean tables', () => helpers.cleanTables(db));

  afterEach('clean tables', () => helpers.cleanTables(db));

  describe('GET /api/users', () => {
    context('given users do not exist', () => {
      it('GET /api/users responds with 200 and no users', () => {
        supertest(app)
          .get('/api/users')
          .expect(200, []);
      });
    });

    context('given users exist', () => {
      beforeEach('insert users', () => helpers.seedUsersTable(db));
      it('responds with 200 and all users', () => supertest(app)
        .get('/api/users')
        .expect(200)
        .then((res) => {
          expect(res.body.id).to.eql(helpers.users.id);
          expect(res.body.first_name).to.eql(helpers.users.first_name);
          expect(res.body.last_name).to.eql(helpers.users.last_name);
          expect(res.body.email).to.eql(helpers.users.email);
        }));
    });

    context('given XSS attack', () => {
      beforeEach('insert malicious user', () => helpers.seedMaliciousUser(db));
      it('removes XSS attack', () => supertest(app)
        .get('/api/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).to.eql(helpers.maliciousUser.id);
          expect(res.body.first_name).to.eql(helpers.maliciousUser.first_name);
          expect(res.body.last_name).to.eql(helpers.maliciousUser.last_name);
          expect(res.body.email_address).to.eql(helpers.maliciousUser.email_address);
        }));
    });
  });

  describe('POST /api/users', () => {
    context('given missing fields', () => {
      it('responds with 400 if first_name is missing', () => supertest(app)
        .post('/api/users')
        .send(helpers.newUserNoFirstName)
        .expect(400), {
        error: {
          message:
                        'first_name missing in request body',
        },
      });

      it('responds with 400 if last_name is missing', () => supertest(app)
        .post('/api/users')
        .send(helpers.newUserNoLastName)
        .expect(400), {
        error: {
          message:
                        'last_name missing in request body',
        },
      });

      it('responds with 400 if email_address is missing', () => supertest(app)
        .post('/api/users')
        .send(helpers.newUserNoEmailAddress)
        .expect(400), {
        error: {
          message:
                        'email_address missing in request body',
        },
      });

      it('responds with 400 if password is missing', () => supertest(app)
        .post('/api/users')
        .send(helpers.newUserNoPassword)
        .expect(400), {
        error: {
          message:
                        'password missing in request body',
        },
      });
    });

    context('given valid new user submission', () => {
      it('responds with 201', () => supertest(app)
        .post('/api/users')
        .send(helpers.newValidUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.first_name).to.eql(helpers.newValidUser.first_name);
          expect(res.body.last_name).to.eql(helpers.newValidUser.last_name);
          expect(res.body.email_address).to.eql(helpers.newValidUser.email_address);
        }));
    });

    context('given xss attack', () => {
      it('responds with sanitized user', () => supertest(app)
        .post('/api/users')
        .send(helpers.newMaliciousUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.first_name).to.eql(helpers.sanitizedMaliciousUser[0].first_name);
          expect(res.body.last_name).to.eql(helpers.sanitizedMaliciousUser[0].last_name);
          expect(res.body.email_address).to.eql(helpers.sanitizedMaliciousUser[0].email_address);
        }));
    });
  });

  describe('GET :/user_id', () => {
    context('given user is not found', () => {
      it('responds with 404', () => supertest(app)
        .get('/api/users/1')
        .expect(404));
    });

    context('given user exists', () => {
      const testUser = helpers.users[0];
      beforeEach('add users to db', () => helpers.seedUsersTable(db));
      it('responds with 200', () => supertest(app)
        .get(`/api/users/${testUser.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.first_name).to.eql(testUser.first_name);
          expect(res.body.last_name).to.eql(testUser.last_name);
          expect(res.body.email_address).to.eql(testUser.email_address);
        }));
    });
  });

  describe('PATCH /api/users/user_id', () => {
    const user = helpers.users[0];
    beforeEach('insert users in db', () => helpers.seedUsersTable(db));

    context('given data is missing', () => {
      it('responds with 400', () => supertest(app)
        .patch(`/api/users/${user.id}`)
        .send({})
        .expect(400));
    });

    context('given successful patch', () => {
      it('responds with 201', () => supertest(app)
        .patch(`/api/users/${user.id}`)
        .send(helpers.patchUser)
        .expect(204));
    });
  });

  describe('DELETE /api/users/user_id', () => {
    context('given user exists', () => {
      const user = helpers.users[0];
      beforeEach('add users in db', () => helpers.seedUsersTable(db));
      it('responds with 200 and success message', () => supertest(app)
        .delete(`/api/users/${user.id}`)
        .expect(200, { success: { message: 'User successfully deleted' } }));
    });
  });
});
