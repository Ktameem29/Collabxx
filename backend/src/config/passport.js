const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const University = require('../models/University');
const Waitlist = require('../models/Waitlist');

// Skip Google OAuth setup if credentials are not configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error('No email from Google profile'));

        // Find existing user
        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

        if (user) {
          // Update googleId if missing
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // New user — check email domain against universities
        const domain = email.split('@')[1];
        const university = await University.findOne({ domain, isActive: true });

        let waitlistStatus = 'none';
        let universityId = null;
        let isActive = true;

        if (university) {
          if (university.currentStudentCount < university.maxStudents) {
            // Room available — auto-assign
            universityId = university._id;
            university.currentStudentCount += 1;
            await university.save();
            waitlistStatus = 'approved';
          } else {
            // University full — add to waitlist
            waitlistStatus = 'pending';
            isActive = false; // cannot login until approved
          }
        }

        user = await User.create({
          name: profile.displayName || email.split('@')[0],
          email,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || '',
          university: universityId,
          waitlistStatus,
          isActive,
        });

        if (waitlistStatus === 'pending') {
          await Waitlist.create({
            user: user._id,
            university: university._id,
            meritScoreAtEntry: 0,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
} // end if GOOGLE_CLIENT_ID

module.exports = passport;
