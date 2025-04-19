import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { toast } from 'react-toastify';

import { LoginContext } from '../context/LoginContext';

// Styled Components
const PageContainer = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 15px;
  font-size: 18px;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-bottom: 30px;
`;

const FilterContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FilterSelect = styled.select`
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
  border: 1px solid #ddd;
`;

/*
  We'll limit the width and center it (max 1200px),
  with auto-fitting columns of at most 4 per row when space allows.
*/
const ProductGrid = styled.div`
  display: grid;
  gap: 20px;
  padding: 10px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  /* 
    Fixed 3 columns with minimum column width of 250px.
    Columns will expand equally but never shrink below 250px.
  */
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  justify-items: center;

  /* Optional: Switch to 2 columns on medium screens */
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }

  /* Optional: Switch to 1 column on mobile */
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background-color: #fff;
  padding: 20px;
  width: 100%;
  max-width: 250px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  position: relative;
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const ProductTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const ProductPrice = styled.p`
  font-size: 16px;
  color: #4caf50;
  margin-bottom: 10px;
`;

const WishlistIcon = styled.img`
  width: 25px;
  height: 25px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const AddToCartButton = styled.button`
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
`;


const CategorySection = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding-left: 20px;
`;


const EcommerceHome = () => {
  const navigate = useNavigate();

  // Destructure everything you need from context:
  const {
    wishlist,
    cartItems,
    setCartItems,
    handleWishlistToggle,
    handleAddToCart,
    token,
    setCustomerId,
    customer_id,
    handleReduceQuantity
  } = useContext(LoginContext);

  // Local states for product listing & searching:
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [loading, setLoading] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsResponse = await axios.get('http://localhost:3000/api/item/items');
        const productsData = productsResponse.data;

        // Extract unique category IDs
        const categoryIds = [...new Set(productsData
          .map(p => p.categoryId)
          .filter(id => id && id !== ''))
        ];

        // Fetch category names
        const categories = await Promise.all(
          categoryIds.map(async (id) => {
            try {
              const response = await axios.get(`http://localhost:3000/api/vendor-categories/category/${id}`);
              return response.data;
            } catch (error) {
              console.error(`Error fetching category ${id}:`, error);
              return { categoryId: id, name: `Category ${id}` };
            }
          })
        );

        // Create category mapping
        const newCategoryMap = categories.reduce((acc, curr) => {
          acc[curr.categoryId] = curr.name;
          return acc;
        }, {});
        
        setCategoryMap(newCategoryMap);
        setProducts(productsData);
        setFilteredProducts(productsData);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups = {};
    
    filteredProducts.forEach(product => {
      const categoryId = product.categoryId;
      let categoryName = 'Recommended';
      
      if (categoryId && categoryMap[categoryId]) {
        categoryName = categoryMap[categoryId];
      }

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      
      groups[categoryName].push(product);
    });

    return groups;
  }, [filteredProducts, categoryMap]);

  // Handle search input
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = products.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      return name.includes(query) || category.includes(query);
    });
    setFilteredProducts(filtered);
  };

  // Navigate to product details
  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`);
  };

  // Sort logic
  const handleSortChange = (event) => {
    const selectedSort = event.target.value;
    setSortBy(selectedSort);

    let sorted = [...filteredProducts];
    if (selectedSort === 'price') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    setFilteredProducts(sorted);
  };

  // Increase / decrease quantity
  const handleAddQuantity = (itemId) => {
    const updatedCartItems = cartItems.map(item =>
      item.item_id === itemId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCartItems(updatedCartItems);
    localStorage.setItem('cart-items', JSON.stringify(updatedCartItems));
  };

  // const handleReduceQuantity = (itemId) => {
  //   const updatedCartItems = cartItems.map(item =>
  //     item.item_id === itemId && item.quantity > 1
  //       ? { ...item, quantity: item.quantity - 1 }
  //       : item
  //   );
  //   setCartItems(updatedCartItems);
  //   localStorage.setItem('cart-items', JSON.stringify(updatedCartItems));
  // };

  return (
    <PageContainer>
      <SearchBar
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleSearch}
      />
      <FilterContainer>
        <FilterSelect onChange={handleSortChange} value={sortBy}>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
        </FilterSelect>
      </FilterContainer>

      {loading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          {Object.entries(groupedProducts).map(([categoryName, products]) => (
            <CategorySection key={categoryName}>
              <CategoryTitle>{categoryName}</CategoryTitle>
              <ProductGrid>
                {products.map((product) => {
                // Check if it's in the cart, find quantity:
                const isProductInCart = cartItems.some(
                  (item) => item.item_id === product.item_id
                );
                const quantityInCart = isProductInCart
                  ? cartItems.find((item) => item.item_id === product.item_id)
                      .quantity
                  : 0;

                // Check wishlist status
                const isInWishlist = wishlist.includes(product.item_id);
                const wishlistIconSrc = isInWishlist
                  ? 'https://i.ibb.co/TqkzdJ83/wishlist-2.png'
                  : 'https://i.ibb.co/m55kHHVN/wishlist-1.png';

                return (
                  <ProductCard
                    key={product.id}
                    onClick={() => handleProductClick(product.item_id)}
                  >
                    <ProductImage src={product.imageURL} alt={product.name} />

                    <WishlistIcon
                      src={wishlistIconSrc}
                      alt="Wishlist Icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(product.item_id);
                      }}
                    />
                    <ProductTitle>{product.name}</ProductTitle>
                    <ProductPrice>₹{product.selling_price}</ProductPrice>

                    {isProductInCart ? (
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReduceQuantity(product.item_id);
                          }}
                        >
                          -
                        </button>
                        <span style={{ margin: '0 10px' }}>
                          {quantityInCart}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <AddToCartButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Add to Cart
                      </AddToCartButton>
                    )}
                  </ProductCard>
                );
              })}
              </ProductGrid>
            </CategorySection>
          ))}
          
          {filteredProducts.length === 0 && <div>No products found.</div>}
        </>
      )}
    </PageContainer>
  );
};

export default EcommerceHome;
