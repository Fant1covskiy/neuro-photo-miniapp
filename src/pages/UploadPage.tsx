import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const LS_KEY = 'pending_upload_photos_base64';

export default function UploadPage() {
  const navigate = useNavigate();
  const { cart, totalPrice } = useCart();
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cart.length) navigate('/catalog');
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) setPreviews(arr);
    } catch {}
  }, [cart.length, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + previews.length > 3) {
      alert('Максимум 3 фото');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleGoPay = async () => {
    if (previews.length === 0) {
      alert('Загрузите хотя бы одно фото');
      return;
    }

    const price = Number(totalPrice);
    if (!Number.isFinite(price) || price <= 0) {
      alert('Цена должна быть больше 0');
      return;
    }

    try {
      setSaving(true);
      localStorage.setItem(LS_KEY, JSON.stringify(previews));
      navigate('/order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" style={{ paddingBottom: '140px' }}>
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Загрузка фото</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Требования к фото</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Количество: 1-3 фотографии</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Формат: JPG, PNG</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Хорошее освещение и качество</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Ваши фото ({previews.length}/3)</h3>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {previews.length < 3 && (
            <label className="block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gradient-to-br from-purple-50 to-pink-50">
                <Upload className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-gray-800 font-semibold mb-1">Нажмите для загрузки</p>
                <p className="text-gray-600 text-sm">JPG или PNG, до 3 фото</p>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl" style={{ padding: '20px 16px', borderTop: '2px solid #e5e7eb' }}>
        <button
          onClick={handleGoPay}
          disabled={previews.length === 0 || saving}
          style={{ 
            width: '100%',
            padding: '20px 0',
            background: previews.length === 0 || saving 
              ? '#9ca3af' 
              : 'linear-gradient(to right, #4f46e5, #7c3aed, #ec4899)',
            color: 'white',
            borderRadius: '16px',
            fontSize: '20px',
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            cursor: previews.length === 0 || saving ? 'not-allowed' : 'pointer',
            minHeight: '64px',
            opacity: previews.length === 0 || saving ? 0.5 : 1
          }}
        >
          {saving ? 'Подготовка...' : 'Перейти к оплате'}
        </button>
      </div>
    </div>
  );
}
