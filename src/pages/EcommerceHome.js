import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  linkText: '#000000',
  cardBackground: '#ffffff',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  cartGreen: '#4caf50',
  cartGreenHover: '#45a049'
};

const EcommerceHome = () => {
  const navigate = useNavigate();
  const {
    wishlist,
    cartItems,
    setCartItems,
    handleWishlistToggle,
    handleAddToCart,
    handleReduceQuantity
  } = useContext(LoginContext);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:3000/api/item/items');
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Error loading products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toTitleCase = (str) => {
    return str
      ?.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`);
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    const sorted = [...filteredProducts];
    if (sort === 'price') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    setFilteredProducts(sorted);
  };

  return (
    <Page>
      <Search
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleSearch}
      />
      <SortBar>
        <Select value={sortBy} onChange={handleSortChange}>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </Select>
      </SortBar>

      {loading ? <Loader>Loading...</Loader> : (
        <Grid>
          {filteredProducts.map(product => {
            const isInWishlist = wishlist.includes(product.item_id);
            const wishlistIcon = isInWishlist ? '❤️' : '🤍';
            const cartItem = cartItems.find(item => item.item_id === product.item_id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <Card key={product.item_id} onClick={() => handleProductClick(product.item_id)}>
                <Image src={product.imageURL} alt={product.name} />
                <Info>
                  <h3>{toTitleCase(product.name)}</h3>
                  <p><strong>Brand:</strong> {toTitleCase(product.brand) || 'N/A'}</p>
                  <p><strong>Size:</strong> {product.size || 'Free Size'}</p>
                  <p><strong>Price:</strong> ${product.selling_price}</p>
                </Info>
                <Wishlist
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(product.item_id);
                  }}
                >{wishlistIcon}</Wishlist>

                {quantity > 0 ? (
                  <>
                    <QuantityControls>
                      <button onClick={(e) => { e.stopPropagation(); handleReduceQuantity(product.item_id); }}>-</button>
                      <span>{quantity}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}>+</button>
                    </QuantityControls>
                    <ViewCartButton
                    onClick={(e) => {e.stopPropagation();navigate('/CheckoutPage');}}>View Cart</ViewCartButton>
                  </>
                ) : (
                  <AddButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >Add to Cart</AddButton>
                )}
              </Card>
            );
          })}
        </Grid>
      )}
    </Page>
  );
};

export default EcommerceHome;

// Styled Components
const Page = styled.div`
  padding: 30px;
  background: ${COLORS.background};
  font-family: Arial, sans-serif;
  min-height: 100vh;
`;

const Search = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid ${COLORS.inputBorder};
  margin-bottom: 20px;
`;

const SortBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid ${COLORS.inputBorder};
  border-radius: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: ${COLORS.cardBackground};
  border-radius: 12px;
  box-shadow: 0 4px 10px ${COLORS.cardShadow};
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.01);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
`;

const Info = styled.div`
  padding: 16px;
  color: ${COLORS.text};
  h3 {
    margin: 0 0 10px;
    font-size: 18px;
  }
  p {
    margin: 4px 0;
    font-size: 14px;
  }
`;

const Wishlist = styled.div`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 20px;
  cursor: pointer;
`;

const AddButton = styled.button`
  width: calc(100% - 32px);
  margin: 12px 16px;
  padding: 10px;
  background-color: ${COLORS.button};
  color: ${COLORS.buttonText};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const ViewCartButton = styled(AddButton)`
  background-color: ${COLORS.button};
  margin-top: 4px;
`;

const QuantityControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px 0 4px;
  button {
    padding: 6px 12px;
    font-size: 16px;
    cursor: pointer;
  }
  span {
    margin: 0 10px;
    font-size: 16px;
  }
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px;
  font-size: 18px;
  color: ${COLORS.divider};
`;
