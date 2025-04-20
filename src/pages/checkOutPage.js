/* Checkout page with polished Shipping‑Address UI + modals */
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { List } from 'antd';
import { LoginContext } from '../context/LoginContext';

/* ---------- theme ---------- */
const COLORS = {
  background: '#fafafa',
  text: '#222',
  muted: '#666',
  primary: '#111',
  primaryLight: '#222',
  primaryText: '#fff',
  border: '#e0e0e0',
  card: '#fff',
  cardShadow: 'rgba(0,0,0,0.08)',
  accent: '#2196f3',
  successBg: '#e8f5e9',
};

/* ---------- utils ---------- */
const SLOT_KEYS = ['addressID1', 'addressID2', 'addressID3', 'addressID4'];

/* =================================================================== */
/*                         COMPONENT                                   */
/* =================================================================== */
const Checkout = () => {
  /* ───────────────── context ───────────────── */
  const {
    cartItems,
    setCartItems,
    handleAddToCart,
    handleReduceQuantity,
    customer_id,
  } = useContext(LoginContext);

  /* ───────────────── state ───────────────── */
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [itemsDetails, setItemsDetails] = useState([]);
  const [expandedStep, setExpandedStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [showAddrModal, setShowAddrModal] = useState(false);
  const [chosenAddrId, setChosenAddrId] = useState(null);

  /* modal for new quick address (kept for backward compat) */
  const [showNewAddrModal, setShowNewAddrModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    addressLine1: '',
    pincode: '',
    country: '',
    state: '',
    phone: '',
    type: 'home',
  });

  const nav = useNavigate();

  /* ───────────────── mount ­─ load cart & addresses ───────────────── */
  useEffect(() => {
    /* cart items */
    const storedCart = JSON.parse(localStorage.getItem('cart-items')) || [];
    setCartItems(storedCart);

    /* address slots */
    (async () => {
      const list = await Promise.all(
        SLOT_KEYS.map(async (key) => {
          const id = localStorage.getItem(key);
          if (!id) return null;
          try {
            const { data } = await axios.get(
              `http://localhost:3000/api/address/${id}`
            );
            return data;
          } catch {
            return null;
          }
        })
      );
      const validAddrs = list.filter(Boolean);
      setAddresses(validAddrs);

      /* default selection */
      const savedId =
        localStorage.getItem('selectedDeliveryAddress') ||
        (validAddrs[0]?.addressId ?? null);

      if (savedId) {
        const obj = validAddrs.find((a) => a.addressId === Number(savedId));
        if (obj) {
          setSelectedAddress(obj);
          setChosenAddrId(obj.addressId);
          localStorage.setItem('selectedDeliveryAddress', obj.addressId);
          localStorage.setItem('selectedAddress', JSON.stringify(obj));
        }
      }
    })();
  }, []);

  /* ───────────────── item details whenever cart changes ───────────────── */
  useEffect(() => {
    const fetchDetails = async () => {
      const ids = cartItems.map((i) => i.item_id);
      if (!ids.length) return;
      const result = await Promise.all(
        ids.map((id) =>
          axios.get(`http://localhost:3000/api/item/${id}`).then((r) => r.data)
        )
      );
      setItemsDetails(result);
    };
    fetchDetails();
  }, [cartItems]);

  /* ───────────────── helpers ───────────────── */
  const cartTotal = cartItems.reduce(
    (sum, ci) =>
      sum +
      (itemsDetails.find((d) => d.item_id === ci.item_id)?.selling_price || 0) *
        ci.quantity,
    0
  );
  const toggleStep = (i) => setExpandedStep(expandedStep === i ? null : i);

  /* ───────────────── order handler ───────────────── */
  const handlePlaceOrder = async () => {
    if (!cartItems.length) return alert('Cart is empty.');
    if (!selectedAddress) return alert('Select a shipping address.');

    const orderDate = new Date().toISOString();
    const orderItems = cartItems.map((ci) => {
      const d = itemsDetails.find((x) => x.item_id === ci.item_id);
      return {
        item_id: ci.item_id,
        item_quantity: ci.quantity,
        item_price: d?.selling_price || 0,
        vendor_id: d?.vendor_id || null,
      };
    });

    try {
      for (const item of orderItems) {
        await axios.post('http://localhost:3000/api/order', {
          customer_id,
          order_date: orderDate,
          order_status: 'placed',
          payment_status: paymentMethod,
          shipping_address: JSON.stringify(selectedAddress),
          shipping_id: null,
          ...item,
        });
      }
      alert('Order placed!');
      setCartItems([]);
      localStorage.removeItem('cart-items');
    } catch (e) {
      console.error(e);
      alert('Could not place order.');
    }
  };

  /* =================================================================== */
  /*                               JSX                                   */
  /* =================================================================== */
  return (
    <Wrapper>
      {/* --------------- STEPS --------------- */}
      <Steps>
        {/* === STEP 1 – Review === */}
        <Step active={expandedStep === 1} onClick={() => toggleStep(1)}>
          <StepHeader>Review & Total</StepHeader>
          <StepContent>
            {cartItems.map((ci) => {
              const d = itemsDetails.find((x) => x.item_id === ci.item_id);
              if (!d) return null;
              return (
                <CartItem key={ci.item_id}>
                  <ItemImg src={d.imageURL} alt={d.name} />
                  <div>
                    <ItemTitle>{d.name}</ItemTitle>
                    <Mini muted>{d.brand}</Mini>
                    <Mini muted>
                      {d.size} / {d.color}
                    </Mini>
                    <Price>${d.selling_price}</Price>
                    <QtyBox>
                      <QtyBtn onClick={() => handleReduceQuantity(ci.item_id)}>
                        –
                      </QtyBtn>
                      <Qty>{ci.quantity}</Qty>
                      <QtyBtn onClick={() => handleAddToCart(d)}>+</QtyBtn>
                    </QtyBox>
                  </div>
                </CartItem>
              );
            })}
            <TotalLine>
              <b>Total:</b> ${cartTotal} &nbsp;
              <span style={{ color: COLORS.muted }}>(Free Shipping)</span>
            </TotalLine>
          </StepContent>
        </Step>

        {/* === STEP 2 – Shipping address === */}
        <Step active={expandedStep === 2} onClick={() => toggleStep(2)}>
          <StepHeader>Shipping Address</StepHeader>
          <StepContent>
            <AddressHeader>
              <h4>Delivery Address</h4>
              {addresses.length > 0 && (
                <ChangeBtn onClick={() => setShowAddrModal(true)}>
                  Change
                </ChangeBtn>
              )}
            </AddressHeader>

            {selectedAddress ? (
              <SelectedAddressCard>
                <NameLine>{selectedAddress.name}</NameLine>
                <AddrLine>{selectedAddress.addressLine1}</AddrLine>
                <AddrLine>{selectedAddress.pincode}</AddrLine>
                <AddrLine>
                  {selectedAddress.state}, {selectedAddress.country}
                </AddrLine>
                {selectedAddress.phone && (
                  <Mini muted>{selectedAddress.phone}</Mini>
                )}
              </SelectedAddressCard>
            ) : (
              <Mini>No address selected</Mini>
            )}
          </StepContent>
        </Step>

        {/* === STEP 3 – Payment === */}
        <Step active={expandedStep === 3} onClick={() => toggleStep(3)}>
          <StepHeader>Select Payment Method</StepHeader>
          <StepContent>
            <PaymentOptions>
              {[
                ['paypal', '🅿️ PayPal'],
                ['cod', '💵 Cash on Delivery'],
                ['card', '💳 Debit / Credit Card'],
              ].map(([val, label]) => (
                <label key={val}>
                  <input
                    type="radio"
                    value={val}
                    checked={paymentMethod === val}
                    onChange={() => setPaymentMethod(val)}
                  />
                  {label}
                </label>
              ))}
            </PaymentOptions>
          </StepContent>
        </Step>
      </Steps>

      {/* --------------- SUMMARY --------------- */}
      <SummaryCard>
        <h3>Order Summary</h3>
        {cartItems.map((ci) => {
          const d = itemsDetails.find((x) => x.item_id === ci.item_id);
          if (!d) return null;
          return (
            <SummaryRow key={ci.item_id}>
              <span>
                {d.name} × {ci.quantity}
              </span>
              <span>${d.selling_price}</span>
            </SummaryRow>
          );
        })}
        <Divider />
        <SummaryRow>
          <b>Subtotal</b> <b>${cartTotal}</b>
        </SummaryRow>
        <SummaryRow>
          <span>Shipping</span> <span>Free</span>
        </SummaryRow>
        <SummaryRow big>
          <b>Total</b> <b>${cartTotal}</b>
        </SummaryRow>
        <PrimaryBtn onClick={handlePlaceOrder}>Place Order</PrimaryBtn>
      </SummaryCard>

      {/* --------------- CHANGE‑ADDRESS MODAL --------------- */}
      {showAddrModal && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>Select Delivery Address</ModalTitle>
            {addresses.length ? (
              <List
                dataSource={addresses}
                rowKey={(a) => a.addressId}
                renderItem={(a) => (
                  <AddrCard
                    selected={chosenAddrId === a.addressId}
                    onClick={() => setChosenAddrId(a.addressId)}
                  >
                    <input
                      type="radio"
                      checked={chosenAddrId === a.addressId}
                      readOnly
                    />
                    <div>
                      <NameLine>{a.name}</NameLine>
                      <Mini>{a.addressLine1}</Mini>
                      <Mini>
                        {a.state}, {a.country} – {a.pincode}
                      </Mini>
                    </div>
                  </AddrCard>
                )}
              />
            ) : (
              <Mini>No saved addresses.</Mini>
            )}

            <ModalFooter>
              <PrimaryBtn
                disabled={!chosenAddrId}
                onClick={() => {
                  const obj = addresses.find(
                    (x) => x.addressId === chosenAddrId
                  );
                  if (!obj) return;
                  setSelectedAddress(obj);
                  localStorage.setItem(
                    'selectedDeliveryAddress',
                    obj.addressId
                  );
                  localStorage.setItem('selectedAddress', JSON.stringify(obj));
                  setShowAddrModal(false);
                }}
              >
                Select
              </PrimaryBtn>
              <PlainBtn
                onClick={() => {
                  setShowAddrModal(false);
                  nav('/location-picker');
                }}
              >
                Add New
              </PlainBtn>
              <PlainBtn onClick={() => setShowAddrModal(false)}>Close</PlainBtn>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* quick‑add modal left intact (hidden behind showNewAddrModal) */}
      {showNewAddrModal && (
        <ModalOverlay>
          <ModalBox>…</ModalBox>
        </ModalOverlay>
      )}
    </Wrapper>
  );
};

export default Checkout;

/* =================================================================== */
/*                             STYLES                                  */
/* =================================================================== */

const Wrapper = styled.div`
  display: flex;
  gap: 40px;
  padding: 40px;
  background: ${COLORS.background};
  font-family: Arial, sans-serif;
`;

/* ---------- Left column ---------- */
const Steps = styled.div`
  flex: 2;
`;
const Step = styled.div`
  background: ${COLORS.card};
  margin-bottom: 24px;
  border-radius: 14px;
  padding: 22px 26px;
  box-shadow: 0 4px 12px ${COLORS.cardShadow};
  cursor: pointer;
`;
const StepHeader = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${COLORS.text};
  display: flex;
  align-items: center;
  gap: 6px;
  &:after {
    content: '▼';
    font-size: 12px;
    margin-left: auto;
    transition: transform 0.2s;
  }
  ${Step}[active='true'] &::after {
    transform: rotate(180deg);
  }
`;
const StepContent = styled.div`
  margin-top: 14px;
  display: ${(p) => (p.hidden ? 'none' : 'block')};
`;

/* ----- cart items ----- */
const CartItem = styled.div`
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
`;
const ItemImg = styled.img`
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
`;
const ItemTitle = styled.p`
  margin: 0 0 4px;
  font-weight: 600;
`;
const Mini = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${(p) => (p.muted ? COLORS.muted : COLORS.text)};
`;
const Price = styled(Mini)`
  font-weight: bold;
`;
const QtyBox = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
`;
const QtyBtn = styled.button`
  border: 1px solid ${COLORS.border};
  background: ${COLORS.card};
  width: 26px;
  height: 26px;
  cursor: pointer;
`;
const Qty = styled.span`
  width: 26px;
  text-align: center;
`;
const TotalLine = styled.p`
  border-top: 1px dashed ${COLORS.border};
  padding-top: 10px;
`;

/* ----- shipping address visuals ----- */
const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }
`;
const ChangeBtn = styled.button`
  background: none;
  border: none;
  color: ${COLORS.accent};
  font-weight: 600;
  cursor: pointer;
`;
const SelectedAddressCard = styled.div`
  border: 1px solid ${COLORS.border};
  border-left: 4px solid ${COLORS.accent};
  padding: 14px 18px;
  border-radius: 10px;
  background: ${COLORS.card};
`;
const NameLine = styled.p`
  margin: 0 0 4px;
  font-weight: 600;
`;
const AddrLine = styled(Mini)``;

/* ---------- Right column ---------- */
const SummaryCard = styled.div`
  flex: 1;
  background: ${COLORS.card};
  border-radius: 14px;
  padding: 26px 30px;
  box-shadow: 0 4px 12px ${COLORS.cardShadow};
`;
const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${(p) => (p.big ? '17px' : '14px')};
  margin: 4px 0;
`;
const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${COLORS.border};
  margin: 14px 0 10px;
`;
const PrimaryBtn = styled.button`
  width: 100%;
  margin-top: 18px;
  background: ${COLORS.primary};
  color: ${COLORS.primaryText};
  border: none;
  padding: 14px 0;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
`;
const PlainBtn = styled.button`
  background: none;
  border: 1px solid ${COLORS.border};
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
`;

/* ---------- modal ---------- */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;
const ModalBox = styled.div`
  background: ${COLORS.card};
  width: 100%;
  max-width: 460px;
  max-height: 80vh;
  border-radius: 14px;
  padding: 26px 30px;
  overflow-y: auto;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
`;
const ModalTitle = styled.h3`
  margin: 0 0 16px;
`;
const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
`;
const AddrCard = styled.div`
  border: 2px solid
    ${(p) => (p.selected ? COLORS.accent : COLORS.border)};
  border-radius: 12px;
  padding: 14px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  background: ${(p) => (p.selected ? COLORS.successBg : COLORS.card)};
  transition: border 0.15s;
  & + & {
    margin-top: 12px;
  }
  input {
    margin-top: 3px;
  }
`;

/* placeholder for existing quick‑add modal */
const ModalContent = styled(ModalBox)``;

/* ----- payment ----- */
const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-size: 15px;
    input {
      margin-right: 6px;
    }
  }
`;
