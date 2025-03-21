import React, { useEffect, useRef } from 'react';
import { MdShoppingBasket, MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addToCart, removeFromCart, subToCart } from '../store/cartSlice';
import { addToFavorite, removeFromFavorite } from '../store/favoriteSlice';
import { useNavigate } from 'react-router-dom';
import NotFound from '../assets/img/NotFound.svg';
import { Item } from '../types/types';

interface RowContainerProps {
  flag: boolean;
  data: Item[];
  scrollValue: number;
}

const RowContainer: React.FC<RowContainerProps> = ({ flag, data, scrollValue }) => {
  const rowContainer = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const favoriteItems = useSelector((state: RootState) => state.favorite.favoriteItems);

  useEffect(() => {
    if (rowContainer.current) {
      rowContainer.current.scrollLeft += scrollValue;
    }
  }, [scrollValue]);

  const openProductPage = (id: string) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const handleRemoveFromCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (getQuantity(productId) === 1) {
      dispatch(removeFromCart({ productId }));
    } else {
      dispatch(subToCart({ productId, quantity: 1 }));
    }
  };

  const isInCart = (id: string) =>
    cartItems.some((item) => item.productId === id);

  const getQuantity = (id: string) =>
    cartItems.find((item) => item.productId === id)?.quantity || 0;

  const isFavorite = (id: string) => favoriteItems.includes(id);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isFavorite(id)) {
      dispatch(removeFromFavorite(id));
    } else {
      dispatch(addToFavorite(id));
    }
  };

  return (
    <motion.div
      ref={rowContainer}
      className={`container d-flex gap-3 my-6 overflow-hidden ${
        flag ? 'overflow-x-auto' : 'flex-wrap justify-content-center'
      }`}
      style={{ scrollBehavior: 'smooth' }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {data && data.length > 0 ? (
        data.map((item) => (
          <motion.div
            key={item._id}
            className="card border-0 shadow-sm p-3 rounded-3 text-center position-relative mt-3"
            style={{
              width: '16rem',
              minWidth: '240px',
              cursor: 'pointer',
            }}
            onClick={() => openProductPage(item._id)} 
            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
          >
            <div className="position-relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="img-fluid"
                  style={{
                    height: '140px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                  }}
                />
              </motion.div>

              {/* Favorite Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                className="btn btn-light rounded-circle p-2 position-absolute"
                style={{
                  bottom: '-10px',
                  right: '-10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onClick={(e) => toggleFavorite(e, item._id)} 
              >
                {isFavorite(item._id) ? (
                  <MdFavorite size={20} className="text-danger" />
                ) : (
                  <MdFavoriteBorder size={20} className="text-black" />
                )}
              </motion.button>
            </div>

            {/* Item Details */}
            <div className="mt-3">
              <h5 className="fw-semibold">{item.name}</h5>
              <p className="text-muted small">{item.calories} Calories</p>
              <h6 className="fw-bold">
                <span className="text-danger">$</span> {item.price}
              </h6>
              {/* Add to Cart Buttons */}
              <div className="d-flex justify-content-center mt-2">
                {isInCart(item._id) ? (
                  <motion.div
                    className="d-flex align-items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.button
                      className="btn btn-outline-danger"
                      onClick={(e) => handleRemoveFromCart(e, item._id)} 
                      whileTap={{ scale: 0.9 }}
                    >
                      -
                    </motion.button>
                    <span>{getQuantity(item._id)}</span>
                    <motion.button
                      className="btn btn-outline-danger"
                      onClick={(e) => handleAddToCart(e, item._id)} 
                      whileTap={{ scale: 0.9 }}
                    >
                      +
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    className="btn btn-danger"
                    onClick={(e) => handleAddToCart(e, item._id)} 
                    whileTap={{ scale: 0.9 }}
                  >
                    <MdShoppingBasket size={20} />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          className="text-center w-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src={NotFound} className="img-fluid" style={{ maxHeight: '280px' }} alt="Not Found" />
          <p className="fs-5 fw-semibold mt-3">Items Not Available</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RowContainer;
