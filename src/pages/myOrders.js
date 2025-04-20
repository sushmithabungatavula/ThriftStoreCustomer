// MyOrders styled with login page UI theme
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  background: '#ffffff',
  text: '#1e1e1e',
  border: '#cccccc',
  primary: '#000000',
  primaryHover: '#333333',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const styles = {
  container: {
    margin: '30px auto',
    padding: '20px',
    maxWidth: '1000px',
    backgroundColor: COLORS.background,
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: COLORS.text,
  },
  tabs: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '20px',
    borderBottom: `2px solid ${COLORS.border}`,
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: COLORS.text,
    borderBottom: '3px solid transparent',
  },
  activeTab: {
    borderBottom: `3px solid ${COLORS.primary}`,
    color: COLORS.primary,
  },
  orderCard: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: `0 4px 8px ${COLORS.shadow}`,
    backgroundColor: COLORS.background,
  },
  orderInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    fontSize: '14px',
    color: COLORS.text,
  },
  orderStatus: {
    fontWeight: 'bold',
  },
  itemList: {
    listStyleType: 'none',
    padding: '0',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '10px 0',
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.text,
  },
  itemDetails: {
    fontSize: '14px',
    color: '#555',
  },
  button: {
    backgroundColor: COLORS.primary,
    color: COLORS.buttonText || '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  cartItemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [itemDetails, setItemDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const customer_id = localStorage.getItem('customerId');
    if (!customer_id) {
      alert('Customer ID not found');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/ordersByCustomer/${customer_id}`);
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
          axios.get(`http://localhost:3000/api/item/${id}`).then((res) => res.data)
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
        <p style={{ color: COLORS.divider }}>No {activeTab} orders found.</p>
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
                    <img
                      src={itemDetail?.imageURL || 'path/to/default-image.jpg'}
                      alt={itemDetail?.item_name || 'Item Image'}
                      style={styles.cartItemImage}
                    />
                    <div>
                      <div style={styles.itemTitle}>{item.item_name}</div>
                      <div style={styles.itemDetails}>
                        <span>Quantity: {item.item_quantity}</span> |{' '}
                        <span>Price: ${parseFloat(item.item_price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <button
                style={styles.button}
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
