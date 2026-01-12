import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function SuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-6">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Успешно!
      </h1>
      
      {/* Order ID */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 mb-6">
        <p className="text-sm text-gray-500 mb-1 text-center">Номер заказа:</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          #{orderId}
        </p>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-center mb-8 max-w-sm">
        Ваши фото отправлены в обработку. Готовый результат будет отправлен вам в течение <span className="font-bold text-gray-800">24 часов</span>
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          На главную
        </button>
        <button
          onClick={() => WebApp.close()}
          className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
        >
          Закрыть приложение
        </button>
      </div>
    </div>
  );
}
