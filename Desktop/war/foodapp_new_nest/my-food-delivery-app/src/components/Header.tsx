import React, { useState } from 'react';
import { MdMenu, MdShoppingBasket, MdFavoriteBorder } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import Logo from '../assets/img/logo.png';
//import { heroData } from '../utils/data';
import CartDrawer from './CartDrawer';
import { useData } from '../context/DataContext';

const Header: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const favoriteItems = useSelector((state: RootState) => state.favorite.favoriteItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCarter, setShowCart] = useState(false);
  const {menuItems} = useData();
  const navigate = useNavigate();
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  const toggleFavorite = () => {
    navigate('/fav')    
  };

  const showCart = () => {
    setShowCart(true)
  };

  const filteredProducts = menuItems.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>

      <style>
        {`
          body, html {
            overflow-x: hidden;
          }
          .search-result-container {
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 350px;
          }
        `}
      </style>

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top">
        <div className="container-fluid d-flex align-items-center justify-content-between">
         
          <div className="d-flex align-items-center gap-2">
            <MdMenu
              size={24}
              className="text-light"
              onClick={() => setIsDrawerOpen(true)}
              style={{ cursor: 'pointer' }}
            />
            <Link to="/" className="navbar-brand d-flex align-items-center">
              <img src={Logo} alt="Logo" style={{ width: '30px', objectFit: 'cover' }} />
              <span className="ms-2 fw-bold fs-6 text-light">City</span>
            </Link>
          </div>

          <div className="position-relative mx-auto" style={{ maxWidth: '350px', width: '100%' }}>
            <input
              className="form-control rounded-pill px-3 shadow-sm"
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                backgroundColor: '#f5f5f5',
                borderColor: '#ddd',
                color: '#333',
                height: '35px',
                paddingRight: '35px',
                fontSize: '14px',
              }}
            />
            {searchTerm && (
              <span
                onClick={() => setSearchTerm('')}
                className="position-absolute"
                style={{
                  right: '30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ❌
              </span>
            )}
            <span
              className="position-absolute"
              style={{
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              🔍
            </span>

            {searchTerm && (
              <div
                className="position-absolute bg-white shadow-sm rounded search-result-container"
                style={{
                  zIndex: 1000,
                  top: '40px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                }}
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="p-2 d-flex align-items-center border-bottom"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="rounded-circle me-2"
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                        }}
                      />
                      <div className="d-flex flex-column">
                        <span className="fw-bold">{product.name}</span>
                        <span className="text-muted">${product.price}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-muted">No products found</div>
                )}
              </div>
            )}
          </div>

       
          <div className="d-flex align-items-center gap-2">
     
            <div className="position-relative" style={{ cursor: 'pointer' }}>
              <MdFavoriteBorder
                size={24}
                className={favoriteItems.length ? 'text-danger' : 'text-secondary'}
                onClick={() => toggleFavorite()}
              />
              {favoriteItems.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {favoriteItems.length}
                </span>
              )}
            </div>

         
            <div className="position-relative" onClick={showCart} style={{ cursor: 'pointer' }}>
              <MdShoppingBasket size={24} className="text-secondary" />
              {cartItems.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartItems.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`offcanvas offcanvas-start ${isDrawerOpen ? 'show' : ''}`}
        style={{
          width: '250px',
          backgroundColor: '#343a40',
          color: '#fff',
          zIndex: 1050,
        }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title text-light">Menu</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setIsDrawerOpen(false)}
          />
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link text-light" onClick={() => setIsDrawerOpen(false)}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/fav" className="nav-link text-light" onClick={() => setIsDrawerOpen(false)}>
                Fav
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/orders" className="nav-link text-light" onClick={() => setIsDrawerOpen(false)}>
                Orders
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/chat" className="nav-link text-light" onClick={() => setIsDrawerOpen(false)}>
                Chat
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <CartDrawer show={showCarter}  onClose={() => setShowCart(false)}  />

      {isDrawerOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
          }}
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
