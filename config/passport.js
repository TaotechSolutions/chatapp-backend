const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const UserServices = require("../services/UserServices");
// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Email not provided by provider"));

        const profileData = {
          // Optional fields to store
          emailVerified: profile.emails?.[0]?.verified || true,
        };

        const user = await UserServices.findOrCreateUser(email, profileData);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (_accessToken, __, profile, done) => {
      try {
        let email = profile.emails?.[0]?.value;

        // fallback: fetch verified primary email if missing
        if (!email) {
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `token ${_accessToken}`,
              Accept: "application/vnd.github+json",
              "User-Agent": "your-app-name",
            },
          });
          const emails = await response.json();
          const primaryEmail = emails.find(e => e.primary && e.verified);
          if (primaryEmail) email = primaryEmail.email;
        }

        if (!email) return done(new Error("Email not found or not verified"));

        const profileData = {
          githubUsername: profile.username,
          emailVerified: true,
        };

        const user = await UserServices.findOrCreateUser(email, profileData, "github");
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserServices.findUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
