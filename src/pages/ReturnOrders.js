import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Reusing the same styles from MyOrders
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
  returnCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  returnInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    color: '#555',
  },
  returnStatus: {
    fontWeight: 'bold',
  },
  itemList: {
    listStyleType: 'none',
    padding: '0',
  },
  itemCard: {
    borderBottom: '1px solid #f1f1f1',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
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
    marginRight: '10px',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  itemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '15px',
  },
  reasonSection: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    margin: '10px 0',
  },
  refundInfo: {
    backgroundColor: '#e8f5e9',
    padding: '15px',
    borderRadius: '5px',
    margin: '10px 0',
  },
};

const ReturnOrders = () => {
  const [returns, setReturns] = useState([]);
  const [itemDetails, setItemDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected
  const navigate = useNavigate();

  const fetchReturns = async () => {
    const customer_id = localStorage.getItem('customerId');
    if (!customer_id) {
      alert('Customer ID not found');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/orders/returns/${customer_id}`);
      const returnRequests = response.data;

      if (Array.isArray(returnRequests)) {
        setReturns(returnRequests);
        fetchItemDetails(returnRequests);
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemDetails = async (returnRequests) => {
    const itemIds = returnRequests.map(request => request.item_id).filter((id, index, self) => self.indexOf(id) === index);

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
    fetchReturns();
  }, []);

  const getFilteredReturns = () => {
    if (!returns || returns.length === 0) return [];

    if (activeTab === 'all') {
      return returns;
    } else {
      return returns.filter(request => 
        request.status && request.status.toLowerCase() === activeTab.toLowerCase()
      );
    }
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffc107'; // yellow
      case 'approved':
        return '#28a745'; // green
      case 'rejected':
        return '#dc3545'; // red
      default:
        return '#6c757d'; // gray
    }
  };

  const filteredReturns = getFilteredReturns();

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Loading Your Return Requests...</h1>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Return Requests</h1>

      <div style={styles.tabs}>
        {renderTab('All Returns', 'all')}
        {renderTab('Pending', 'pending')}
        {renderTab('Approved', 'approved')}
        {renderTab('Rejected', 'rejected')}
      </div>

      {filteredReturns.length === 0 ? (
        <p style={{ color: '#777' }}>No {activeTab === 'all' ? '' : activeTab} return requests found.</p>
      ) : (
        filteredReturns.map((returnRequest) => {
          const itemDetail = itemDetails[returnRequest.item_id];
          
          return (
            <div key={returnRequest.return_id} style={styles.returnCard}>
              <div style={styles.returnInfo}>
                <div>
                  <strong>Return ID:</strong> {returnRequest.return_id} |{' '}
                  <strong>Order ID:</strong> {returnRequest.order_id}
                </div>
                <div
                  style={{
                    ...styles.returnStatus,
                    color: getStatusColor(returnRequest.status || 'pending'),
                  }}
                >
                  <strong>Status:</strong> {returnRequest.status || 'Pending'}
                </div>
              </div>

              <div style={styles.itemList}>
                <div style={styles.itemCard}>
                  {itemDetail && (
                    <img
                      src={itemDetail.imageURL || 'path/to/default-image.jpg'}
                      alt={itemDetail.item_name || 'Item Image'}
                      style={styles.itemImage}
                    />
                  )}
                  <div>
                    <div style={styles.itemTitle}>{returnRequest.item_name}</div>
                    <div style={styles.itemDetails}>
                      <span>Quantity: {returnRequest.item_quantity}</span> |{' '}
                      <span>Price: ${parseFloat(returnRequest.item_price).toFixed(2)}</span> |{' '}
                      <span>Requested on: {new Date(returnRequest.request_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {returnRequest.return_reason && (
                <div style={styles.reasonSection}>
                  <strong>Return Reason:</strong> {returnRequest.return_reason}
                  {returnRequest.comment && (
                    <div style={{ marginTop: '5px' }}>
                      <strong>Admin Comment:</strong> {returnRequest.comment}
                    </div>
                  )}
                </div>
              )}

              {returnRequest.status && returnRequest.status.toLowerCase() === 'approved' && (
                <div style={styles.refundInfo}>
                  <strong>Refund Information:</strong>
                  <div>
                    {returnRequest.refund_amount ? (
                      <>
                        <div>Amount: ${parseFloat(returnRequest.refund_amount).toFixed(2)}</div>
                        <div>Status: {returnRequest.refund_status || 'Processing'}</div>
                        {returnRequest.refund_date && (
                          <div>Date: {new Date(returnRequest.refund_date).toLocaleDateString()}</div>
                        )}
                      </>
                    ) : (
                      <div>Refund processing initiated</div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '15px' }}>
                <button
                  style={styles.button}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = styles.button.backgroundColor)
                  }
                  onClick={() => navigate('/returnDetails', { state: { returnRequest } })}
                >
                  View Details
                </button>

                {(!returnRequest.status || returnRequest.status.toLowerCase() === 'pending') && (
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: '#dc3545',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#c82333')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#dc3545')}
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to cancel this return request?')) {
                        try {
                          await axios.put(
                            `http://localhost:3000/api/returns/${returnRequest.return_id}/status`,
                            { status: 'cancelled' }
                          );
                          fetchReturns(); // Refresh the list
                        } catch (error) {
                          console.error('Error cancelling return:', error);
                          alert('Failed to cancel return request');
                        }
                      }
                    }}
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ReturnOrders;