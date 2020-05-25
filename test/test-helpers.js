const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = [
  {
    id: 1,
    first_name: 'Bob',
    last_name: 'Smith',
    email_address: 'bsmith@company.com',
    password: '$2y$12$DcBqcNuhmWspTwpkxPvpN.YARBTlETTHULgzILVbocwYUz9j3.haW',
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

const authRequestNoPassword = {
  email_address: 'bsmith@company.com',
};

const authRequestNoUsername = {
  password: 'apassword',
};

const authRequestFakeUsername = {
  email_address: 'noone@youngliving.com',
  password: 'nothing',
};

const authRequestIncorrectPassword = {
  email_address: 'maxratto@company.com',
  password: 'nothing',
};

const authRequestValidLogin = {
  email_address: 'bsmith@company.com',
  password: 'bsmith',
};

const authRequestValidLoginAsSallyField = {
  email_address: 'sfield@company.com',
  password: 'sfield',
};

const contests = [
  {
    is_active: true,
    owner_id: '1',
    company_name: 'Test',
    company_url: 'www.test.com',
    company_email: 'test@test.com',
    contest_name: 'contest test',
    image_url: 'contestimage.com',
    contest_description: 'contest_description',
    prize_value: '300',
    official_rules_url: 'contestrules.com',
    business_mailing_address: '1038 West 29 North',
    business_state: 'Utah',
    business_zip_code: '84606',
    end_datetime: '2020-06-12T19:30',
  },
];

const maliciousContest = [{
  is_active: true,
  owner_id: '1',
  company_name: 'Test <script>alert("xss");</script>',
  company_url: 'www.test.com',
  company_email: 'test@test.com',
  contest_name: 'contest test <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> ',
  image_url: 'contestimage.com',
  contest_description: 'contest_description',
  prize_value: '300',
  official_rules_url: 'contestrules.com',
  business_mailing_address: '1038 West 29 North',
  business_state: 'Utah',
  business_zip_code: '84606',
  end_datetime: '2020-06-12T19:30',
}];

const sanitizedContest = {
  company_name: 'Test &lt;script&gt;alert("xss");&lt;/script&gt;',
};

const newContestMissingField = {
  company_url: 'www.test.com',
  company_email: 'test@test.com',
  contest_name: 'contest test',
  image_url: 'contestimage.com',
  contest_description: 'contest_description',
  prize_value: '300',
  official_rules_url: 'contestrules.com',
  business_mailing_address: '1038 West 29 North',
  business_state: 'Utah',
  business_zip_code: '84606',
  end_datetime: '2020-06-12T19:30',
};

const newValidContest = {
  company_name: 'Test',
  company_url: 'www.test.com',
  company_email: 'test@test.com',
  contest_name: 'contest test',
  image_url: 'contestimage.com',
  contest_description: 'contest_description',
  prize_value: '300',
  official_rules_url: 'contestrules.com',
  business_mailing_address: '1038 West 29 North',
  business_state: 'Utah',
  business_zip_code: '84606',
  end_datetime: '2020-06-12T19:30',
};

const participants = [
  {
    id: 1,
    contest_id: 1,
    first_name: 'participant 1 first',
    last_name: 'participant 1 last',
    email_address: 'participant1@gmail.com',
  },
  {
    id: 2,
    referrer_id: 1,
    contest_id: 1,
    first_name: 'participant 2 first',
    last_name: 'participant 2 last',
    email_address: 'participant2@gmail.com',
  },
];

const newParticipantNoContest = {
  referrer_id: 1,
  first_name: 'new participant first name',
  last_name: 'new participant last name',
  email_address: 'sdawerasef@gmail.com',
};

const newParticipantDupEmail = {
  referrer_id: 1,
  contest_id: 1,
  first_name: 'new participant first name',
  last_name: 'new participant last name',
  email_address: 'participant2@gmail.com',
};

const newParticipantNoReferrer = {
  contest_id: 1,
  first_name: 'new participant first name',
  last_name: 'new participant last name',
  email_address: '2894yanhsdkfjasd@gmail.com',
};

const newParticipantWithReferrer = {
  referrer_id: 1,
  contest_id: 1,
  first_name: 'new participant first name',
  last_name: 'new participant last name',
  email_address: '2894yanhsdkfjasd@gmail.com',
};

const maliciousParticipant = {
  id: 1,
  referrer_id: 1,
  contest_id: 1,
  first_name: 'Test <script>alert("xss");</script>',
  last_name: 'contest test <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong>',
  email_address: '2894yanhsdkfjasd@gmail.com',
};

const newMaliciousParticipant = {
  referrer_id: 1,
  contest_id: 1,
  first_name: 'Test <script>alert("xss");</script>',
  last_name: 'contest test <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong>',
  email_address: '2894yanhsdkfjasd@gmail.com',
};

const sanitizedParticipant = {
  referrer_id: '1',
  is_confirmed: false,
  first_name: 'Test &lt;script&gt;alert("xss");&lt;/script&gt;',
  last_name: 'contest test <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong>',
  email_address: '2894yanhsdkfjasd@gmail.com',
  number_of_referrals: null,
  number_of_entries: null,
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

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ id: user.id }, secret, { subject: user.email_address, algorithm: 'HS256' });
  return `bearer ${token}`;
}

function seedContestsTable(db) {
  return db
    .into('contestphyte_contests')
    .insert(contests);
}

function seedMaliciousContest(db) {
  return db
    .into('contestphyte_contests')
    .insert(maliciousContest);
}

function seedParticipantsTable(db) {
  return db
    .into('contestphyte_participants')
    .insert(participants);
}

function seedMaliciousParticipant(db) {
  return db
    .into('contestphyte_participants')
    .insert(maliciousParticipant);
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
  authRequestNoPassword,
  authRequestNoUsername,
  authRequestFakeUsername,
  authRequestIncorrectPassword,
  authRequestValidLogin,
  makeAuthHeader,
  seedContestsTable,
  contests,
  seedMaliciousContest,
  sanitizedContest,
  newContestMissingField,
  newValidContest,
  authRequestValidLoginAsSallyField,
  seedParticipantsTable,
  participants,
  newParticipantDupEmail,
  newParticipantNoContest,
  newParticipantWithReferrer,
  newParticipantNoReferrer,
  maliciousParticipant,
  seedMaliciousParticipant,
  sanitizedParticipant,
  newMaliciousParticipant,
};
