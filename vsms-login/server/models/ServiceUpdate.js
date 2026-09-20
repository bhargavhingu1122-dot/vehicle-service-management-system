const mongoose = require('mongoose');

const ServiceUpdateSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true
    },
    statusLabel: {
        type: String,
        required: true // e.g., Vehicle Received
    },
    description: {
        type: String,
        required: true // e.g., Your Tesla is now in the bay.
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ServiceUpdate', ServiceUpdateSchema);
