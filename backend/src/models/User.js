const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    skills: [{ type: String, trim: true }],
    role: { type: String, enum: ['student', 'mentor', 'judge', 'admin'], default: 'student' },
    isActive: { type: Boolean, default: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', default: null },
    meritScore: { type: Number, default: 0, index: true },
    meritBreakdown: {
      projectCompletions: { type: Number, default: 0 },
      tasksCompleted: { type: Number, default: 0 },
      hackathonWins: { type: Number, default: 0 },
      hackathonParticipations: { type: Number, default: 0 },
    },
    googleId: { type: String, unique: true, sparse: true },
    waitlistStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
