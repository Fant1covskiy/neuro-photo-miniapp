import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function OrderPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'waiting' | 'paid' | 'failed'>('idle');

  useEffect(() => {
    if (!orderId) return;

    setPaymentStatus('waiting');

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/status`);
        const data = await res.json();

        if (data.status === 'paid') {
          clearInterval(interval);
          setPaymentStatus('paid');
          clearCart();
          setTimeout(() => navigate('/success'), 500);
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          clearInterval(interval);
          setPaymentStatus('failed');
        }
      } catch (e) {
        console.error('Status check error:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, clearCart, navigate]);

  const handleCreateOrderAndPay = async () => {
    if (!cart.length || isPaying) return;

    try {
      setIsPaying(true);

      // Получаем Telegram данные с fallback
      const tg = window.Telegram?.WebApp;
      const telegramUserId = tg?.initDataUnsafe?.user?.id?.toString() || 'test_123456789';
      const username = tg?.initDataUnsafe?.user?.username || 'test_user';
      const firstName = tg?.initDataUnsafe?.user?.first_name || 'Test User';

      console.log('📦 Creating order:', { telegramUserId, username, firstName, totalPrice });

      // Подсчитываем общее количество фото
      const totalImages = cart.length * 10; // Каждый стиль = 10 фото

      // Создаём заказ
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUserId,
          username,
          firstName,
          packageType: 'basic',
          imageCount: totalImages,
          totalPrice: totalPrice,
        }),
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        throw new Error(`Order creation failed: ${orderRes.status} - ${errorText}`);
      }

      const orderData = await orderRes.json();
      const newOrderId = orderData.id;
      setOrderId(newOrderId);

      console.log('✅ Order created:', newOrderId);

      // Получаем QR код
      const qrUrl = orderData.qrCodeUrl;
      
      if (!qrUrl) {
        throw new Error('QR code URL not received');
      }

      setQrCodeUrl(qrUrl);
      console.log('✅ QR code ready:', qrUrl);

    } catch (e) {
      console.error('❌ Payment error:', e);
      setPaymentStatus('failed');
      alert('Ошибка создания заказа. Попробуйте ещё раз.');
    } finally {
      setIsPaying(false);
    }
  };

  if (!cart.length && !orderId) {
    navigate('/catalog');
    return null;
  }

  // Подсчёт общего количества фото
  const totalImages = cart.length * 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24">
      <div className="px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Оплата заказа</h1>
        
        {!orderId && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Выбрано стилей: <span className="font-bold">{cart.length}</span>
                </p>
                <p className="text-gray-600">
                  Количество фотографий: <span className="font-bold">{totalImages}</span>
                </p>
                <p className="text-gray-600">
                  Сумма к оплате: <span className="font-bold text-2xl text-indigo-600">{totalPrice.toFixed(0)} ₽</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateOrderAndPay}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPaying}
            >
              {isPaying ? 'Создаём заказ...' : 'Перейти к оплате через СБП'}
            </button>
          </>
        )}

        {orderId && qrCodeUrl && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Оплата через СБП</h2>
            <p className="text-gray-600 text-center mb-4">
              Отсканируйте QR-код в приложении вашего банка
            </p>
            
            <div className="bg-white p-4 rounded-xl shadow-md">
              <QRCode value={qrCodeUrl} size={240} />
            </div>

            <div className="mt-6 text-center space-y-2">
              {paymentStatus === 'waiting' && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-gray-600">
                    Ожидаем оплату...
                  </p>
                </div>
              )}
              
              {paymentStatus === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">
                    ❌ Оплата не прошла. Попробуйте ещё раз или обратитесь в поддержку.
                  </p>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Вернуться к каталогу
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Заказ №{orderId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
