const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ['university', 'college', 'school'], default: 'university' },
    maxStudents: { type: Number, required: true, default: 100 },
    currentStudentCount: { type: Number, default: 0 },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

universitySchema.virtual('isFull').get(function () {
  return this.currentStudentCount >= this.maxStudents;
});

module.exports = mongoose.model('University', universitySchema);
