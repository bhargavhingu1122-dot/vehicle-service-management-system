const mongoose = require('mongoose');

const MechanicSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    specialization: { type: [String], default: [] },
    experience: { type: String, default: '' },
    role: { type: String, default: 'Mechanic' },
    createdAt: { type: Date, default: Date.now }
});

// Use existing model if already compiled to avoid schema caching issues
module.exports = mongoose.models.Mechanic || mongoose.model('Mechanic', MechanicSchema);
