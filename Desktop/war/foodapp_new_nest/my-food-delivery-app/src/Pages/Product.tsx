import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useData } from '../context/DataContext';
import { Item } from '../types/types';
import RowContainer from '../components/RowContainer';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart, updateCartQuantity, subToCart } from '../store/cartSlice';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getMenuItemById, menuItems } = useData();
  const [product, setProduct] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        const data = await getMenuItemById(id);
        if (data) setProduct(data);
      }
    };
    fetchProduct();
  }, [id, getMenuItemById]);

  const handleAddToCart = () => {
    setQuantity(1);
    if (product) {
      dispatch(addToCart({ productId: product._id, quantity: 1 }));
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
    if (product) {
      dispatch(updateCartQuantity({ productId: product._id, quantity: quantity + 1 }));
    }
  };

  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity((prev) => Math.max(prev - 1, 0));
      if (product) {
        dispatch(subToCart({ productId: product._id, quantity: 1 }));
      }
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <Container fluid className="mt-5 px-3 px-md-5">
      <Row className="align-items-center justify-content-center text-center text-md-start">
        {/* Product Image */}
        <Col md={6} className="mb-4 mb-md-0">
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid w-100"
            style={{
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '16px',
              marginTop: '50px', 
              boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          />
        </Col>

        {/* Product Info */}
        <Col md={6}>
          <motion.h1
            className="fw-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {product.name}
          </motion.h1>
          <motion.p
            className="text-muted fs-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            ${product.price}
          </motion.p>
          <motion.p
            className="text-secondary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {product.description}
          </motion.p>

          {quantity > 0 ? (
            <div className="d-flex align-items-center justify-content-center justify-content-md-start mt-3">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={decrementQuantity}
                className="me-2"
              >
                -
              </Button>
              <span className="fs-5">{quantity}</span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={incrementQuantity}
                className="ms-2"
              >
                +
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button
                variant="danger"
                size="lg"
                className="mt-3"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </motion.div>
          )}
        </Col>
      </Row>

      {/* Divider */}
      <hr className="my-5" />

      {/* Similar Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <RowContainer
          flag={false}
          data={menuItems?.filter((item) => item.crusine === product.crusine)}
          scrollValue={0}
        />
      </motion.div>
    </Container>
  );
};

export default ProductPage;
