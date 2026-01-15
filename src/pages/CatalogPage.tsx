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
  preview_image: string[] | null;
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
      const url = categoryId ? `/styles?category_id=${categoryId}` : '/styles';
      const response = await apiClient.get<Style[]>(url);
      setStyles(response.data);
    } catch (error) {
      console.error('Error loading styles:', error);
      setStyles([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Каталог стилей</h1>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex-shrink-0 ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 pb-20">
        <p className="text-gray-600 text-sm mb-4 font-medium">
          Найдено стилей: {styles.length}
        </p>

        {styles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {styles.map((style) => {
              const mainImage =
                Array.isArray(style.preview_image) &&
                style.preview_image.length > 0
                  ? style.preview_image[0]
                  : '';

              return (
                <div
                  key={style.id}
                  onClick={() => navigate(`/style/${style.id}`)}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden active:scale-95 transition-all cursor-pointer hover:shadow-md"
                >
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                    {mainImage ? (
                      <img
                        src={mainImage}
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
                    <p className="text-gray-500 text-xs font-medium">
                      от {style.price} ₽
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm">
            <Sparkles className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">Стили не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
