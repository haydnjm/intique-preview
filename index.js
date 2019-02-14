/*
*
* Server root
*
*/

const withKeys = function (keys) {

  console.log('===NEW BUILD===', new Date(Date.now()));
  console.log('NODE ENVIRONMENT: ', process.env.NODE_ENV);

  const express = require('express');
  const mongoose = require('mongoose');
  const passport = require('passport');
  const cookieSession = require('cookie-session');
  const bodyParser = require('body-parser');
  const helmet = require('helmet');

  require('./models/User');
  require('./models/Seller');
  require('./models/Product');
  require('./models/Import');
  require('./models/Order');
  require('./models/AccessPoint');
  require('./models/DeliveryQuote');
  require('./models/Offer');
  require('./models/Conversation');
  require('./models/Return');
  require('./models/Search');
  require('./models/Counter');
  require('./models/TestProduct');
  require('./models/Dropdown');
  require('./models/Feedback');
  require('./models/Receipt');
  require('./models/PasswordResets');

  require('./services/auth/AuthenticationStrategies');

  const app = express();

  app.use(helmet());
  app.use(bodyParser.json());
  app.enable('trust proxy');

  app.use(
    cookieSession({
      maxAge: 7 * 24 * 60 * 60 * 1000,
      keys: [keys.COOKIE_KEY],
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  mongoose.connect(keys.MONGO_URI);

  const db = mongoose.connection;
  db.on('error', console.error.bind('connection error:'));
  db.once('open', () => {});

  require('./routes/accounts')(app);
  require('./routes/authentication')(app);
  require('./routes/notifications')(app);
  require('./routes/basket')(app);
  require('./routes/checkout')(app);
  require('./routes/email')(app);
  require('./routes/products')(app);
  require('./routes/listings')(app);
  require('./routes/boutiques')(app);
  require('./routes/utils')(app);
  require('./routes/webhooks')(app);
  require('./routes/feedback')(app);

  require('./routes/interactions/conversations')(app);
  require('./routes/interactions/deliveryQuotes')(app);
  require('./routes/interactions/offers')(app);
  require('./routes/interactions/orders')(app);
  require('./routes/interactions/returns')(app);
  require('./routes/interactions/messages')(app);

  require('./services/cron_jobs/jobs');

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {

    // Express will serve up production assets
    app.use(express.static('client/build'));

    // Express will serve up the index.html file if it doesn't recognise the route
    const path = require('path');
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT);
};

require('./config/keys')(withKeys, 'index');
