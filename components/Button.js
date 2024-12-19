'use client';

export default function Button({ children, onClick, variant = 'default' }) {
  const baseStyles =
    'inline-flex items-center justify-center px-5 py-2 font-medium text-sm rounded-md transition-all duration-200';

  const variants = {
    default: 'bg-black text-white hover:bg-gray-800 hover:scale-105',
    outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    link: 'text-gray-800 underline hover:text-black',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} active:scale-95`}
    >
      {children}
    </button>
  );
}
