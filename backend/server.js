const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;
const Mongo_URL="mongodb+srv://user:Qp2d9keN35D4D8KJ@cluster0.run8hu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(Mongo_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Models
const PendingOrder = require('./models/pandingorder.js');
const CompletedOrder = require('./models/completeorder.js');

// Routes
app.post('/place_order', async (req, res) => {
    const { buyerQty, buyerPrice } = req.body;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const matchingOrders = await PendingOrder.find({ sellerPrice: { $lte: buyerPrice } }).sort('sellerPrice').session(session);

        let remainingQty = buyerQty;

        for (let order of matchingOrders) {
            if (remainingQty <= 0) break;

            const matchQty = Math.min(order.sellerQty, remainingQty);
            const completedOrder = new CompletedOrder({ price: order.sellerPrice, qty: matchQty });
            await completedOrder.save({ session });

            order.sellerQty -= matchQty;
            remainingQty -= matchQty;

            if (order.sellerQty === 0) {
                await PendingOrder.deleteOne({ _id: order._id }, { session });
            } else {
                await order.save({ session });
            }
        }

        if (remainingQty > 0) {
            const newOrder = new PendingOrder({ buyerQty: remainingQty, buyerPrice, sellerPrice: 0, sellerQty: 0 });
            await newOrder.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error });
    }
});

app.get('/pending_orders', async (req, res) => {
    try {
        const pendingOrders = await PendingOrder.find();
        res.json(pendingOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending orders', error });
    }
});

app.get('/completed_orders', async (req, res) => {
    try {
        const completedOrders = await CompletedOrder.find();
        res.json(completedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching completed orders', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
