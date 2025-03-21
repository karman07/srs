import React, { useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Home from './Pages/Home';
import ProductPage from './Pages/Product';
import Header from './components/Header';
import Footer from './components/footer/Footer';
import CheckoutPage from './Pages/CheckoutPage';
import OrderConfirmation from './Pages/OrderConfirmation';
import HeartPage from './Pages/HeartPage';
import OrderPage from './Pages/OrderPage';

const App: React.FC = () => {

  const { tableNumber } = useParams();

  const TableHandler = () => {
    const { tableNumber } = useParams();
  
    useEffect(() => {
      if (tableNumber) {
        localStorage.setItem("tableNumber", tableNumber);
    //    console.log(localStorage.getItem("tableNumber"))
      }
    }, [tableNumber]);
  
    return <Home />;
  };

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem("tableNumber", tableNumber);
  //    console.log(localStorage.getItem("tableNumber"))
    }
  }, [tableNumber]);

  return (
      <DataProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path='/checkout' element={<CheckoutPage/>}/>
          <Route path="/:tableNumber" element={<TableHandler />} />
          <Route path="/order-confirmation" element={<OrderConfirmation/>} />
          <Route path='/fav' element={<HeartPage/>}/>
          <Route path='/orders' element={<OrderPage/>}/>
        </Routes>
        <Footer />
      </DataProvider>
  );
};

export default App;
