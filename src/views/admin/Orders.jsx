import React, { useState, useContext } from "react";
import {
  fetchOrdersByDateRange,
  calculateHighestProfit,
} from "../../controllers/adminController.ts";
import { AuthContext } from "../../models/contexts/AuthContext"; // Ajusta la ruta según tu estructura de proyecto
import "../../styles/orders.css"; // Asegúrate de crear este archivo CSS

const Orders = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [highestProfitOrder, setHighestProfitOrder] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const handleFetchOrders = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    try {
      const orders = await fetchOrdersByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      setOrders(orders);
      const highestProfit = calculateHighestProfit(orders);
      setHighestProfitOrder(highestProfit[0]); // Obtener la orden con el mayor profit
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="orders-container">
      <h1>Orders</h1>
      <div>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={handleFetchOrders}>Fetch Orders</button>
      </div>
      {error && <p className="error">{error}</p>}
      {highestProfitOrder && (
        <div className="highest-profit-order">
          <h2>Highest Profit Order</h2>
          <p>Order ID: {highestProfitOrder.orderId}</p>
          <p>Profit: ${highestProfitOrder.profit.toFixed(2)}</p>
          <p>Total Items: {highestProfitOrder.totalItems}</p>
          <p>Total Amount: ${highestProfitOrder.totalAmount.toFixed(2)}</p>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Product Price</th>
                <th>Product Supplier</th>
              </tr>
            </thead>
            <tbody>
              {highestProfitOrder.details.map((detail) => (
                <tr key={detail.id}>
                  <td>{detail.productName}</td>
                  <td>${detail.productPrice.toFixed(2)}</td>
                  <td>{detail.productSupplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
