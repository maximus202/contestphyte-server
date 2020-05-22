const ContestsService = {
  getAllContests(knex) {
    return knex
      .select('*')
      .from('contestphyte_contests');
  },
};

module.exports = ContestsService;
