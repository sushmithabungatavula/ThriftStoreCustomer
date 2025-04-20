// Payment component styled like Login Page UI
import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Row, Col } from 'react-bootstrap';
import { WalletFill, TagFill, Shop, PersonCircle } from 'react-bootstrap-icons';

function Payment() {
  const [formData, setFormData] = useState({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
  const [walletBalance, setWalletBalance] = useState(500);
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Processing payment:', formData);
  };

  const handleCouponInputChange = (e) => {
    setCouponCode(e.target.value);
    setCouponMessage('');
  };

  const handleApplyCoupon = () => {
    if (couponCode === 'DISCOUNT10') {
      setCouponMessage('Coupon applied successfully!');
    } else {
      setCouponMessage('Invalid coupon code');
    }
  };

  const handleWalletAmountChange = (e) => {
    setWalletAmount(e.target.value);
  };

  const handleWalletCheckboxChange = (e) => {
    setUseWallet(e.target.checked);
    if (!e.target.checked) setWalletAmount(0);
  };

  const Footer = () => (
    <Row style={{ position: 'fixed', bottom: '0', width: '100%', padding: '2vh', backgroundColor: '#fff' }}>
      <Col style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', fontSize: '14px', cursor: 'pointer' }}><Shop size={30} /><span>Shopping</span></div>
        <div style={{ textAlign: 'center', fontSize: '14px', cursor: 'pointer' }}><TagFill size={30} /><span>Coupons</span></div>
        <div style={{ textAlign: 'center', fontSize: '14px', color: '#4caf50', cursor: 'pointer' }}><WalletFill size={30} /><span>Wallet</span></div>
        <div style={{ textAlign: 'center', fontSize: '14px', cursor: 'pointer' }}><PersonCircle size={30} /><span>Profile</span></div>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '5vh', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: 'auto', backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Lock className="h-8 w-8" color="#1e1e1e" />
          <h2 style={{ marginLeft: '12px', fontSize: '20px', fontWeight: 'bold' }}>Secure Payment</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Card Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                placeholder="1234 5678 9012 3456"
                style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
              <CreditCard style={{ position: 'absolute', right: '10px', top: '12px', color: '#888' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Cardholder Name</label>
            <input
              type="text"
              value={formData.cardName}
              onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
              placeholder="John Doe"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Expiry Date</label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="MM/YY"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>CVV</label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                placeholder="123"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>
              <input type="checkbox" checked={useWallet} onChange={handleWalletCheckboxChange} />
              <span style={{ marginLeft: '10px' }}>Use Wallet Balance</span>
            </label>
            {useWallet && (
              <input
                type="number"
                value={walletAmount}
                onChange={handleWalletAmountChange}
                min="1"
                max={walletBalance}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '10px' }}
              />
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Coupon Code</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={couponCode}
                onChange={handleCouponInputChange}
                placeholder="Enter coupon code"
                style={{ width: '100%', padding: '12px 80px 12px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
              <button type="button" onClick={handleApplyCoupon} style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                Apply
              </button>
            </div>
            {couponMessage && (
              <div style={{ color: couponMessage.includes('success') ? 'green' : 'red', marginTop: '8px' }}>
                {couponMessage}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Choose Payment Method:</div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <input type="radio" value="upi" checked={selectedPaymentMethod === 'upi'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} /> UPI Payment
            </label>
            <label>
              <input type="radio" value="razorpay" checked={selectedPaymentMethod === 'razorpay'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} /> Razorpay Payment
            </label>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#000',
              color: '#fff',
              padding: '14px',
              width: '100%',
              fontWeight: 'bold',
              fontSize: '14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Pay Now
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Payment;
