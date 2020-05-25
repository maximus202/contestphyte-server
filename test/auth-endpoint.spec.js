const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth endpoints', () => {
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

  describe('POST /api/auth/login', () => {
    beforeEach('insert users in db', () => helpers.seedUsersTable(db));
    context('given no username or password provided in request', () => {
      it('responds with 400 and error if request is missing username and password', () => supertest(app)
        .post('/api/auth/login')
        .send({})
        .expect(400), {
        error: {
          message: 'missing username or password in request body',
        },
      });
      it('responds with 400 and error if request is missing a password', () => supertest(app)
        .post('/api/auth/login')
        .send(helpers.authRequestNoPassword)
        .expect(400), {
        error: {
          message: 'missing username or password in request body',
        },
      });
      it('responds with 400 and error if request is missing a username', () => supertest(app)
        .post('/api/auth/login')
        .send(helpers.authRequestNoUsername)
        .expect(400, {
          error: {
            message: 'missing username or password in request body',
          },
        }));
    });

    context('given username does not exist', () => {
      it('responds with 404 and error if user does not exist', () => supertest(app)
        .post('/api/auth/login')
        .send(helpers.authRequestFakeUsername)
        .expect(404), {
        error: {
          message: 'incorrect username or password',
        },
      });
    });

    context('given username is correct, password is incorrect', () => {
      it('responds with 404 and error if username is correct, password is not', () => supertest(app)
        .post('/api/auth/login')
        .send(helpers.authRequestIncorrectPassword)
        .expect(404), {
        error: {
          message: 'incorrect username or password',
        },
      });
    });
  });
});
