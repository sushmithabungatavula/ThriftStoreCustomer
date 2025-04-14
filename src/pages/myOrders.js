import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Styles for the component
const styles = {
  container: {
    margin: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '20px',
    borderBottom: '2px solid #ddd',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#555',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s',
  },
  activeTab: {
    borderBottom: '3px solid #007bff',
    color: '#007bff',
  },
  orderCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  orderInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    color: '#555',
  },
  orderStatus: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  itemList: {
    listStyleType: 'none',
    padding: '0',
  },
  itemCard: {
    borderBottom: '1px solid #f1f1f1',
    padding: '10px 0',
  },
  itemTitle: {
    fontSize: '1.2rem',
    fontWeight: '500',
    color: '#333',
  },
  itemDetails: {
    fontSize: '0.9rem',
    color: '#777',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  cartItemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '15px',
  },
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [itemDetails, setItemDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, completed, cancelled
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const customer_id = localStorage.getItem('customerId');
    if (!customer_id) {
      alert('Customer ID not found');
      return;
    }

    try {
      const response = await axios.get(`https://thriftstorebackend-8xii.onrender.com/api/orders/${customer_id}`);
      const groupedOrders = response.data;

      if (typeof groupedOrders === 'object') {
        const ordersArray = Object.values(groupedOrders);
        setOrders(ordersArray);
        fetchItemDetails(ordersArray);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemDetails = async (ordersArray) => {
    const itemIds = [];
    ordersArray.forEach((order) => {
      order.forEach((item) => {
        if (!itemIds.includes(item.item_id)) {
          itemIds.push(item.item_id);
        }
      });
    });

    try {
      const details = await Promise.all(
        itemIds.map((id) =>
          axios.get(`https://thriftstorebackend-8xii.onrender.com/api/item/${id}`).then((res) => res.data)
        )
      );

      const itemDetailsMap = details.reduce((acc, detail) => {
        acc[detail.item_id] = detail;
        return acc;
      }, {});
      setItemDetails(itemDetailsMap);
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    if (!orders || orders.length === 0) return [];

    return orders.filter((orderGroup) => {
      const status = orderGroup[0].order_status.toLowerCase();

      if (activeTab === 'active') {
        return status === 'placed' || status === 'shipped';
      } else if (activeTab === 'completed') {
        return status === 'delivered';
      } else if (activeTab === 'cancelled') {
        return status === 'cancelled' || status === 'approve_cancel';
      }
      return false;
    });
  };

  const renderTab = (label, value) => (
    <div
      onClick={() => setActiveTab(value)}
      style={{
        ...styles.tab,
        ...(activeTab === value ? styles.activeTab : {}),
      }}
    >
      {label}
    </div>
  );

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Loading Your Orders...</h1>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Orders</h1>

      <div style={styles.tabs}>
        {renderTab('Active Orders', 'active')}
        {renderTab('Completed Orders', 'completed')}
        {renderTab('Cancelled Orders', 'cancelled')}
      </div>

      {filteredOrders.length === 0 ? (
        <p style={{ color: '#777' }}>No {activeTab} orders found.</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order[0].order_id} style={styles.orderCard}>
            <div style={styles.orderInfo}>
              <div>
                <strong>Order ID:</strong> {order[0].order_id}
              </div>
              <div
                style={{
                  ...styles.orderStatus,
                  color:
                    order[0].order_status === 'delivered'
                      ? '#28a745'
                      : ['cancelled', 'approve_cancel'].includes(order[0].order_status)
                      ? '#dc3545'
                      : '#ffc107',
                }}
              >
                <strong>Status:</strong> {order[0].order_status}
              </div>

            </div>

            <div style={styles.itemList}>
              {order.map((item) => {
                const itemDetail = itemDetails[item.item_id];
                return (
                  <div key={item.item_id} style={styles.itemCard}>
                    <div style={styles.itemTitle}>{item.item_name}</div>
                    <img
                      src={itemDetail?.imageURL || 'path/to/default-image.jpg'}
                      alt={itemDetail?.item_name || 'Item Image'}
                      style={styles.cartItemImage}
                    />
                    <div style={styles.itemDetails}>
                      <span>Quantity: {item.item_quantity}</span> |{' '}
                      <span>Price: ${parseFloat(item.item_price).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <button
                style={styles.button}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = styles.button.backgroundColor)
                }
                onClick={() => navigate('/orderDetails', { state: { order } })}
              >
                View Order Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
