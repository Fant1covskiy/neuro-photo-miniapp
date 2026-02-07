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
  preview_image: string[] | null;
  category_id: number;
  category?: {
    name: string;
  };
}

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
  const isDownRef = useRef(false);
  const minSwipeDistance = 40;

  const handlePointerDown = (clientX: number) => {
    startXRef.current = clientX;
    isDownRef.current = true;
  };

  const handlePointerMove = () => {
    if (!isDownRef.current || startXRef.current === null) return;
  };

  const handlePointerUp = (clientX: number) => {
    if (!isDownRef.current || startXRef.current === null) return;

    const diff = clientX - startXRef.current;

    isDownRef.current = false;
    startXRef.current = null;

    if (Math.abs(diff) < minSwipeDistance) return;

    if (diff < 0 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (diff > 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-full bg-gray-100 flex items-center justify-center select-none">
        <div className="w-full h-auto max-h-[500px] bg-gray-200" />
      </div>
    );
  }

  return (
    <>
      <div
        className="w-full bg-white flex items-center justify-center select-none"
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={() => handlePointerMove()}
        onMouseUp={(e) => handlePointerUp(e.clientX)}
        onMouseLeave={(e) => {
          if (!isDownRef.current) return;
          handlePointerUp(e.clientX);
        }}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={() => handlePointerMove()}
        onTouchEnd={(e) => handlePointerUp(e.changedTouches[0].clientX)}
      >
        <img
          src={images[currentIndex]}
          alt={title}
          className="w-full h-auto max-h-[500px] object-contain"
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
      const response = await apiClient.get<Style>(`/styles/${id}`);
      setStyle(response.data);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Error loading style:', error);
    }
  };

  const handleAddToCart = () => {
    if (!style) return;

    const mainImage =
      Array.isArray(style.preview_image) && style.preview_image.length > 0
        ? style.preview_image[0]
        : style.preview_image || '';

    addToCart({
      ...style,
      preview_image: mainImage,
    } as any);
  };

  const isInCart = style ? cart.some((item) => item.id === style.id) : false;

  if (!style) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  };

  const images = Array.isArray(style.preview_image)
    ? style.preview_image
    : style.preview_image
    ? [style.preview_image]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-36">
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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-6 shadow-2xl">
        {isInCart ? (
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-6 bg-green-600 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Check className="w-7 h-7" />
            В корзине - Перейти к оформлению
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-7 h-7" />
            Добавить в корзину
          </button>
        )}
      </div>
    </div>
  );
}
