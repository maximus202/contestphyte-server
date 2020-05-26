const bcrypt = require('bcrypt');

const hashPassword = (password) => bcrypt.hash(password, 10);

const UsersService = {
  getAllUsers(knex) {
    return knex
      .select('*')
      .from('contestphyte_users');
  },
  getById(knex, userId) {
    return knex
      .from('contestphyte_users')
      .select('*')
      .where('id', userId)
      .first();
  },
  insertNewUser(knex, newUser) {
    console.log('knex', knex);
    return hashPassword(newUser.password)
      .then((hash) => knex
        .insert({
          ...newUser,
          password: hash,
        })
        .into('contestphyte_users')
        .returning('*')
  },
  updateUser(knex, id, updatedUser) {
    return knex('contestphyte_users')
      .where({ id })
      .update(updatedUser);
  },
  deleteUser(knex, id) {
    return knex('contestphyte_users')
      .where({ id })
      .delete();
  },
};

module.exports = UsersService;
