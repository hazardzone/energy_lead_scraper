import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'converted'],
    default: 'new'
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
