const Package = require('../model/packages.model');
const Delivery = require('../../delivery/model/delivery.model');
const NodeGeocoder = require('node-geocoder');

        const geocoder = NodeGeocoder({
            provider: 'opencage',
            apiKey: process.env.GOOGLE_API_KEY
        });
        
exports.createPackage = async (req, res, next) => {
    try {
        const { packageName, description, weight, width, height, depth, from_name, from_address, to_name, to_address } = req.body;

        const fromLocation = await geocoder.geocode(from_address);
        if (!fromLocation.length) {
            return res.status(200).json({
                success: false,
                message: 'Invalid from_address provided',
                error: `Geocoding failed for from_address: ${from_address}`
            });
        }

        const toLocation = await geocoder.geocode(to_address);
        if (!toLocation.length) {
            return res.status(200).json({
                success: false,
                message: 'Invalid to_address provided',
                error: `Geocoding failed for to_address: ${to_address}`
            });
        }
        const from_location = {
            lat: fromLocation[0].latitude,
            lng: fromLocation[0].longitude
        };

        const to_location = {
            lat: toLocation[0].latitude,
            lng: toLocation[0].longitude
        };

        const newPackage = await Package.create({
            packageName,
            description,
            weight,
            width,
            height,
            depth,
            from_name,
            from_address,
            from_location,
            to_name,
            to_address,
            to_location
        });

        return res.status(201).json({
            success: true,
            message: 'Package created successfully',
            data: newPackage
        });
    } catch (error) {
        next(error);
        }
};

exports.getAllPackages = async (req, res, next) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: 'All packages retrieved successfully',
            data: packages
        });
    } catch (error) {
        next(error);
    }
};

exports.getPackageById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const packageData = await Package.findOne({ package_id: id });

        if (!packageData) {
            return res.status(404).json({
                success: false,
                message: 'Package not found',
                error: `Package with id: ${id} not found`
            });
        }

        const activeDeliveries = await Delivery.findOne({ package_id: packageData._id });

        if (!activeDeliveries) {
            return res.status(200).json({
                success: true,
                message: 'No active deliveries found for this package',
                data: packageData,
            });
        }

        const statusMessages = {
            'delivered': 'Package already delivered',
            'cancelled': 'Package already cancelled',
            'failed': 'Package delivery failed to delivered',
            'in-transit': 'Package already in transit',
            'Open': 'Package will be delivered soon'
        };

        const message = statusMessages[activeDeliveries.status] || 'Package retrieved successfully';
        const success = activeDeliveries.status !== 'cancelled';

        return res.status(200).json({
            success: success,
            message: message,
            data: packageData,
            DeliveryDetails: activeDeliveries
        });
    } catch (error) {
        next(error);
    }
};


exports.updatePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { from_address, to_address, packageName, description, weight, width, height, depth, from_name, } = req.body;

        const updateData = req.body;

        if (from_address) {
            const fromLocation = await geocoder.geocode(from_address);
            if (!fromLocation.length) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid from_address provided',
                    error: `Geocoding failed for from_address: ${from_address}`
                });
            }

            updateData.from_location = {
                lat: fromLocation[0].latitude,
                lng: fromLocation[0].longitude
            };
        }

        if (to_address) {
            const toLocation = await geocoder.geocode(to_address);
            if (!toLocation.length) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid to_address provided',
                    error: `Geocoding failed for to_address: ${to_address}`
                });
            }

            updateData.to_location = {
                lat: toLocation[0].latitude,
                lng: toLocation[0].longitude
            };
        }

        const updatedPackage = await Package.findOneAndUpdate({ delivery_id:id }, updateData, { new: true });

        if (!updatedPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Package updated successfully',
            data: updatedPackage
        });
    } catch (error) {
        next(error);
    }
};


exports.deletePackage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedPackage = await Package.findOneAndDelete({ package_id: id });

        if (!deletedPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Package deleted successfully',
            data: deletedPackage
        });
    } catch (error) {
        next(error);
    }
};


