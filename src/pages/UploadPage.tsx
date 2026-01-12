import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function UploadPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/catalog');
    }
  }, [cart.length, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 3) {
      alert('Максимум 3 фото');
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Загрузите хотя бы одно фото');
      return;
    }

    // Генерируем номер заказа
    const orderId = Math.floor(100000 + Math.random() * 900000);

    // TODO: Здесь должна быть отправка на сервер
    // const formData = new FormData();
    // selectedFiles.forEach((file, index) => {
    //   formData.append(`photo${index}`, file);
    // });
    // formData.append('styles', JSON.stringify(cart));
    // formData.append('total', totalPrice.toString());
    
    // await fetch('http://localhost:3000/orders', {
    //   method: 'POST',
    //   body: formData,
    // });

    // СНАЧАЛА переходим на страницу успеха
    navigate(`/success/${orderId}`);
    
    // ПОТОМ очищаем корзину (с небольшой задержкой)
    setTimeout(() => {
      clearCart();
    }, 100);
  };

  if (cart.length === 0) {
    return null;
  }

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
          <h1 className="text-xl font-bold text-gray-800">Загрузка фото</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* Инструкция */}
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

        {/* Загрузка фото */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Ваши фото ({selectedFiles.length}/3)</h3>
          
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

          {selectedFiles.length < 3 && (
            <label className="block">
              <input
                type="file"
                accept="image/jpeg,image/png"
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

        {/* Итоговая сумма */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-3">Детали заказа</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Количество фото:</span>
              <span className="font-semibold text-gray-800">{selectedFiles.length} шт</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Срок выполнения:</span>
              <span className="font-semibold text-gray-800">24 часа</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Формат:</span>
              <span className="font-semibold text-gray-800">JPG, PNG</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="font-bold text-gray-800">Итого к оплате:</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {Number(totalPrice).toFixed(2)} ₽
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
        <button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  );
}
