const ContestsService = {
  getContestsByUser(knex, user) {
    return knex
      .select('*')
      .where('owner_id', user)
      .from('contestphyte_contests');
  },
  getContestById(knex, user, contest) {
    return knex
      .select('*')
      .where('id', contest)
      .where('owner_id', user)
      .from('contestphyte_contests');
  },
  insertNewContest(knex, newContest) {
    return knex
      .insert(newContest)
      .into('contestphyte_contests')
      .returning('*')
      .then((row) => console.log(row[0]));
  },
  updateContest(knex, updateContest, contestId) {
    return knex
      .update(updateContest)
      .into('contestphyte_contests')
      .where('id', contestId)
      .returning('*')
      .then((row) => row[0]);
  },
  deleteContest(knex, user, contestId) {
    return knex
      .from('contestphyte_contests')
      .where('owner_id', user)
      .where('id', contestId)
      .delete()
      .returning('*')
      .then((row) => row[0]);
  },
};

module.exports = ContestsService;
