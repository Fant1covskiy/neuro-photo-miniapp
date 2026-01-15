import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';

interface Style {
  id: number;
  name: string;
  description: string;
  price: number;
  preview_image: string | null;
  category_id: number;
  category?: {
    name: string;
  };
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop',
];

function SwipeImage({
  images,
  currentIndex,
  setCurrentIndex,
  title,
}: {
  images: string[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  title: string;
}) {
  const startXRef = useRef<number | null>(null);
  const minSwipeDistance = 40;

  const handleStart = (clientX: number) => {
    startXRef.current = clientX;
  };

  const handleEnd = (clientX: number) => {
    if (startXRef.current === null) return;
    const diff = clientX - startXRef.current;
    startXRef.current = null;
    if (Math.abs(diff) < minSwipeDistance) return;
    if (diff < 0 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (diff > 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <div
        className="w-full bg-black flex items-center justify-center select-none"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseUp={(e) => handleEnd(e.clientX)}
        onMouseLeave={() => {
          startXRef.current = null;
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
      >
        <img
          src={images[currentIndex]}
          alt={title}
          className="w-full h-auto max-h-[360px] object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-1 py-3 bg-white">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-purple-600 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function StylePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [style, setStyle] = useState<Style | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadStyle();
  }, [id]);

  const loadStyle = async () => {
    try {
      const response = await apiClient.get(`/styles/${id}`);
      setStyle(response.data);
    } catch (error) {
      console.error('Error loading style:', error);
    }
  };

  const handleAddToCart = () => {
    if (style) {
      addToCart(style);
    }
  };

  const isInCart = style ? cart.some((item) => item.id === style.id) : false;

  if (!style) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const images = [style.preview_image || PLACEHOLDER_IMAGES[0], ...PLACEHOLDER_IMAGES.slice(1, 4)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-32">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{style.name}</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              {style.name}
            </h2>
            {style.category && (
              <div className="flex justify-center mb-3">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                  {style.category.name}
                </span>
              </div>
            )}
          </div>

          <SwipeImage
            images={images}
            currentIndex={currentImageIndex}
            setCurrentIndex={setCurrentImageIndex}
            title={style.name}
          />

          <div className="px-4 pb-4 pt-1 flex items-center justify-center">
            <span className="text-purple-600 font-bold text-2xl">
              {style.price} ₽
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-2 text-center">Описание</h3>
          <p className="text-gray-600 leading-relaxed text-center">
            {style.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 text-center">
            Детали заказа
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Срок выполнения:</span>
              <span className="font-semibold text-gray-800">24 часа</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Количество фото:</span>
              <span className="font-semibold text-gray-800">1-3 шт</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Формат:</span>
              <span className="font-semibold text-gray-800">JPG, PNG</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 pb-6 px-4">
        {isInCart ? (
          <button
            onClick={() => navigate('/cart')}
            className="px-16 py-4 bg-green-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <Check className="w-6 h-6" />
            В корзине - Перейти к оформлению
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="px-16 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <ShoppingCart className="w-6 h-6" />
            Добавить в корзину
          </button>
        )}
      </div>
    </div>
  );
}
