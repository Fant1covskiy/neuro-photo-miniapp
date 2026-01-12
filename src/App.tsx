import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import StylePage from './pages/StylePage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import UploadPage from './pages/UploadPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/style/:id" element={<StylePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/success/:orderId" element={<SuccessPage />} />
    </Routes>
  );
}

export default App;
