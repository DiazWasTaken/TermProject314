const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Replace with your actual Google client ID and secret
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

// Configure the GoogleStrategy for Passport.js
passport.use(new GoogleStrategy({
  clientID: 496285652496-g3gr2choo6q32fff78eh3pk1kouub5pc.apps.googleusercontent.com,
  clientSecret: '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',
  callbackURL: 'https://termproject314.onrender.com/oauth2/callback',
  scope: ['profile', 'email'] // Request user profile and email information
}, (accessToken, refreshToken, profile, done) => {
  // Find or create the user in your database based on their Google profile ID
  User.findOne({ googleId: profile.id }) // Replace 'User' with your user model name
    .then(existingUser => {
      if (existingUser) {
        // User already exists, log them in
        return done(null, existingUser);
      }

      // Create a new user if they don't exist
      const newUser = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value
      });

      return newUser.save()
        .then(user => done(null, user));
    })
    .catch(err => done(err, null));
}));

// Serialize and deserialize user objects for session management (if using sessions)
passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in the session
});

passport.deserializeUser((id, done) => {
  User.findById(id) // Replace 'User' with your user model name
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

module.exports = passport;
