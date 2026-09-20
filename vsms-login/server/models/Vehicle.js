const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    name: {
        type: String,
        required: true // e.g., Tesla Model S
    },
    plate: {
        type: String,
        required: true,
        unique: true // e.g., MH-01-AB-1234
    },
    brand: {
        type: String,
        required: true // e.g., Tesla
    },
    model: {
        type: String
    },
    year: {
        type: Number
    },
    fuel: {
        type: String,
        default: 'Petrol'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
