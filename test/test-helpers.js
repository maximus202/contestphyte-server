const bcrypt = require('bcrypt');

const users = [
  {
    id: 1,
    first_name: 'Bob',
    last_name: 'Smith',
    email_address: 'bsmith@company.com',
    password: '$2y$12$Ydp5yv6NbV..wkvIwc3elemQAxy5JZSPUFUf/v3fy5f2FGMJt8VJO',
    confirmed_account: true,
    date_created: '2002-01-22T16:28:32.615Z',
  },
  {
    id: 2,
    first_name: 'Sally',
    last_name: 'Field',
    email_address: 'sfield@company.com',
    password: '$2y$12$pCWzVPtI7pSrJmBEjfWzouNPQynK2TUrLHoP6BilbLrMqR0sH63de',
    confirmed_account: false,
    date_created: '2003-06-01T16:28:32.615Z',
  },
  {
    id: 3,
    first_name: 'Steve',
    last_name: 'Turner',
    email_address: 'sturner@company.com',
    password: '$2y$12$vtDfFVfCEE.KpnsO0bECbeqNG0XUGHqQfaXI3YrmtldvCCL0y0A5i',
    confirmed_account: true,
    date_created: '2003-02-27T16:28:32.615Z',
  },
];

const maliciousUser = [{
  id: 1,
  first_name: 'Malicious first name <script>alert("xss");</script>',
  last_name: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
  email_address: 'baddie@company.com',
  password: '$2y$12$5Hz/RcGlvQ4ucZyM2U.s0.e4VVbrfphWISUPBB8O0Uxq7aGptOzZa',
  confirmed_account: true,
  date_created: '2005-02-27T16:28:32.615Z',
}];

const sanitizedMaliciousUser = [{
  id: 1,
  first_name: 'Malicious first name &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  last_name: 'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.',
  email_address: 'baddie@company.com',
  password: '$2y$12$5Hz/RcGlvQ4ucZyM2U.s0.e4VVbrfphWISUPBB8O0Uxq7aGptOzZa',
  confirmed_account: true,
  date_created: '2005-02-27T16:28:32.615Z',
}];

const newUserNoFirstName = {
  last_name: 'Smith',
  email_address: 'smith@company.com',
  password: '$2y$12$LO0FR4lgKI9lD0lFYx6F5e2IKxMt8KuNhd1OJA7RSd5HHn7fs6YQe',
};

const newUserNoLastName = {
  first_name: 'Bob',
  email_address: 'bob@company.com',
  password: '$2y$12$LO0FR4lgKI9lD0lFYx6F5e2IKxMt8KuNhd1OJA7RSd5HHn7fs6YQe',
};

const newUserNoEmailAddress = {
  first_name: 'Bob',
  last_name: 'Smith',
  password: '$2y$12$EDLsWy413W0o1aSKklP.1.uwunOo9oYJofH2HiZzy74GDu9Aad7Hm',
};

const newUserNoPassword = {
  first_name: 'Bob',
  last_name: 'Smith',
  email_address: 'bsmith@company.com',
};

const newMaliciousUser = {
  first_name: 'Malicious first name <script>alert("xss");</script>',
  last_name: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
  email_address: 'baddie@company.com',
  password: '$2y$12$zTgWSdiTZxrneQ6fsTQQM.auA04y7TweW5O8fnjqJ4vEjOazJxT8S',
};

const newValidUser = {
  first_name: 'Bob',
  last_name: 'Smith',
  email_address: 'bsmith@company.com',
  password: '$2y$12$ajRWdTZvl4t.Y1o4MZy8e.chIKm3.BVnw6lJbKmkKsgYbjU/3Ij.m',
};

const patchUser = {
  first_name: 'Bobz',
  last_name: 'Smithz',
  email_address: 'bobsmithz@company.com',
};

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
        contestphyte_users,
        contestphyte_participants,
        contestphyte_contests
        RESTART IDENTITY CASCADE`,
  );
}

function seedUsersTable(db) {
  return db
    .into('contestphyte_users')
    .insert(users);
}

function seedMaliciousUser(db) {
  return db
    .into('contestphyte_users')
    .insert(maliciousUser);
}

module.exports = {
  users,
  maliciousUser,
  cleanTables,
  seedUsersTable,
  seedMaliciousUser,
  sanitizedMaliciousUser,
  newUserNoFirstName,
  newUserNoLastName,
  newUserNoEmailAddress,
  newUserNoPassword,
  newMaliciousUser,
  newValidUser,
  patchUser,
};
