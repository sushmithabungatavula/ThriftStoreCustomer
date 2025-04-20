// Checkout with address modal form for new address
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { LoginContext } from '../context/LoginContext';

const COLORS = {
  background: '#ffffff',
  text: '#1e1e1e',
  inputBorder: '#cccccc',
  divider: '#888888',
  button: '#000000',
  buttonText: '#ffffff',
  cardBackground: '#ffffff',
  cardShadow: 'rgba(0, 0, 0, 0.1)'
};

const Checkout = () => {
  const {
    cartItems,
    setCartItems,
    handleAddToCart,
    handleReduceQuantity,
    customer_id
  } = useContext(LoginContext);

  const [address, setAddress] = useState(null);
  const [itemsDetails, setItemsDetails] = useState([]);
  const [expandedStep, setExpandedStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    addressLine1: '',
    pincode: '',
    country: '',
    state: '',
    phone: '',
    type: 'home'
  });

  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem('cart-items')) || [];
    setCartItems(storedCartItems);
    const storedAddress = JSON.parse(localStorage.getItem('selectedAddress')) || null;
    setAddress(storedAddress);

    const fetchItemDetails = async () => {
      const itemIds = storedCartItems.map(item => item.item_id);
      const details = await Promise.all(
        itemIds.map(id => axios.get(`http://localhost:3000/api/item/${id}`).then(res => res.data))
      );
      setItemsDetails(details);
    };

    fetchItemDetails();
  }, []);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Please select items to place an order.');
      return;
    }

    const orderDate = new Date().toISOString();
    const shippingAddress = address;
    const orderStatus = 'placed';
    const paymentStatus = paymentMethod;

    const orderItems = cartItems.map(item => {
      const itemDetails = itemsDetails.find(detail => detail.item_id === item.item_id);
      return {
        item_id: item.item_id,
        item_quantity: item.quantity,
        item_price: itemDetails ? itemDetails.selling_price : 0,
        vendor_id: itemDetails ? itemDetails.vendor_id : null
      };
    });

    try {
      for (const item of orderItems) {
        await axios.post('http://localhost:3000/api/order', {
          customer_id: customer_id,
          order_date: orderDate,
          order_status: orderStatus,
          payment_status: paymentStatus,
          shipping_address: JSON.stringify(shippingAddress),
          shipping_id: null,
          item_id: item.item_id,
          item_quantity: item.item_quantity,
          item_price: item.item_price,
        });
      }

      alert('Order placed successfully!');
      setCartItems([]);
      localStorage.removeItem('cart-items');
    } catch (error) {
      console.error('Order error:', error);
      alert('There was an error placing the order. Please try again.');
    }
  };

  const handleStepClick = (step) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  const renderCartItems = () => (
    cartItems.map(item => {
      const itemDetails = itemsDetails.find(detail => detail.item_id === item.item_id);
      if (!itemDetails) return null;
      return (
        <CartItem key={item.item_id}>
          <img src={itemDetails.imageURL} alt={itemDetails.name} />
          <div>
            <p><strong>{itemDetails.name}</strong></p>
            <p>Brand: {itemDetails.brand}</p>
            <p>Size: {itemDetails.size}</p>
            <p>Color: {itemDetails.color}</p>
            <p>${itemDetails.selling_price}</p>
            <div>
              <button onClick={() => handleReduceQuantity(item.item_id)}>-</button>
              <span style={{ margin: '0 10px' }}>{item.quantity}</span>
              <button onClick={() => handleAddToCart(itemDetails)}>+</button>
            </div>
          </div>
        </CartItem>
      );
    })
  );

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setAddress(newAddress);
    localStorage.setItem('selectedAddress', JSON.stringify(newAddress));
    setShowModal(false);
  };

  const total = cartItems.reduce((total, item) => total + (itemsDetails.find(d => d.item_id === item.item_id)?.selling_price || 0) * item.quantity, 0);

  return (
    <Wrapper>
      <Steps>
        {[1, 2, 3].map(step => (
          <Step key={step} active={expandedStep === step} onClick={() => handleStepClick(step)}>
            <div className="header">{['Review & Total', 'Shipping Address', 'Select Payment Method'][step - 1]}</div>
            <div className="content">
              {step === 1 && <>{renderCartItems()}<p><strong>Total: ${total}</strong> (Free Shipping)</p></>}
              {step === 2 && (
                <div>
                  <AddressHeader>
                    <h4>Selected Address</h4>
                    <AddNewLink as="button" onClick={() => setShowModal(true)}>+ Add New Address</AddNewLink>
                  </AddressHeader>
                  {address ? (
                    <div>
                      <p>{address.name}</p>
                      <p>{address.addressLine1}</p>
                      <p>{address.pincode}</p>
                      <p>{address.state}, {address.country}</p>
                      <p>{address.phone}</p>
                    </div>
                  ) : <p>No address selected</p>}
                </div>
              )}
              {step === 3 && (
                <PaymentOptions>
                  <label><input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /> 🅿️ PayPal</label>
                  <label><input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> 💵 Cash on Delivery</label>
                  <label><input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> 💳 Card</label>
                </PaymentOptions>
              )}
            </div>
          </Step>
        ))}
      </Steps>

      <Summary>
        <h3>Order Summary</h3>
        {cartItems.map(item => {
          const itemDetails = itemsDetails.find(detail => detail.item_id === item.item_id);
          return itemDetails ? (
            <div key={item.item_id}>
              <p>{itemDetails.name} x {item.quantity}</p>
              <p>${itemDetails.selling_price}</p>
            </div>
          ) : null;
        })}
        <p><strong>Subtotal:</strong> ${total}</p>
        <p><strong>Shipping:</strong> Free</p>
        <p><strong>Total:</strong> ${total}</p>
        <button onClick={handlePlaceOrder}>Place Order</button>
      </Summary>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Add New Address</h3>
            <form onSubmit={handleAddressSubmit}>
              <input placeholder="Name" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required />
              <input placeholder="Street Address" value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} required />
              <input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
              <input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} required />
              <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
              <input placeholder="Phone Number" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
              <label><input type="radio" name="type" value="home" checked={newAddress.type === 'home'} onChange={() => setNewAddress({ ...newAddress, type: 'home' })} /> Home</label>
              <label><input type="radio" name="type" value="office" checked={newAddress.type === 'office'} onChange={() => setNewAddress({ ...newAddress, type: 'office' })} /> Office</label>
              <button type="submit">Save Address</button>
            </form>
            <button onClick={() => setShowModal(false)}>Close</button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Wrapper>
  );
};

export default Checkout;

const Wrapper = styled.div` display: flex; gap: 40px; padding: 40px; background: ${COLORS.background}; font-family: Arial, sans-serif; `;
const Steps = styled.div` flex: 2; `;
const Step = styled.div`
  background: ${COLORS.cardBackground};
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px ${COLORS.cardShadow};
  .header { font-size: 18px; font-weight: bold; color: ${COLORS.text}; }
  .content { margin-top: 10px; display: ${props => (props.active ? 'block' : 'none')}; }
`;
const CartItem = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
`;
const Summary = styled.div`
  flex: 1;
  background: ${COLORS.cardBackground};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px ${COLORS.cardShadow};
  button {
    margin-top: 20px;
    background: ${COLORS.button};
    color: ${COLORS.buttonText};
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
  }
`;
const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h4 { margin: 0; font-size: 16px; font-weight: bold; }
`;
const AddNewLink = styled.a`
  font-size: 14px;
  text-decoration: none;
  color: ${COLORS.button};
  font-weight: bold;
  cursor: pointer;
`;
const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  label {
    font-size: 16px;
    color: ${COLORS.text};
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    input { padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
    label { font-size: 14px; }
    button { background: ${COLORS.button}; color: white; padding: 10px; border: none; border-radius: 6px; }
  }
`;
