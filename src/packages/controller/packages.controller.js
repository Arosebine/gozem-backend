const Package = require('../model/packages.model');
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
            return res.status(400).json({
                success: false,
                message: 'Invalid from_address provided',
                error: `Geocoding failed for from_address: ${from_address}`
            });
        }

        const toLocation = await geocoder.geocode(to_address);
        if (!toLocation.length) {
            return res.status(400).json({
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
        const packages = await Package.find();
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
        const package = await Package.findById(id);
        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Package not found',
                error: `Package with id: ${id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Package retrieved successfully',
            data: package
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { from_address, to_address } = req.body;

        const updateData = req.body;

        if (from_address) {
            const fromLocation = await geocoder.geocode(from_address);
            if (!fromLocation.length) {
                return res.status(400).json({
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
                return res.status(400).json({
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

        const updatedPackage = await Package.findByIdAndUpdate(id, updateData, { new: true });

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

        const deletedPackage = await Package.findByIdAndDelete(id);

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