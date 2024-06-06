import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [buyerQty, setBuyerQty] = useState('');
    const [buyerPrice, setBuyerPrice] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const pendingRes = await axios.get('http://localhost:5000/pending_orders');
            const completedRes = await axios.get('http://localhost:5000/completed_orders');
            setPendingOrders(pendingRes.data);
            setCompletedOrders(completedRes.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/place_order', {
                buyerQty: Number(buyerQty),
                buyerPrice: Number(buyerPrice)
            });
            fetchOrders();
            setBuyerQty('');
            setBuyerPrice('');
        } catch (error) {
            console.error('Error placing order:', error);
        }
        setLoading(false);
    };

    return (
        <div className="App">
            <h1>Stock Exchange</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    value={buyerQty}
                    onChange={(e) => setBuyerQty(e.target.value)}
                    placeholder="Buyer Quantity"
                    required
                />
                <input
                    type="number"
                    value={buyerPrice}
                    onChange={(e) => setBuyerPrice(e.target.value)}
                    placeholder="Buyer Price"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                </button>
            </form>
            <h2>Pending Orders</h2>
            <ul>
                {pendingOrders.map(order => (
                    <li key={order._id}>
                        Buyer Qty: {order.buyerQty}, Buyer Price: {order.buyerPrice}, Seller Price: {order.sellerPrice}, Seller Qty: {order.sellerQty}
                    </li>
                ))}
            </ul>
            <h2>Completed Orders</h2>
            <ul>
                {completedOrders.map(order => (
                    <li key={order._id}>
                        Price: {order.price}, Quantity: {order.qty}, Completed At: {new Date(order.completedAt).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
