const Delivery = require('../model/delivery.model');
const Package = require('../../packages/model/packages.model');
const NodeGeocoder = require('node-geocoder');

        const geocoder = NodeGeocoder({
            provider: 'opencage',
            apiKey: process.env.GOOGLE_API_KEY
        });
exports.createDelivery = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {  location, status } = req.body;

        const packageDetails = await Package.findById(id);
        if (!packageDetails) {
            return res.status(404).json({
                success: false,
                message: 'Package not found',
                error: `Package with id: ${id} not found`
            });
        }

        const Location = await geocoder.geocode(location);
        if (!Location.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid from_address provided',
                error: `Geocoding failed for from_address: ${location}`
            });
        }

        const deliveryLocation = {
            lat: Location[0].latitude,
            lng: Location[0].longitude
        };

        const newDelivery = await Delivery.create({
            name: packageDetails.packageName,
            package_id: packageDetails._id,
            location: deliveryLocation,
            status
        });

        return res.status(201).json({
            success: true,
            message: 'Delivery created successfully',
            data: newDelivery
        });
    } catch (error) {
       next(error);
    }
};

exports.updateDelivery = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { location, status } = req.body;
        const deliveryDetails = await Delivery.findById(id);

        const Location = await geocoder.geocode(location);
        if (!Location.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid from_address provided',
                error: `Geocoding failed for from_address: ${location}`
            });
        }
        const deliveryLocation = {
            lat: Location[0].latitude,
            lng: Location[0].longitude
        };

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            {
                location: deliveryLocation,
                status
            },
            {
                new: true
            }
        );
        if (!updatedDelivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found',
                error: `Delivery with id: ${id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Delivery updated successfully',
            data: updatedDelivery
        });
    }catch (error) {
        next(error);
    }
}

exports.getDeliveryById = async (req, res, next) =>{
    try {
        const { id } = req.params;
        const delivery = await Delivery.findOne({delivery_id: id})
        .populate('package_id', 'packageName from_name from_address');
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found',
                error: `Delivery with id: ${id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Delivery found',
            data: delivery
        });
    } catch (error) {
        next(error);
    }
};


exports.getAllDeliveries = async (req, res, next) => {
    try {
        const deliveries = await Delivery.find({ }).sort({ createdAt: -1 });
        if (!deliveries.length) {
            return res.status(404).json({
                success: false,
                message: 'No deliveries found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Deliveries found',
            data: deliveries
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteDelivery = async (req, res, next) => {
    try {
        const { id } = req.params;
        const delivery = await Delivery.findByIdAndDelete(id);
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found',
                error: `Delivery with id: ${id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Delivery deleted successfully',
            data: delivery
        });
    } catch (error) {
        next(error);
    }
};