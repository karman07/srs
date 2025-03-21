import React, { useEffect, useState } from 'react';
import TextTransition, { presets } from 'react-text-transition';
import { useData } from '../context/DataContext';
import { Order } from '../types/types';
import './OrderPage.css';

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { menuItems } = useData();
  const [index, setIndex] = useState(0);

  const titles = ["📦 Your Orders", "🚀 Fast & Fresh", "🍽️ Bon Appétit"];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % titles.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadOrders = () => {
      const storedOrders: Order[] = [];
      const orderKeys = Object.keys(localStorage).filter((key) => !isNaN(Number(key)));

      orderKeys.forEach((key) => {
        const orderData = localStorage.getItem(key);
        if (orderData) {
          storedOrders.push(JSON.parse(orderData));
        }
      });

      setOrders(storedOrders);
    };

    loadOrders();
  }, []);

  return (
    <div className="container mt-5 py-5">
      <h2 className="page-title text-center fade-in">
        <TextTransition springConfig={presets.wobbly}>{titles[index]}</TextTransition>
      </h2>
      
      {orders.length === 0 ? (
        <div className="alert alert-danger fade-in text-center">🚫 No orders found</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-3">
          {orders.map((order) => (
            <div key={order._id} className="col fade-in">
              <div className="card order-card shadow-lg">
                <div className="card-body">
                  <h5 className="card-title text-danger">Order for {order.customerName}</h5>
                  <p className="card-text"><strong>Email:</strong> {order.customerEmail || 'N/A'}</p>
                  <p className="card-text"><strong>Phone:</strong> {order.customerNumber}</p>
                  <p className="card-text"><strong>Table:</strong> {order.table}</p>
                  <p className="card-text"><strong>Total Price:</strong> ₹{order.totalPrice}</p>
                  <p className="card-text">
                    <strong>Status:</strong>{' '}
                    <span className={`badge status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </p>
                  <p className="card-text"><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</p>

                  {/* Order Items */}
                  <h6 className="mt-3">🛒 Ordered Items:</h6>
                  <div className="order-items">
                    {(() => {
                      try {
                        const details =
                          typeof order.menuItems === 'string'
                            ? JSON.parse(order.menuItems)
                            : order.menuItems || [];

                        return details.map((detail: any) => {
                          const item = menuItems.find((i) => i._id === detail.menuItemId);
                          return item ? (
                            <div key={detail.menuItemId} className="order-item">
                              <img src={item.imageUrl} alt={item.name} className="order-item-image" />
                              <div className="order-item-info">
                                <p className="order-item-name">{item.name}</p>
                                <p>Quantity: {detail.quantity}</p>
                                <p>Price: ₹{item.price}</p>
                              </div>
                            </div>
                          ) : (
                            <p key={detail.menuItemId} className="text-danger">
                              ❌ Item not found: {detail.menuItemId}
                            </p>
                          );
                        });
                      } catch (error) {
                        console.error('Error parsing order details:', error);
                        return <p className="text-danger">Error loading items.</p>;
                      }
                    })()}
                  </div>

                  <small className="text-muted">{new Date(order.orderDate).toLocaleString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
