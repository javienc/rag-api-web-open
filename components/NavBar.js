
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import Button from './Button';
import { useState, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function NavBar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const [showResetPopup, setShowResetPopup] = useState(false);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 100);
  };

  // Add this function to handle reset verification
  const handleReset = async (event) => {
    event.preventDefault();
    const code = event.target.code.value;

    // Hard-coded reset key - in production this should be in environment variables
    const RESET_KEY = "GenAPI2024Reset";

    if (code === RESET_KEY) {
      localStorage.setItem('rateLimitData', JSON.stringify({
        requests: [],
        resetTime: Date.now() + (60 * 60 * 1000)
      }));
      setShowResetPopup(false);
      // Show success message
      alert('Rate limit has been reset successfully');
    } else {
      alert('Invalid reset key');
    }
  };
  
    const handleResetClick = () => {
      handleMouseLeave();
      setShowResetPopup(true);
  };
  

  return (
    <nav className="bg-white shadow-md h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center px-4">
        <a href="/" className="text-2xl font-bold text-gray-800">
          GenAPI
        </a>
        <div className="flex items-center space-x-4">
          {!session ? (
            <Button onClick={() => signIn('google')} variant="default">
              Sign In
            </Button>
          ) : (
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors duration-200">
                <span className="text-gray-700 font-medium">{session.user.name}</span>
                <img
                  src={session.user.image}
                  alt="User Profile"
                  className="w-8 h-8 rounded-full"
                />
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''
                    }`}
                />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    User Settings
                  </Link>
                  <button
                    onClick={() => handleResetClick()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Reset Limit
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
              {showResetPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96">
                    <h3 className="text-lg font-semibold mb-4">Reset Rate Limit</h3>
                    <form onSubmit={handleReset}>
                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-2">
                          Enter Reset Key:
                        </label>
                        <input
                          type="password"
                          name="code"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowResetPopup(false)}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}