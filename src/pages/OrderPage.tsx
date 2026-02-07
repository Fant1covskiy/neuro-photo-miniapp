import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { ExternalLink, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || 'https://neuro-photo-backend-production.up.railway.app';
const LS_KEY = 'pending_upload_photos_base64';
const ORDER_ID_KEY = 'current_order_id';

function dataUrlToFile(dataUrl: string, name: string) {
  const [meta, base64] = dataUrl.split(',');
  const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

function extractDeepLink(qrUrl: string): string {
  try {
    const url = new URL(qrUrl);
    const linkParam = url.searchParams.get('link');
    if (linkParam) {
      return decodeURIComponent(linkParam);
    }
    
    if (qrUrl.startsWith('bank100000000111://') || qrUrl.startsWith('https://qr.nspk.ru/')) {
      return qrUrl;
    }
    
    return qrUrl;
  } catch {
    return qrUrl;
  }
}

export default function OrderPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'waiting' | 'paid' | 'failed'>('idle');
  const [copied, setCopied] = useState(false);

  const pendingPhotos = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? (arr as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      const saved = sessionStorage.getItem(ORDER_ID_KEY);
      if (saved) {
        setOrderId(Number(saved));
      }
    }
  }, [orderId]);

  useEffect(() => {
    if (!pendingPhotos.length && !orderId) {
      navigate('/upload');
    }
  }, [pendingPhotos.length, orderId, navigate]);

  useEffect(() => {
    if (!orderId) return;

    setPaymentStatus('waiting');

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/status`);
        const data = await res.json();

        if (data.paymentStatus === 'paid') {
          clearInterval(interval);
          setPaymentStatus('paid');

          try {
            const fd = new FormData();
            pendingPhotos.slice(0, 3).forEach((p, idx) => {
              fd.append('photos', dataUrlToFile(p, `photo-${idx + 1}.jpg`));
            });

            await apiClient.post(`/api/orders/${orderId}/photos`, fd);
            
            localStorage.removeItem(LS_KEY);
            sessionStorage.removeItem(ORDER_ID_KEY);
            clearCart();
            
            navigate(`/success/${orderId}`, { replace: true });
          } catch (e) {
            alert('Оплата прошла, но загрузка фото не удалась. Попробуйте ещё раз.');
            navigate('/upload');
          }
        } else if (data.paymentStatus === 'failed') {
          clearInterval(interval);
          setPaymentStatus('failed');
        }
      } catch (e) {
        console.error('Error checking payment status:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, pendingPhotos, clearCart, navigate]);

  const handleCreateOrderAndPay = async () => {
    if (!cart.length || isPaying) return;

    if (!pendingPhotos.length) {
      navigate('/upload');
      return;
    }

    const price = Number(totalPrice);
    if (!Number.isFinite(price) || price <= 0) {
      alert('Цена должна быть больше 0');
      return;
    }

    try {
      setIsPaying(true);

      const tg = (window as any).Telegram?.WebApp;
      const telegramUserId = tg?.initDataUnsafe?.user?.id?.toString() || 'test_123456789';
      const username = tg?.initDataUnsafe?.user?.username || 'test_user';
      const firstName = tg?.initDataUnsafe?.user?.first_name || 'Test User';

      const response = await apiClient.post('/api/orders', {
        telegramUserId,
        username,
        firstName,
        styles: cart,
        price,
      });

      const data = response.data;
      setOrderId(data.id);
      setQrCodeUrl(data.qrCodeUrl);
      
      console.log('QR URL:', data.qrCodeUrl);
      
      sessionStorage.setItem(ORDER_ID_KEY, String(data.id));
    } catch (e) {
      setPaymentStatus('failed');
      alert('Ошибка создания заказа. Попробуйте ещё раз.');
    } finally {
      setIsPaying(false);
    }
  };

  const openPaymentLink = () => {
    if (!qrCodeUrl) return;

    const deepLink = extractDeepLink(qrCodeUrl);
    console.log('Opening deeplink:', deepLink);

    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.openLink) {
        tg.openLink(deepLink);
      } else {
        window.location.href = deepLink;
      }
    } catch {
      window.location.href = deepLink;
    }
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const deepLink = extractDeepLink(qrCodeUrl);
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Не удалось скопировать');
    }
  };

  if (!cart.length && !orderId && paymentStatus === 'idle') {
    navigate('/catalog');
    return null;
  }

  const totalImages = cart.length * 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24">
      <div className="px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Оплата заказа</h1>

        {!orderId && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Загружено фото: <span className="font-bold">{pendingPhotos.length}</span>
                </p>
                <p className="text-gray-600">
                  Выбрано стилей: <span className="font-bold">{cart.length}</span>
                </p>
                <p className="text-gray-600">
                  Количество фотографий: <span className="font-bold">{totalImages}</span>
                </p>
                <p className="text-gray-600">
                  Сумма к оплате:{' '}
                  <span className="font-bold text-2xl text-indigo-600">{Number(totalPrice).toFixed(0)} ₽</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateOrderAndPay}
              disabled={isPaying}
              style={{ 
                width: '100%',
                padding: '20px 0',
                background: isPaying 
                  ? '#9ca3af' 
                  : 'linear-gradient(to right, #4f46e5, #7c3aed)',
                color: 'white',
                borderRadius: '16px',
                fontSize: '20px',
                fontWeight: 'bold',
                border: 'none',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                cursor: isPaying ? 'not-allowed' : 'pointer',
                minHeight: '64px',
                opacity: isPaying ? 0.5 : 1
              }}
            >
              {isPaying ? 'Создаём заказ...' : 'Перейти к оплате через СБП'}
            </button>
          </>
        )}

        {orderId && qrCodeUrl && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Оплата через СБП</h2>
            <p className="text-gray-600 text-center mb-4">Отсканируйте QR-код или нажмите кнопку ниже</p>

            <div className="bg-white p-4 rounded-xl shadow-md">
              <QRCode value={qrCodeUrl} size={240} />
            </div>

            <div className="w-full space-y-4 mt-6">
              <button
                onClick={openPaymentLink}
                style={{ 
                  width: '100%',
                  padding: '20px 0',
                  background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                  color: 'white',
                  borderRadius: '16px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  minHeight: '64px'
                }}
              >
                <ExternalLink style={{ width: '28px', height: '28px' }} />
                Открыть приложение банка
              </button>

              <button
                onClick={copyToClipboard}
                style={{ 
                  width: '100%',
                  padding: '20px 0',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '16px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  border: '2px solid #d1d5db',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  minHeight: '64px'
                }}
              >
                <Copy style={{ width: '24px', height: '24px' }} />
                {copied ? 'Скопировано!' : 'Скопировать ссылку'}
              </button>
            </div>

            <div className="mt-6 text-center space-y-2">
              {paymentStatus === 'waiting' && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 h-5 w-5 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-gray-600">Ожидаем оплату...</p>
                </div>
              )}
              {paymentStatus === 'failed' && <p className="text-sm text-red-600">Оплата не прошла. Попробуйте ещё раз.</p>}
              <p className="text-xs text-gray-500">Заказ №{orderId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
