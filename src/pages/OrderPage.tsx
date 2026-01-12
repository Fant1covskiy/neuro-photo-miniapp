import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop'
];

export default function OrderPage() {
  const navigate = useNavigate();
  const { cart, totalPrice } = useCart();

  if (cart.length === 0) {
    navigate('/catalog');
    return null;
  }

  const handleContinue = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Оформление заказа</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* Список стилей из корзины */}
        <div className="space-y-3 mb-6">
          {cart.map((style, index) => (
            <div key={style.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex">
              <div className="w-32 h-32 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={style.preview_image || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-lg mb-1 text-gray-800">{style.name}</h2>
                  {style.description && (
                    <p className="text-gray-600 text-xs line-clamp-2">{style.description}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold text-xl">
                    {Number(style.price).toFixed(2)} ₽
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Следующий шаг</h3>
              <p className="text-gray-600 text-sm">Загрузите ваше фото</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              На следующем шаге вам нужно будет загрузить фотографию, которую вы хотите обработать в выбранном стиле. Результат будет готов в течение 24 часов.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Итого к оплате</h3>
          <div className="space-y-3">
            {cart.map((style) => (
              <div key={style.id} className="flex items-center justify-between">
                <span className="text-gray-600">Стиль: {style.name}</span>
                <span className="font-semibold text-gray-800">{Number(style.price).toFixed(2)} ₽</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-800">Итого</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {Number(totalPrice).toFixed(2)} ₽
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
        <button
          onClick={handleContinue}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
