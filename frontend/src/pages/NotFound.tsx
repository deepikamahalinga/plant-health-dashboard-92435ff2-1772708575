import { FC } from 'react';
import { Link } from 'react-router-dom';

const NotFound: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Icon/Illustration */}
        <div className="mb-8">
          <svg
            className="w-40 h-40 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          Oops! Page Not Found
        </h2>

        {/* Helpful Message */}
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
          Here are some helpful links:
        </p>

        {/* Navigation Suggestions */}
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full sm:w-auto bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Return Home
          </Link>

          <div className="flex flex-col sm:flex-row justify-center gap-4 text-gray-600">
            <Link
              to="/contact"
              className="hover:text-indigo-600 transition-colors duration-200"
            >
              Contact Support
            </Link>
            <Link
              to="/sitemap"
              className="hover:text-indigo-600 transition-colors duration-200"
            >
              View Sitemap
            </Link>
            <Link
              to="/search"
              className="hover:text-indigo-600 transition-colors duration-200"
            >
              Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;