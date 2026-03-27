import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          <button
            style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </button>
      </div>
    </div>
  );
};

export default NotFound;
