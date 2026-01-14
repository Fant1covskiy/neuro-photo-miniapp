import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import StylePage from './pages/StylePage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import SuccessPage from './pages/SuccessPage';
import UploadPage from './pages/UploadPage';
import MyOrdersPage from './pages/MyOrdersPage';

function App() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-200 to-slate-300">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl overflow-hidden relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/style/:id" element={<StylePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/success/:orderId" element={<SuccessPage />} />
          <Route path="/upload/:orderId" element={<UploadPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
