const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonParser = express.json();

authRouter
  .route('/login')
  .post(jsonParser, (req, res, next) => {
    const { email_address, password } = req.body;
    const loginUser = { email_address, password };
    const knexInstance = req.app.get('db');

    for (const [value] of Object.entries(loginUser)) {
      if (value == null) {
        res.status(400).json({
          error: {
            message: 'missing username or password in request body',
          },
        });
      }
    }

    AuthService.getUser(knexInstance, loginUser.email_address)
      .then((dbUser) => {
        if (!dbUser) {
          res.status(400).json({
            error: {
              message: 'incorrect username or password',
            },
          });
        }
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then((compareMatch) => {
            if (!compareMatch) {
              res.status(400).json({
                error: {
                  message: 'incorrect username or password',
                },
              });
            }
            const sub = dbUser.email_address;
            const payload = { user_id: dbUser.id };
            return res.send({
              authToken: AuthService.createJwt(sub, payload),
            });
          });
      })
      .catch(next);
  });

module.exports = authRouter;
