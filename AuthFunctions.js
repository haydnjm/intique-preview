/*
*
* Authentication functions to test access points,
* create access points, and create users
* location: services\auth
*
*/

const Mailchimp = require('mailchimp-api-v3');
let mailchimp;
require('../../config/keys')(((keys) => mailchimp = new Mailchimp(keys.MAILCHIMP_KEY)), 'email');
const mongoose = require('mongoose');
const AccessPoint = mongoose.model('access_points');
const PasswordResets = mongoose.model('passwordResets');
const User = mongoose.model('users');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { LISTS, TAGS } = require('../constants/mailchimp');
const {
  WelcomeEmail,
  PasswordResetEmail,
  PasswordResetNonUserEmail
} = require('../email/TransactionalEmails');

/**
 * Tests access point
 */
exports.testAccessPoint = async (accessType, id, pass = null) => {

  const accessPoint = await AccessPoint
    .findOne({
      access_type: accessType,
      access_id: id,
      access_pass: pass,
    });

  if (accessPoint) {
    const user = await User.findById(accessPoint._user);
    return user;
  }

  return null;
};

/**
 * Create new user and access point related to user
 */
exports.createNewUser = async (
  firstName,
  lastName,
  email,
  loginType,
  accessId,
  accessPass = null,
  howDidYouHear = null,
  marketing
) => {

  const hash = accessPass ? bcrypt.hashSync(accessPass, 10) : null;

  const user = await new User({
    firstName: _.trim(firstName),
    lastName: _.trim(lastName),
    email: _.trim(email),
    loginTypes: [loginType],
    dateAdded: Date.now(),
    howDidYouHear: howDidYouHear ? howDidYouHear.value : null,
    marketing: marketing
  }).save();

  await new AccessPoint({
    _user: user._id,
    access_type: loginType,
    access_id: accessId,
    access_pass: hash,
    dateCreated: Date.now(),
  }).save();

  WelcomeEmail(user);

  return user;
};

/**
* Sign user up using email and password
*/
exports.signup = (req, res, next, reject) => {

  const { firstName, secondName, password, confirmPassword, marketing, howDidYouHear } = req.body;
  const email = req.body.email.toLowerCase();

  if (password !== confirmPassword) {
    req.status(412).send(`Passwords didn't match!`);
    next();
  }

  AccessPoint.findOne({ access_id: email }, (err, existingAccessPoint) => {
    if (err) return next(err);

    if (existingAccessPoint) {
      return res.status(422).send('We already have someone registered with that email!');
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('adding to mailchimp: ', email);
      mailchimp.post({
        path: `lists/${LISTS.intique_community}/members`,
        body: {
          status: marketing ? 'subscribed' : 'unsubscribed',
          email_address: email,
          merge_fields: {
            FNAME: firstName,
            LNAME: secondName,
          },
          tags: [TAGS.GENERAL]
        }
      });
    } else {
      console.log('dev env - no mailchimp');
    }

    exports.createNewUser(
      firstName,
      secondName,
      email,
      'local',
      email,
      password,
      howDidYouHear,
      marketing
    )
      .then(() => next())
      .catch((e) => {
        console.log(e);
        res.status(422).send(
          'Sorry, there was a problem saving your details, please try again later'
        );
        reject && reject();
      });
  });
};

/*
*
* // NOTE: Create password reset token
*/
exports.passwordResetEmail = async (req, res) => {

  const accessPoint = await AccessPoint.findOne({
    access_type: 'local',
    access_id: req.body.email,
  }).populate('_user');

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  if (accessPoint) {

    const token = uuidv4();

    PasswordResets.create({
      email: req.body.email,
      dateCreated: Date.now(),
      token: token,
    }).then(() => {
      PasswordResetEmail({
        firstName: accessPoint._user.firstName,
        token: token,
        email: req.body.email
      });
      res.send(`We have emailed ${req.body.email}. Check the email for the next steps!`);
    });

  } else {
    PasswordResetNonUserEmail({
      email: req.body.email,
    });
    res.send(`We have emailed ${req.body.email}. Check the email for the next steps!`);
  }


};

/*
*
* // NOTE: Verify password reset token
*/
exports.verifyPasswordResetToken = async (req, res) => {

  const { token } = req.body;

  const cutoff = new Date(Date.now() - (30 * 60 * 1000)); // Half an hour

  const resetDoc = await PasswordResets.findOne({
    token: token.replace(/#/g, ''),
    active: true,
    dateCreated: { $gt: cutoff },
  });

  if (resetDoc) res.send({ user: true });
  else res.send({ user: false });
};

/*
* Reset password
*/
exports.resetPassword = async (req, res) => {

  if (req.body.newPassword && req.body.newPassword.length < 8) {
    res.status(422).send({
      message: 'Your password must be at least 8 characters.'
    });
    return;
  }

  if (req.body.newPassword && !req.body.newPassword.match(/\d/g)) {
    res.status(422).send({
      message: 'Your password must have at least 1 number in it'
    });
    return;
  }

  if (req.body.newPassword !== req.body.passwordConfirmation) {
    res.status(422).send({
      message: 'Passwords must match!'
    });
    return;
  }

  const cutoff = new Date(Date.now() - (30 * 60 * 1000));

  const resetDoc = await PasswordResets.findOneAndUpdate(
    {
      token: req.body.token.replace(/#/g, ''),
      email: req.body.email,
      dateCreated: { $gt: cutoff }
    },
    { active: false }
  );

  if (!resetDoc) {
    res.status(422).send({
      message: 'We were unable to change your password. Enter your email below to get another reset email.'
    });
  } else {

    const hash = bcrypt.hashSync(req.body.newPassword, 10);
    AccessPoint.findOneAndUpdate(
      {
        access_type: 'local',
        access_id: resetDoc.email,
      },
      {
        access_pass: hash
      }
    ).exec();
    res.send('You password has been reset!');
  }
};
