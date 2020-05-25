const ParticipantsService = {
  getParticipants(knex, contest) {
    return knex
      .select('*')
      .where('contest_id', contest)
      .from('contestphyte_participants');
  },
  checkDuplicateEmail(knex, email, contest) {
    return knex
      .select('*')
      .where('contest_id', contest)
      .where('email_address', email)
      .from('contestphyte_participants');
  },
  insertParticipant(knex, participant) {
    return knex
      .insert(participant)
      .into('contestphyte_participants')
      .returning('*')
      .then((row) => row[0]);
  },
  rewardReferrer(knex, referrer, referralAmount, rewardAmount) {
    return knex
      .into('contestphyte_participants')
      .where('id', referrer)
      .increment('number_of_referrals', referralAmount)
      .increment('number_of_entries', rewardAmount)
      .returning('*')
      .then((row) => row[0]);
  },
};

module.exports = ParticipantsService;
