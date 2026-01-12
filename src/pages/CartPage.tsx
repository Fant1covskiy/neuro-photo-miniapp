import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop'
];

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, totalPrice } = useCart();

  const handleCheckout = () => {
    if (cart.length > 0) {
      navigate('/order');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Корзина</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Корзина пуста</h2>
          <p className="text-gray-600 text-center mb-8">
            Добавьте стили, чтобы оформить заказ
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Перейти в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-48">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Корзина</h1>
          <span className="ml-auto bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            {cart.length}
          </span>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="space-y-3">
          {cart.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex"
            >
              <div className="w-32 h-32 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={item.preview_image || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base mb-1 text-gray-800 line-clamp-1">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-gray-500 text-xs line-clamp-1">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold text-xl">
                    {Number(item.price || 0).toFixed(2)} ₽
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
        <div className="p-6">
          <div className="flex items-baseline justify-center gap-2 mb-5">
            <span className="text-gray-600 font-medium text-lg">Итого:</span>
            <span className="text-4xl font-bold text-purple-600">{Number(totalPrice || 0).toFixed(2)} ₽</span>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleCheckout}
              className="w-full max-w-md py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Перейти к оплате
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
