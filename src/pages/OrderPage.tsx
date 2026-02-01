import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { getOrder } from '../api/orders';

export default function OrderPage() {
  const params = useParams();
  // Пытаемся найти ID под разными именами (id или orderId)
  const orderId = params.orderId || params.id;
  
  const [paymentStatus, setPaymentStatus] = useState('waiting');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        if (!orderId) {
          setError('ID заказа не найден в ссылке (URL). Проверьте адрес.');
          setPaymentStatus('failed');
          return;
        }

        const order = await getOrder(Number(orderId));
        
        // Проверяем наличие ссылки в разных форматах (snake_case или camelCase)
        const link = order.payment_url || order.paymentUrl || order.url;

        if (link) {
          setQrCodeUrl(link);
        } else {
           // Если ссылки нет, но заказ есть - возможно, он уже оплачен или ошибка генерации
           if (order.status !== 'PAID') {
             console.warn('Ссылка на оплату не пришла с бэкенда', order);
           }
        }

        if (order.status === 'PAID') {
          setPaymentStatus('success');
          if (interval) clearInterval(interval);
        } else if (order.status === 'FAILED') {
          setPaymentStatus('failed');
          setError('Статус заказа: Ошибка (FAILED)');
          if (interval) clearInterval(interval);
        }
      } catch (err: any) {
        console.error(err);
        // Выводим ошибку на экран, чтобы ты сразу понял, в чем дело
        setError(err.message || 'Ошибка соединения с сервером');
        setPaymentStatus('failed');
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  const handlePaymentClick = () => {
    if (qrCodeUrl) {
      window.location.href = qrCodeUrl;
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Оплата прошла успешно!</h2>
        <p className="text-gray-600">Ваш заказ принят в работу.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Оплата через СБП</h2>
        
        {/* Блок ошибок - теперь ты увидишь текст, если что-то не так */}
        {error ? (
           <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4 w-full border border-red-200">
             ⚠️ {error}
           </div>
        ) : (
          <p className="text-gray-600 text-center mb-6 text-sm">
            Отсканируйте QR-код или нажмите кнопку ниже для оплаты
          </p>
        )}

        {qrCodeUrl ? (
          <>
            <div className="bg-white p-2 rounded-xl border border-gray-100 mb-6 shadow-inner">
              <QRCode value={qrCodeUrl} size={200} />
            </div>

            <button
              onClick={handlePaymentClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl active:scale-95 transition-transform shadow-md flex items-center justify-center space-x-2 mb-4"
            >
              <span>📱</span>
              <span>Оплатить через банк</span>
            </button>
            
            <p className="text-xs text-gray-400 text-center">
              Нажмите кнопку, чтобы выбрать банк на этом устройстве
            </p>
          </>
        ) : (
           /* Показываем спиннер только если нет ошибки и нет URL */
           !error && (
            <div className="w-full h-48 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-400">Генерируем ссылку на оплату...</p>
            </div>
           )
        )}

        <div className="w-full space-y-2 text-center mt-6 pt-4 border-t border-gray-100">
          {paymentStatus === 'waiting' && !error && qrCodeUrl && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-sm text-gray-500">Ожидаем подтверждения...</p>
            </div>
          )}
          
          <p className="text-xs text-gray-400">
            Заказ №{orderId || '...'}
          </p>
        </div>
      </div>
    </div>
  );
}