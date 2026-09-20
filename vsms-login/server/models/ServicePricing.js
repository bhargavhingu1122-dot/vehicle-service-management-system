const mongoose = require('mongoose');

const ServicePricingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String,
        default: 'ph-wrench'
    },
    itemsCount: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    }
});

module.exports = mongoose.model('ServicePricing', ServicePricingSchema);
