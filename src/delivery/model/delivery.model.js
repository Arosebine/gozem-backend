const referralCodeGenerator = require('referral-code-generator');
const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    delivery_id: {
        type: String,
        required: true,
        default: referralCodeGenerator.custom('lowercase', 10, 7, 'Gozem-delivery'),
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    pickup_time: {
        type: Date,
        required: true,
        default: Date.now,

    },
    start_time: {
        type: Date,
        default: Date.now,
    },
    end_time: {
        type: Date,
        required: true,
        default: Date.now,
    },
    location: {
        lat: {
            type: Number,
        },
        lng: {
            type: Number,
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['open', 'picked-up', 'in-transit', 'delivered', 'failed'],
        default: 'open',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Delivery', deliverySchema);
