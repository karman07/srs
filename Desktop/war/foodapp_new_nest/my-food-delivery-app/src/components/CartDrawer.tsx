import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { removeFromCart, updateCartQuantity } from "../store/cartSlice";
import { Button, Offcanvas } from "react-bootstrap";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { Item } from "../types/types";
import Image2 from "../assets/img/NotFound.svg";
import { useData } from "../context/DataContext";
import { trimDescription } from "../utils/trimtext";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  show: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [products, setProducts] = useState<Item[]>([]);
  const { menuItems, setTotalPrice } = useData();
  const navigate = useNavigate()
  useEffect(() => {
    if (cartItems.length > 0) {
      fetchProducts();
    }
  }, [cartItems]);

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const fetchProducts = async () => {
    try {
      const response = menuItems;
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart({ productId }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartQuantity({ productId, quantity }));
    }
  };

  const clearCart = () => {
    cartItems.forEach((item) =>
      dispatch(removeFromCart({ productId: item.productId }))
    );
  };

  const checkout = () => {
    navigate("/checkout")
  }


  const total = cartItems.reduce((acc, item) => {
    const product = products.find((p) => p._id === item.productId);
    return product ? acc + Number(product.price) * item.quantity : acc;
  }, 0);

  setTotalPrice(cartItems.reduce((acc, item) => {
    const product = products.find((p) => p._id === item.productId);
    return product ? acc + Number(product.price) * item.quantity : acc;
  }, 0))

  

  return (
    <>
      <Offcanvas
        show={show}
        onHide={onClose}
        placement="end"
        className="cart-drawer"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <MdOutlineKeyboardBackspace
              size={24}
              onClick={onClose}
              className="back-icon"
            />
            Cart
          </Offcanvas.Title>
          <Button variant="danger mx-2 clear-btn" onClick={clearCart}>
            Clear <RiRefreshFill size={20} />
          </Button>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => {
                const product = products.find((p) => p._id === item.productId);
                return product ? (
                  <div key={item.productId} className="cart-item">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <h6>{product.name}</h6>
                      <p className="text-muted">
                        {trimDescription(product.description, 15)}
                      </p>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                          >
                            -
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          className="remove-btn"
                          onClick={() => handleRemove(item.productId)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            </>
          ) : (
            <div className="empty-cart">
              <img src={Image2} alt="Empty Cart" className="empty-cart-img" />
              <p>Your cart is empty</p>
            </div>
          )}
        </Offcanvas.Body>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <h5>Total:</h5>
              <h5>${total.toFixed(2)}</h5>
            </div>
            <div className="cart-actions">
              <Button
                variant="success"
                className="action-btn"
                style={{ width: "100%" }}
                onClick={checkout}
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </Offcanvas>

      <style>{`
        .cart-drawer {
          animation: slide-in 0.3s ease;
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .cart-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #ddd;
          animation: fade-in 0.3s ease;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .cart-item-img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 8px;
        }

        .cart-item-details {
          flex-grow: 1;
          margin-left: 12px;
        }

        .cart-item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quantity-controls button:hover,
        .remove-btn:hover {
          background-color: #ff4d4f;
          color: white;
        }

        .empty-cart {
          text-align: center;
          margin-top: 40px;
          animation: fade-in 0.5s ease;
        }

        .empty-cart-img {
          width: 180px;
        }

        .cart-footer {
          padding: 12px;
          border-top: 1px solid #ddd;
          background-color: #fafafa;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .cart-actions .action-btn {
          width: 48%;
          transition: background-color 0.2s;
        }

        .clear-btn:hover {
          background-color: #ff4d4f;
        }

        .back-icon {
          cursor: pointer;
          transition: transform 0.2s;
        }

        .back-icon:hover {
          transform: rotate(-15deg);
        }
      `}</style>
    </>
  );
};

export default CartDrawer;
