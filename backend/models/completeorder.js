const mongoose = require('mongoose');

const completedOrderSchema = new mongoose.Schema({
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompletedOrder', completedOrderSchema);
