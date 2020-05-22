const express = require('express');
const xss = require('xss');
const ContestsService = require('./contests-service');
const requireAuth = require('../middleware/jwt-auth');

const contestRouter = express.Router();
const jsonParser = express.json();

const seralizeContest = (contest) => ({
  company_name: xss(contest.company_name),
});

contestRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ContestsService.getAllContests(knexInstance)
      .then((contests) => {
        res.json(contests.map(seralizeContest));
      })
      .catch(next);
  });

module.exports = contestRouter;
