// src/components/common/Button.jsx
const Button = ({ children, loading, ...props }) => (
  <button 
    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50
      ${loading ? 'cursor-wait' : ''}`}
    disabled={loading}
    {...props}
  >
    {loading ? <span className="inline-block animate-spin">⟳</span> : children}
  </button>
);