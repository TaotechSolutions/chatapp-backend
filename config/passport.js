const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// Google Strategy
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
  },async (_, __, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error("Email not provided by provider"));
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, emailVerified: true, authProvider: "google" });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }}
));

// GitHub Strategy
passport.use(
  new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ["user:email"]
  },async (_, __, profile, done) => {

    try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error("Email not provided by provider"));
    
    let user = await User.findOne({ email });
   if (!user) {
    user = await User.create({ email, emailVerified: true, authProvider: "github" });
  }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
