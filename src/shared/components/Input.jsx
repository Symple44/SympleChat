// src/components/common/Input.jsx
const Input = ({ ...props }) => (
  <input
    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
    {...props}
  />
);
