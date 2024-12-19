'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '../components/Button';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();


  const handleNavigate = () => {
    router.push('/generate'); // Navigate to the Content Generator page
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">


      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
          Welcome to <span className="text-black">GenAPI</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-8">
          The ultimate AI-powered tool to generate dynamic content and RESTful APIs
          seamlessly.
        </p>
        <Button
          onClick={session ? handleNavigate : () => signIn('google')}
          variant="default"
        >
          {session ? 'Start Generating Content' : 'Get Started'}
        </Button>
      </main>


    </div>
  );
}