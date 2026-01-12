import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';
import apiClient from '../api/client';

interface Category {
  id: number;
  name: string;
}

interface Style {
  id: number;
  name: string;
  preview_image: string;
  price: number;
  category?: Category;
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const { tg } = useTelegram();
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
    loadStyles();
  }, []);

  useEffect(() => {
    if (selectedCategory !== null) {
      loadStyles(selectedCategory);
    } else {
      loadStyles();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/'));
      
      return () => {
        tg.BackButton.hide();
      };
    }
  }, [tg, navigate]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStyles = async (categoryId?: number) => {
    try {
      const url = categoryId 
        ? `/styles?category_id=${categoryId}`
        : '/styles';
      const response = await apiClient.get(url);
      setStyles(response.data);
    } catch (error) {
      console.error('Error loading styles:', error);
      setStyles([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Каталог стилей</h1>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-white text-purple-600 font-bold'
                : 'bg-white/20 text-white'
            }`}
          >
            Все
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-white text-purple-600 font-bold'
                  : 'bg-white/20 text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Styles Grid */}
      <div className="px-6 mt-6">
        <p className="text-gray-600 mb-4">Найдено стилей: {styles.length}</p>

        {styles.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {styles.map((style) => (
              <div
                key={style.id}
                onClick={() => navigate(`/style/${style.id}`)}
                className="bg-white rounded-2xl shadow-md overflow-hidden active:scale-95 transition-transform cursor-pointer"
              >
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                  {style.preview_image ? (
                    <img
                      src={style.preview_image}
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                    {style.name}
                  </h3>
                  {style.category && (
                    <p className="text-xs text-purple-600 mb-2">{style.category.name}</p>
                  )}
                  <p className="text-purple-600 font-bold text-lg">{style.price} ₽</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl">
            Стили не найдены
          </div>
        )}
      </div>
    </div>
  );
}
