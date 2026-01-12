import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShoppingCart } from 'lucide-react';
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
  const itemCount = cart.length;
  const { user, tg } = useTelegram();
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
      const response = await apiClient.get('/styles?limit=8');
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
      const filtered = allStyles.filter(style => 
        style.name.toLowerCase().includes(query) ||
        style.description.toLowerCase().includes(query)
      ).slice(0, 5);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-8">
      <div className="relative h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&h=1080&fit=crop')"}}
        />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl font-black text-white mb-3 drop-shadow-2xl">
            {user ? `Привет, ${user.first_name}! 👋` : 'НейроФото'}
          </h1>

          <p className="text-base text-white/90 mb-6 max-w-md font-medium drop-shadow-lg">
            Создай фото в любом стиле за секунды с помощью нейросети
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div ref={searchRef} className="relative mb-2.5">
              <input
                type="text"
                placeholder="Поиск по стилям..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                className="w-full px-4 py-3 bg-white/95 backdrop-blur-lg rounded-xl border-2 border-white/50 focus:border-white focus:outline-none shadow-xl text-gray-800 placeholder-gray-400 text-sm"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((style, index) => (
                    <div
                      key={style.id}
                      onClick={() => handleSelectSuggestion(style)}
                      className="flex items-center gap-3 p-3 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={style.preview_image || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                          alt={style.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{style.name}</h4>
                        <p className="text-purple-600 font-bold text-xs">{style.price} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all"
            >
              Найти стиль
            </button>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path
              fill="#fdf2f8"
              d="M0,40L80,45C160,50,320,60,480,56C640,52,800,36,960,32C1120,28,1280,36,1360,40L1440,44L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"
            />
          </svg>
        </div>
      </div>

      <div className="px-4 py-8 relative">
        <button
          onClick={() => navigate('/cart')}
          className="fixed top-4 right-4 z-50 bg-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-purple-100"
        >
          <ShoppingCart className="w-5 h-5 text-purple-600" />
          {itemCount > 0 && (
            <>
              <span className="text-purple-600 font-bold text-sm">{itemCount}</span>
              <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Популярные стили</h2>
            <p className="text-gray-500 text-xs">Выбор пользователей</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-5">
          {displayedStyles.map((style, index) => (
            <div
              key={style.id}
              onClick={() => navigate(`/style/${style.id}`)}
              className="group relative bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl active:scale-[0.98] flex"
            >
              <div className="w-32 h-32 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={style.preview_image || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base mb-1 text-gray-800 line-clamp-1">
                    {style.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold text-xl">
                    {style.price} ₽
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`transition-all ${
                  idx === currentPage
                    ? 'w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-md'
                    : 'w-8 h-8 bg-white text-gray-600 font-medium rounded-lg shadow-sm'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/catalog')}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Все стили
        </button>
      </div>
    </div>
  );
}
