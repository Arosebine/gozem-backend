const Delivery = require('../../src/delivery/model/delivery.model');
const NodeGeocoder = require('node-geocoder');
const geocoder = NodeGeocoder({
    provider: 'opencage',
    apiKey: process.env.GOOGLE_API_KEY
});

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('status_changed', async (data) => {
      try {
        const { deliveryId, status } = data;

        const delivery = await Delivery.findOneAndUpdate(
          { delivery_id: deliveryId },
          { $set: { status: status } },
          { new: true }
        );

        if (delivery) {
          switch (delivery.status) {
            case 'open':
              delivery.status = 'picked-up';
              delivery.pickup_time = Date.now();
              break;
            case 'picked-up':
              delivery.status = 'in-transit';
              delivery.start_time = Date.now();
              break;
            case 'in-transit':
              delivery.status = 'delivered';
              delivery.end_time = Date.now();
              break;
            case 'delivered':
              delivery.end_time = Date.now();
              break;
            case 'failed':
              delivery.status = 'open';
              delivery.start_time = Date.now();
              break;
            default:
              console.log(`Unknown status: ${delivery.status}`);
              break;
          }

          await delivery.save();
          io.emit('status_changed', delivery);
        } else {
          console.log(`Delivery with ID ${deliveryId} not found`);
        }
      } catch (error) {
        console.error(`Error updating delivery status: ${error.message}`);
        socket.emit('error', {
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};




module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('location_changed', async (data) => {
      try {
        const { deliveryId, location } = data;

        const Location = await geocoder.geocode(location);
        if (!Location.length) {
            socket.emit('error', {
                success: false,
                message: 'Invalid location provided',
                error: `Geocoding failed for location: ${location}`
            });
            return;
        }

        const deliveryLocation = {
            lat: Location[0].latitude,
            lng: Location[0].longitude
        };
        console.log(deliveryLocation);

        const delivery = await Delivery.findOneAndUpdate(
          { delivery_id: deliveryId },
          { location: deliveryLocation },
          { new: true }
        );

        if (delivery) {
          switch (delivery.status) {
            case 'open':
              delivery.status = 'picked-up';
              delivery.pickup_time = Date.now();
              break;
            case 'picked-up':
              delivery.status = 'in-transit';
              delivery.start_time = Date.now();
              break;
            case 'in-transit':
              delivery.status = 'delivered';
              delivery.end_time = Date.now();
              break;
            case 'delivered':
              delivery.end_time = Date.now();
              break;
            case 'failed':
              delivery.status = 'open';
              delivery.start_time = Date.now();
              break;
            default:
              console.log(`Unknown status: ${delivery.status}`);
              break;
          }
          await delivery.save();
          io.emit('location_changed', delivery);
        } else {
          console.log(`Delivery with ID ${deliveryId} not found`);
        }
      } catch (error) {
        console.error(`Error updating delivery location: ${error.message}`);
        socket.emit('error', {
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    });
  });
};
