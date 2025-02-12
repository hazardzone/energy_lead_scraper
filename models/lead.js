import mongoose from 'mongoose';
import crypto from 'crypto';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    set: function(phone) {
      // Hash phone numbers for GDPR compliance
      return crypto.createHash('sha256').update(phone).digest('hex');
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['uncontacted', 'contacted', 'qualified', 'rejected'],
    default: 'uncontacted'
  },
  source: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);