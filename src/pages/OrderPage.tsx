import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function OrderPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'waiting' | 'paid' | 'failed'>('idle');

  useEffect(() => {
    if (!orderId) return;

    setPaymentStatus('waiting');

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/payments/tochka/status/${orderId}`);
        const data = await res.json();

        if (data.payment_status === 'PAID') {
          clearInterval(interval);
          setPaymentStatus('paid');
          clearCart();
          navigate('/success');
        } else if (data.payment_status === 'FAILED') {
          clearInterval(interval);
          setPaymentStatus('failed');
        }
      } catch (e) {
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, clearCart, navigate]);

  const handleCreateOrderAndPay = async () => {
    if (!cart.length || isPaying) return;

    try {
      setIsPaying(true);

      const photos: string[] = [];
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || '';
      const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '';
      const first_name = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || '';

      const createOrderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('telegram_user_id', telegramUserId);
          formData.append('username', username);
          formData.append('first_name', first_name);
          formData.append('total_price', totalPrice.toFixed(2));
          formData.append('styles', JSON.stringify(cart));
          photos.forEach((p, i) => formData.append('photos', p));
          return formData;
        })(),
      });

      const createdOrder = await createOrderRes.json();
      const newOrderId = createdOrder.id as number;
      setOrderId(newOrderId);

      const qrRes = await fetch(`${API_URL}/payments/tochka/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newOrderId }),
      });

      const qrData = await qrRes.json();
      setQrPayload(qrData.qrPayload);
    } catch (e) {
      setPaymentStatus('failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (!cart.length && !orderId) {
    navigate('/catalog');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24">
      <div className="px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Оплата заказа</h1>
        {!orderId && (
          <>
            <p className="text-gray-600">
              Сумма к оплате: <span className="font-bold">{totalPrice.toFixed(2)} ₽</span>
            </p>
            <button
              onClick={handleCreateOrderAndPay}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg"
              disabled={isPaying}
            >
              Перейти к оплате через СБП
            </button>
          </>
        )}

        {orderId && qrPayload && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Оплата через СБП</h2>
            <p className="text-gray-600 text-center mb-4">
              Отсканируйте QR-код в приложении банка, чтобы оплатить заказ.
            </p>
            <QRCode value={qrPayload} size={240} />
            <p className="mt-4 text-sm text-gray-500">
              После оплаты окно автоматически обновится.
            </p>
            {paymentStatus === 'failed' && (
              <p className="mt-2 text-sm text-red-600">
                Оплата не прошла. Попробуйте ещё раз или обратитесь в поддержку.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
