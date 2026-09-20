const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    amount: {
        type: Number,
        required: true
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
    status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
