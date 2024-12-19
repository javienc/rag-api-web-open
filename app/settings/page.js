'use client';

import { useSession } from 'next-auth/react';

export default function UserSettings() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">You must be signed in to access this page.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-semibold mb-4">User Settings</h1>
        <p className="text-gray-600 mb-4">Manage your account details and preferences.</p>
        
        {/* User Info */}
        <div className="mb-6">
          <p><strong>Name:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
        </div>

        {/* Example Options */}
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => alert('Change Password functionality coming soon!')}
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
