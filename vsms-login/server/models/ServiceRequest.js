const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    mechanicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mechanic'
    },
    serviceType: {
        type: String,
        required: true // e.g. Brake Service
    },
    issueDescription: {
        type: String,
        required: true
    },
    appointmentDate: {
        type: String,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Service', 'Completed'],
        default: 'Pending'
    },
    notes: {
        type: String,
        default: ''
    },
    serviceCharges: {
        type: Number,
        default: 0
    },
    partsCost: {
        type: Number,
        default: 0
    },
    additionalCharges: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
