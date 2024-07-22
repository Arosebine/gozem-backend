const Delivery = require('../../src/delivery/model/delivery.model');



module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('packageUpdated', async (data) => {
      try {
        const { deliveryId, status } = data;
        const package = await Delivery.findOneAndUpdate({ delivery_id: deliveryId}, {$set: {status: status } },{ new: true });
        if (package) {
          if (package.status === 'open') {
            package.status = 'picked-up';
            package.pickup_time = Date.now();
          } else if (package.status === 'picked-up') {
            package.status = 'in-transit';
            package.start_time = Date.now();
          } else if (package.status === 'in-transit') {
            package.status = 'delivered';
            package.end_time = Date.now();
          } else if (package.status === 'delivered') {
            package.end_time = Date.now();
          } else if (package.status === 'failed') {
            package.status = 'open';
            package.start_time = Date.now();
          }
          await package.save();
          
          io.emit('packageUpdated', package);
        } else {
          console.log(`Package with name ${packageName} not found`);
        }
      } catch (error) {
        console.error(`Error updating package: ${error.message}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
