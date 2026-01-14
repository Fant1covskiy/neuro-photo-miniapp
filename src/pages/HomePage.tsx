import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTelegram } from '../hooks/useTelegram';
import apiClient from '../api/client';

interface Style {
  id: number;
  name: string;
  description: string;
  price: number;
  preview_image: string | null;
  category_id: number;
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop'
];

export default function HomePage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { tg } = useTelegram();
  const [styles, setStyles] = useState<Style[]>([]);
  const [allStyles, setAllStyles] = useState<Style[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Style[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPopularStyles();
    loadAllStyles();
  }, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPopularStyles = async () => {
    try {
      const response = await apiClient.get('/styles');
      setStyles(response.data);
    } catch (error) {
      console.error('Error loading styles:', error);
    }
  };

  const loadAllStyles = async () => {
    try {
      const response = await apiClient.get('/styles');
      setAllStyles(response.data);
    } catch (error) {
      console.error('Error loading all styles:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (value.trim().length > 0) {
      const query = value.toLowerCase();
      const filtered = allStyles
        .filter(
          (style) =>
            style.name.toLowerCase().includes(query) ||
            style.description.toLowerCase().includes(query)
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (style: Style) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/style/${style.id}`);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const query = searchQuery.trim();
    setShowSuggestions(false);

    if (query) {
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/catalog');
    }
  };

  const stylesPerPage = 4;
  const totalPages = Math.ceil(styles.length / stylesPerPage);
  const displayedStyles = styles.slice(
    currentPage * stylesPerPage,
    (currentPage + 1) * stylesPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Кнопка корзины */}
      <button
        onClick={() => navigate('/cart')}
        className="fixed top-4 right-4 z-50 bg-white px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5"
      >
        <ShoppingCart className="w-5 h-5 text-gray-700" />
        {cart.length > 0 && (
          <span className="text-gray-700 font-semibold text-sm">{cart.length}</span>
        )}
      </button>

      {/* Кнопка Мои заказы */}
      <button
        onClick={() => navigate('/my-orders')}
        className="fixed top-3 right-20 z-50 bg-white px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-200"
      >
        <Package className="w-5 h-5 text-gray-700" />
      </button>

      {/* Героическая секция */}
      <div className="relative h-[340px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&h=1080&fit=crop')"
          }}
        />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-3xl font-black text-white mb-2 drop-shadow-2xl">
            НейроФото
          </h1>

          <p className="text-sm text-white/90 mb-5 max-w-xs font-medium drop-shadow-lg">
            Создай фото в любом стиле за секунды с помощью нейросети
          </p>

          {/* Поиск + кнопка на одной линии */}
          <form onSubmit={handleSearch} className="w-full max-w-xs">
            <div ref={searchRef} className="relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Поиск по стилям..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="flex-1 h-10 px-4 bg-white/95 backdrop-blur-sm rounded-full border border-white/50 focus:border-white focus:outline-none shadow-lg text-gray-800 placeholder-gray-400 text-sm"
                />

                <button
                  type="submit"
                  className="h-10 px-4 bg-blue-600 text-white rounded-full font-semibold text-sm shadow-lg hover:bg-blue-700 active:scale-[0.97] transition-all whitespace-nowrap"
                >
                  Выбрать стиль
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((style, index) => (
                    <div
                      key={style.id}
                      onClick={() => handleSelectSuggestion(style)}
                      className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={
                            style.preview_image ||
                            PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]
                          }
                          alt={style.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {style.name}
                        </h4>
                        <p className="text-blue-600 font-bold text-xs">
                          от {style.price} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Популярные стили */}
      <div className="px-4 py-6 bg-gradient-to-b from-pink-50 to-white">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Популярные стили</h2>
            <p className="text-gray-500 text-xs">Выбор пользователей</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {displayedStyles.map((style, index) => (
            <div
              key={style.id}
              onClick={() => navigate(`/style/${style.id}`)}
              className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={
                    style.preview_image ||
                    PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]
                  }
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="px-3 py-2">
                <h3 className="font-bold text-sm text-gray-800 line-clamp-1 mb-0.5">
                  {style.name}
                </h3>
                <p className="text-gray-500 text-xs">от {style.price} ₽</p>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-4">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`transition-all ${
                  idx === currentPage
                    ? 'w-7 h-7 bg-blue-600 text-white font-bold rounded-lg shadow-md'
                    : 'w-7 h-7 bg-white text-gray-600 font-medium rounded-lg shadow-sm'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/catalog')}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all"
        >
          Все стили
        </button>
      </div>
    </div>
  );
}
