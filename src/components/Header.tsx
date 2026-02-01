import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-50">
       <Link to="/" className="font-bold text-lg text-gray-800 no-underline">
         NeuroPhoto
       </Link>
       <nav className="flex gap-4 text-sm font-medium">
         <Link to="/" className="text-gray-600 hover:text-blue-600 no-underline">
           Главная
         </Link>
         <Link to="/my-orders" className="text-gray-600 hover:text-blue-600 no-underline">
           Заказы
         </Link>
       </nav>
    </header>
  );
}