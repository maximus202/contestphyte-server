module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DB_URL || 'postgresql://postgres@localhost/contestphytedb',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/contestphytedb-test',
};
