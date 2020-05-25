const path = require('path');
const express = require('express');
const xss = require('xss');
const ContestsService = require('./contests-service');
const requireAuth = require('../middleware/jwt-auth');

const contestRouter = express.Router();
const jsonParser = express.json();

const seralizeContest = (contest) => ({
  is_active: contest.is_active,
  company_name: xss(contest.company_name),
  company_url: xss(contest.company_url),
  company_email: xss(contest.company_email),
  contest_name: xss(contest.contest_name),
  image_url: xss(contest.image_url),
  contest_description: xss(contest.contest_description),
  prize_value: xss(contest.prize_value),
  official_rules_url: xss(contest.official_rules_url),
  business_mailing_address: xss(contest.business_mailing_address),
  business_state: xss(contest.business_state),
  business_zip_code: xss(contest.business_zip_code),
  end_datetime: xss(contest.end_datetime),
  impressions: contest.impressions,
});

contestRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user = req.user_id;
    ContestsService.getContestsByUser(knexInstance, user)
      .then((contests) => {
        if (contests.length === 0) {
          return res.status(404).json({
            error: {
              message: 'no contests found',
            },
          });
        }
        res.json(contests.map(seralizeContest));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const newContest = {
      owner_id: req.user_id,
      is_active: true,
      company_name: req.body.company_name,
      company_url: req.body.company_url,
      company_email: req.body.company_email,
      contest_name: req.body.contest_name,
      image_url: req.body.image_url,
      contest_description: req.body.contest_description,
      prize_value: req.body.prize_value,
      official_rules_url: req.body.official_rules_url,
      business_mailing_address: req.body.business_mailing_address,
      business_state: req.body.business_state,
      business_zip_code: req.body.business_zip_code,
      end_datetime: req.body.end_datetime,
    };

    for (const [key, value] of Object.entries(newContest)) {
      if (value == null) {
        return res.status(400).json({
          error: {
            message: `${key} missing in request body`,
          },
        });
      }
    }

    ContestsService.insertNewContest(knexInstance, newContest)
      .then((contest) => res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${contest.id}`))
        .json(seralizeContest(contest)))
      .catch(next);
  });

contestRouter
  .route('/:contest_id')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user = req.user_id;
    const contest = req.params.contest_id;
    ContestsService.getContestById(knexInstance, user, contest)
      .then((row) => {
        if (row.length === 0) {
          return res.status(404).json({
            error: {
              message: 'Contest not found',
            },
          });
        }
        res.json(row.map(seralizeContest));
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const updateContest = {
      owner_id: req.user_id,
      is_active: true,
      company_name: req.body.company_name,
      company_url: req.body.company_url,
      company_email: req.body.company_email,
      contest_name: req.body.contest_name,
      image_url: req.body.image_url,
      contest_description: req.body.contest_description,
      prize_value: req.body.prize_value,
      official_rules_url: req.body.official_rules_url,
      business_mailing_address: req.body.business_mailing_address,
      business_state: req.body.business_state,
      business_zip_code: req.body.business_zip_code,
      end_datetime: req.body.end_datetime,
    };
    const contestId = req.params.contest_id;

    for (const [key, value] of Object.entries(updateContest)) {
      if (value == null) {
        return res
          .status(400)
          .json({
            error: {
              message: 'missing input in the request body',
            },
          })
          .catch(next);
      }
    }

    ContestsService.updateContest(knexInstance, updateContest, contestId)
      .then((contest) => res
        .status(201)
        .json(seralizeContest(contest)))
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user = req.user_id;
    const contest = req.params.contest_id;

    ContestsService.getContestById(knexInstance, user, contest)
      .then((row) => {
        if (row.length === 0) {
          return res.status(404).json({
            error: {
              message: 'contest not found',
            },
          });
        }
      });

    ContestsService.deleteContest(knexInstance, user, contest)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = contestRouter;
