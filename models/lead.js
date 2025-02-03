import mongoose from 'mongoose';
import crypto from 'crypto';

const LeadSchema = new mongoose.Schema({
  name: String,
  phone: { type: String,
    set: (phone) => crypto.createHash('sha256').update(phone).digest('hex') },
  address: String,
  source: String,
  keywords: [String],
  status: { type: String, default: 'uncontacted' }
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);