import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <Helmet><title>404 — IndabaX Kabale</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center">
          <h1 className="text-8xl font-black text-purple-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">The page you are looking for doesn't exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
