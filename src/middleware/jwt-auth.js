const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({
      error: {
        message: 'missing bearer token',
      },
    });
  }
  const bearerToken = authToken.slice(7, authToken.length);

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    AuthService.getUser(req.app.get('db'), payload.sub)
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            error: {
              message: 'unauthorized request',
            },
          });
        }
        req.user_id = user.id;
        next();
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  } catch (error) {
    res.status(401).json({
      error: {
        message: 'unauthorized request',
      },
    });
  }
}

module.exports = requireAuth;