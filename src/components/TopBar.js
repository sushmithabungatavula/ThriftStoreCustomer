// src/components/TopBar/TopBar.js
import React, { useState, useContext } from 'react';
import { FaSearch, FaBell, FaUserCircle, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import './TopBar.css';
import { LoginContext } from '../context/LoginContext';

function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const {
    setIsLoggedIn,
    setCustomerId,
    setCartId,
    setWishIdlist,
    cartItems = []
  } = useContext(LoginContext);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    const itemsToRemove = [
      'token', 'customerId', 'cartId', 'wishlistId', 'email', 'isLoggedIn',
      'cart-items', 'wishlist', 'addressID1', 'addressID2', 'addressID3', 'addressID4'
    ];
    itemsToRemove.forEach(item => localStorage.removeItem(item));
    setIsLoggedIn(false);
    setCustomerId(null);
    setCartId(null);
    setWishIdlist(null);
    navigate('/');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div onClick={() => navigate('/EcommerceHome')}>
        <div className="topbar-title" >THRIFT STORE</div>
        </div>

      </div>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      <div className="topbar-right">
        <div className="cart-container" onClick={() => navigate('/CheckoutPage')}>
          <FaShoppingCart className="icon" />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
        <div className="profile" onClick={toggleDropdown}>
          <FaUserCircle className="icon" />
          {dropdownOpen && (
            <div className="dropdown">
              <div className="dropdown-item" onClick={() => navigate('/profile')}>Profile</div>
              <div className="dropdown-item" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
