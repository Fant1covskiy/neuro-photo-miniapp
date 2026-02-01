import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { getOrder } from '../api/orders';

export default function OrderPage() {
  const { orderId } = useParams();
  const [paymentStatus, setPaymentStatus] = useState('waiting');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        if (!orderId) return;
        const order = await getOrder(Number(orderId));
        
        if (order.payment_url) {
          setQrCodeUrl(order.payment_url);
        }

        if (order.status === 'PAID') {
          setPaymentStatus('success');
          clearInterval(interval);
        } else if (order.status === 'FAILED') {
          setPaymentStatus('failed');
          clearInterval(interval);
        }
      } catch (error) {
        console.error(error);
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
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
        <p className="text-gray-600 text-center mb-6 text-sm">
          Отсканируйте QR-код или нажмите кнопку ниже для оплаты
        </p>

        {qrCodeUrl ? (
          <>
            <div className="bg-white p-2 rounded-xl border border-gray-100 mb-6">
              <QRCode value={qrCodeUrl} size={200} />
            </div>

            <button
              onClick={handlePaymentClick}
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl active:scale-95 transition-transform shadow-md flex items-center justify-center space-x-2 mb-4"
            >
              <span>📱</span>
              <span>Оплатить через банк</span>
            </button>
          </>
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="w-full space-y-2 text-center">
          {paymentStatus === 'waiting' && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-sm text-gray-500">Ожидаем оплату...</p>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <p className="text-sm text-red-500 font-medium">
              Ошибка оплаты. Попробуйте создать заказ заново.
            </p>
          )}
          
          <p className="text-xs text-gray-400 mt-4">
            Заказ №{orderId}
          </p>
        </div>
      </div>
    </div>
  );
}