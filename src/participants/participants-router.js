const path = require('path');
const express = require('express');
const xss = require('xss');
const ParticipantsService = require('./participants-service');
const ContestsService = require('../contests/contests-service');
const requireAuth = require('../middleware/jwt-auth');

const participantsRouter = express.Router();
const jsonParser = express.json();

const serializeParticipants = (participant) => ({
  id: participant.id,
  contest_id: participant.contest_id,
  referrer_id: xss(participant.referrer_id),
  is_confirmed: participant.is_confirmed,
  first_name: xss(participant.first_name),
  last_name: xss(participant.last_name),
  email_address: xss(participant.email_address),
  number_of_referrals: participant.number_of_referrals,
  number_of_entries: participant.number_of_entries,
});

participantsRouter
  .route('/:contest_id')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const owner = req.user_id;
    const contest = req.params.contest_id;
    ContestsService.getContestById(knexInstance, owner, contest)
      .then((row) => {
        if (row.length === 0) {
          return res.status(404).json({
            error: {
              message: 'contest not found',
            },
          });
        }
      });
    ParticipantsService.getParticipants(knexInstance, contest)
      .then((participants) => {
        res.status(200).json(participants.map(serializeParticipants));
      })
      .catch(next);
  });

participantsRouter
  .route('/contest/:participant_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const participantId = req.params.participant_id;
    ParticipantsService.getParticipantById(knexInstance, participantId)
      .then((participant) => {
        if (participant.length === 0) {
          return res.status(404).json({
            error: {
              message: 'participant not found',
            },
          });
        }
        res.status(200).json(participant.map(serializeParticipants));
      })
      .catch(next);
  });

participantsRouter
  .route('/new/:contest_id')
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const email = req.body.email_address;
    const contest = req.params.contest_id;

    // search contest to make sure email is unique
    ParticipantsService.checkDuplicateEmail(knexInstance, email, contest)
      .then((row) => {
        if (row.length > 0) {
          return res.status(400).json({
            error: {
              message: 'this user has already entered this contest',
            },
          });
        }
        // create new participant
        const newParticipant = {
          referrer_id: req.body.referrer_id,
          contest_id: contest,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email_address: req.body.email_address,
          number_of_referrals: 0,
          number_of_entries: 1,
        };
        ParticipantsService.insertParticipant(knexInstance, newParticipant)
          .then((createdParticipant) => {
            if (!createdParticipant) {
              res.status(400).json({
                error: {
                  message: 'participant could not be created',
                },
              });
            }
            res.status(200).json(serializeParticipants(createdParticipant));

            // increase entries/referrals where needed if referrer exists
            if (createdParticipant.referrer_id) {
              const referrer = createdParticipant.referrer_id;
              const referralAmount = 1;
              const rewardAmount = 10;
              ParticipantsService.rewardReferrer(knexInstance, referrer, referralAmount, rewardAmount);
            }
          })
          .catch(next);
      });
  });

module.exports = participantsRouter;
