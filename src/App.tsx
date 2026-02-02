import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import MyOrdersPage from './pages/MyOrdersPage';
import SuccessPage from './pages/SuccessPage';
import UploadPage from './pages/UploadPage';
import StylePage from './pages/StylePage';
import { useTelegram } from './hooks/useTelegram';
import './App.css';

function App() {
  const { tg } = useTelegram();

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  const minHeight = tg?.viewportStableHeight 
    ? `${tg.viewportStableHeight}px` 
    : '100vh';

  return (
    <div style={{ minHeight, width: '100%' }} className="bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/success/:orderId" element={<SuccessPage />} />
        <Route path="/style/:id" element={<StylePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
