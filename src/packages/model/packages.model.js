const mongoose = require("mongoose");
const referralCodeGenerator = require('referral-code-generator');


const packageSchema = new mongoose.Schema({
    packageName: {
        type: String,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    package_id: {
        type: String,
        required: true,
        default: referralCodeGenerator.custom('lowercase', 10, 7, 'Gozem-packages'),
    },
    active_delivery_id: {
        type: String,
        default: referralCodeGenerator.custom('lowercase', 10, 7, 'Gozem-actdelivery'),
    },
    description: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
        default: 0
    },
    width: {
        type: String,
        required: true
    },
    height: {
        type: String,
        required: true
    },
    depth: {
        type: String,
        required: true
    },
    from_name: {
        type: String,
        required: true
    },
    from_address: {
        type: String,
        required: true
    },
    from_location: {
        lat: {
            type: Number,
        },
        lng: {
            type: Number,
        }
    },
    to_name: {
        type: String,
    },
    to_address: {
        type: String,
    },
    to_location: {
        lat: {
            type: Number,
        },
        lng: {
            type: Number,
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Package", packageSchema);