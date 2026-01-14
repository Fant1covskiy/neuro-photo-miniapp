import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Clock, CheckCircle, Download, AlertCircle } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';
import apiClient from '../api/client';

interface Order {
  id: number;
  telegram_user_id: string;
  username: string;
  first_name: string;
  total_price: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  photos: string[];
  result_photos: string[] | null;
  styles: string | Array<{ id: number; name: string; price: number }>;
  created_at: string;
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/orders/user/${user?.id}`);
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseStyles = (styles: string | Array<{ id: number; name: string; price: number }>) => {
    if (typeof styles === 'string') {
      try {
        return JSON.parse(styles);
      } catch (e) {
        console.error('Error parsing styles:', e);
        return [];
      }
    }
    return styles;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          text: 'Ожидает',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        };
      case 'processing':
        return {
          icon: <Package className="w-5 h-5 text-blue-600" />,
          text: 'В обработке',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'Готово',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      case 'cancelled':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          text: 'Отменён',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          text: 'Неизвестно',
          color: 'bg-gray-50 border-gray-200 text-gray-800'
        };
    }
  };

  const downloadImage = async (filename: string, index: number) => {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/uploads/results/${filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `result_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Мои заказы</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {!user?.id ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ошибка авторизации</h3>
            <p className="text-gray-600">Откройте приложение через Telegram бота</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка заказов...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Заказов пока нет</h3>
            <p className="text-gray-600 mb-6">Создайте свой первый заказ</p>
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const styles = parseStyles(order.styles);
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Заказ</p>
                      <p className="text-lg font-bold text-gray-800">#{order.id}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="text-xs font-semibold">{statusInfo.text}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Стили:</span>
                      <span className="font-semibold text-gray-800">
                        {styles.map((s: any) => s.name).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Сумма:</span>
                      <span className="font-semibold text-gray-800">{order.total_price} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Дата:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  {order.status === 'completed' && order.result_photos && order.result_photos.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-sm font-semibold text-gray-800 mb-3">✨ Готовые фото:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {order.result_photos.map((filename, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                            <img 
                              src={`${apiClient.defaults.baseURL}/uploads/results/${filename}`} 
                              alt={`Result ${index + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                            <button
                              onClick={() => downloadImage(filename, index)}
                              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-8 h-8 text-white mb-1" />
                              <span className="text-xs text-white font-medium">Скачать</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
