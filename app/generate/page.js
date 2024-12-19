'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Button from '../../components/Button';
import { ClipboardIcon } from '@heroicons/react/24/outline';

const RATE_LIMIT = 20; // 20 requests per hour
const WINDOW_SIZE = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit() {
    const now = Date.now();
    const storedData = JSON.parse(localStorage.getItem('rateLimitData') || '{"requests": [], "resetTime": 0}');

    // Clean up old requests and reset if window has passed
    if (now >= storedData.resetTime) {
        const newData = {
            requests: [],
            resetTime: now + WINDOW_SIZE
        };
        localStorage.setItem('rateLimitData', JSON.stringify(newData));
        return {
            isAllowed: true,
            currentCount: 0,
            resetTime: newData.resetTime,
            storedData: newData
        };
    }

    // Remove requests older than the window size
    storedData.requests = storedData.requests.filter(
        time => now - time < WINDOW_SIZE
    );

    // Save cleaned up data
    localStorage.setItem('rateLimitData', JSON.stringify(storedData));

    return {
        isAllowed: storedData.requests.length < RATE_LIMIT,
        currentCount: storedData.requests.length,
        resetTime: storedData.resetTime,
        storedData
    };
}

function updateRateLimit() {
    const now = Date.now();
    const storedData = JSON.parse(localStorage.getItem('rateLimitData') || '{"requests": [], "resetTime": 0}');

    storedData.requests.push(now);
    if (!storedData.resetTime) {
        storedData.resetTime = now + WINDOW_SIZE;
    }

    localStorage.setItem('rateLimitData', JSON.stringify(storedData));
}

const luckyOptions = [
    {
        type: "Recipes",
        details: "authentic Italian pasta dishes",
        endpoint: "italian-pasta-recipes"
    },
    {
        type: "Movies",
        details: "top sci-fi movies from the 90s",
        endpoint: "classic-scifi-movies"
    },
    {
        type: "Travel",
        details: "hidden gems in Southeast Asia",
        endpoint: "asia-travel-spots"
    },
    {
        type: "Books",
        details: "mind-bending mystery novels",
        endpoint: "mystery-book-recommendations"
    },
    {
        type: "Photography",
        details: "stunning landscape photography locations in Iceland",
        endpoint: "iceland-photo-spots"
    },
    {
        type: "Fitness",
        details: "bodyweight exercises for core strength",
        endpoint: "core-workout-routines"
    },
    {
        type: "Technology",
        details: "groundbreaking AI innovations of 2024",
        endpoint: "ai-tech-innovations"
    },
    {
        type: "Food",
        details: "traditional Japanese street food recipes",
        endpoint: "japanese-street-food"
    },
    {
        type: "Gaming",
        details: "most influential indie games of all time",
        endpoint: "indie-game-classics"
    },
    {
        type: "Music",
        details: "iconic jazz albums from the 1960s",
        endpoint: "classic-jazz-albums"
    }
];

const MAX_LENGTHS = {
    type: 40,
    details: 50,
    endpoint: 30
};

export default function Home() {
    const [type, setType] = useState('');
    const [details, setDetails] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [retrievedData, setRetrievedData] = useState(null);
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const [typeError, setTypeError] = useState(null);
    const [detailsError, setDetailsError] = useState(null);
    const [endpointError, setEndpointError] = useState(null);

    const [usageCount, setUsageCount] = useState(0);
    const [resetTime, setResetTime] = useState(null);

    useEffect(() => {
        // Initial check
        const { currentCount, resetTime: newResetTime } = checkRateLimit();
        setUsageCount(currentCount);
        setResetTime(newResetTime);

        // Check every second
        const intervalId = setInterval(() => {
            const { currentCount, resetTime: newResetTime } = checkRateLimit();
            setUsageCount(currentCount);
            setResetTime(newResetTime);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);
    if (status === 'loading') {
        return <div className="text-center text-xl">Loading...</div>;
    }

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to GenAPI</h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                    Build and access dynamic AI-powered content and media via scalable APIs.
                </p>
                <button
                    onClick={() => signIn('google')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Sign in with Google
                </button>
            </div>
        );
    }
    const handleGenerate = async (e) => {
        e.preventDefault();

        // Clear retrieved data first
        setRetrievedData(null);

        // Check rate limit
        const { isAllowed, resetTime } = checkRateLimit();
        if (!isAllowed) {
            const remainingTime = Math.ceil((resetTime - Date.now()) / 1000 / 60);
            setError(`Rate limit exceeded. Try again in ${remainingTime} minutes.`);
            return;
        }


        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, details, endpoint }),
            });

            if (!res.ok) {
                throw new Error('Failed to generate content');
            }

            const data = await res.json();
            setGeneratedUrl(`/api/data/${endpoint}`);

            // Update rate limit after successful request
            updateRateLimit();
            const { currentCount, resetTime: newResetTime } = checkRateLimit();
            setUsageCount(currentCount);
            setResetTime(newResetTime);
        } catch (error) {
            console.error(error);
            setError(error.message || 'Error generating content');
        } finally {
            setCopied(false);
            setIsLoading(false);
        }
    };

    const UsageDisplay = () => {
        const [timeLeft, setTimeLeft] = useState('');

        useEffect(() => {
            const timer = setInterval(() => {
                if (resetTime) {
                    const remaining = Math.max(0, resetTime - Date.now());
                    const minutes = Math.floor(remaining / 60000);
                    setTimeLeft(`${minutes}m left`);

                    if (remaining <= 0) {
                        setUsageCount(0);
                        setResetTime(null);
                    }
                }
            }, 1000);

            return () => clearInterval(timer);
        }, [resetTime]);

        return (
            <div className="text-sm text-gray-600 flex items-center justify-start space-x-2">
                {error ? (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-600">
                        {error}
                    </div>
                ) : (
                    <>
                        <span className={usageCount >= RATE_LIMIT ? 'text-red-500' : ''}>
                            {usageCount}/{RATE_LIMIT}
                        </span>
                        <span className="text-gray-400 pl-1">requests per hour</span>
                        {timeLeft && (
                            <span className="text-gray-500">({timeLeft})</span>
                        )}
                    </>
                )}
            </div>
        );
    };

    const handleLucky = (e) => {
        e.preventDefault();

        const randomOption = luckyOptions[Math.floor(Math.random() * luckyOptions.length)];
        setTypeError(null);
        setDetailsError(null);
        setEndpointError(null);

        setType(randomOption.type);
        setDetails(randomOption.details);
        setEndpoint(randomOption.endpoint);

    };

    const handleRetrieve = async () => {
        try {
            const res = await fetch(generatedUrl);

            if (!res.ok) {
                throw new Error('Failed to retrieve content');
            }

            const data = await res.json();
            setRetrievedData(data.content);
        } catch (error) {
            console.error(error);
            alert('Error retrieving content');
        }
    };


    const handleCopy = async () => {
        const fullUrl = `https://ai-rest-gen.vercel.app${generatedUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);

    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6">
            <div className={`w-full max-w-6xl flex flex-col lg:flex-row ${generatedUrl || isLoading ? 'lg:space-x-6' : ''} space-y-6 lg:space-y-0 transition-all duration-300`}>
                {/* Left Panel - Form */}
                <div className={`bg-white shadow-md rounded-md p-4 sm:p-6 min-h-[76vh] transition-all duration-300 
                ${generatedUrl || isLoading ? 'lg:w-1/2' : 'w-full max-w-2xl mx-auto'}`}>
                    <h1 className="text-2xl font-semibold mb-8">Generate Dynamic Content</h1>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Type:</label>
                            <input
                                type="text"
                                value={type}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setType(newValue);
                                    if (newValue.length > MAX_LENGTHS.type) {
                                        setTypeError(`Type must be ${MAX_LENGTHS.type} characters or less`);
                                    } else {
                                        setTypeError(null);
                                    }
                                }}
                                placeholder="cats"
                                className={`w-full px-4 py-3 border rounded-md transition-all duration-200
                                    ${typeError ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent'}`}
                                required
                            />
                            {typeError && (
                                <p className="text-sm text-red-500 mt-1">{typeError}</p>
                            )}
                            {error && type.length > MAX_LENGTHS.type && (
                                <p className="text-sm text-red-500 mt-1">{error}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="px-1 block text-sm font-medium text-gray-700">Details:</label>
                            <input
                                type="text"
                                value={details}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setDetails(newValue);
                                    if (newValue.length > MAX_LENGTHS.details) {
                                        setDetailsError(`Details must be ${MAX_LENGTHS.details} characters or less`);
                                    } else {
                                        setDetailsError(null);
                                    }
                                }}
                                placeholder="cats with long hair"
                                className={`w-full px-4 py-3 border rounded-md transition-all duration-200
            ${detailsError ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent'}`}
                                required
                            />
                            {detailsError && (
                                <p className="text-sm text-red-500 mt-1">{detailsError}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="px-1 block text-sm font-medium text-gray-700">
                                URL: &nbsp;
                                <span className="text-blue-600">
                                    https://ai-rest-gen.vercel.app/api/data/
                                    <span className="font-mono bg-gray-100 px-1 rounded">
                                        {endpoint || 'my-favorite-cats-endpoint'}
                                    </span>
                                </span>
                                &nbsp;
                            </label>
                            <input
                                type="text"
                                value={endpoint}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setEndpoint(newValue);
                                    if (newValue.length > MAX_LENGTHS.endpoint) {
                                        setEndpointError(`Endpoint must be ${MAX_LENGTHS.endpoint} characters or less`);
                                    } else {
                                        setEndpointError(null);
                                    }
                                }}
                                placeholder="my-favorite-cats-list"
                                className={`w-full px-4 py-3 border rounded-md transition-all duration-200
            ${endpointError ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent'}`}
                                required
                            />
                            {endpointError && (
                                <p className="text-sm text-red-500 mt-1">{endpointError}</p>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <Button type="submit" variant="default">
                                Generate
                            </Button>
                            <Button
                                type="button"
                                onClick={handleLucky}
                                variant="outline"
                                className="flex items-center space-x-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                                <span>I'm Feeling Lucky</span>
                            </Button>
                        </div>
                        <UsageDisplay />
                    </form>
                </div>

                {/* Right Panel - Generated Content or Loading State */}
                {(isLoading || generatedUrl) && (
                    <div className="w-full lg:w-1/2 bg-white shadow-md rounded-md p-4 sm:p-6 transition-all duration-300 opacity-100">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Generating content...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Generated API Endpoint</h3>
                                    <div className="flex items-center justify-between space-x-4 mb-4">
                                        <div className="flex-1 overflow-x-auto w-2/3">
                                            <code className="text-blue-600 font-mono text-sm break-all">
                                                <a href={generatedUrl} target="_blank" rel="noopener noreferrer">https://ai-rest-gen.vercel.app{generatedUrl}</a>
                                            </code>
                                        </div>
                                        <button
                                            onClick={handleCopy}
                                            className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700 
                           bg-white hover:bg-gray-50 rounded-md border border-gray-200 
                           transition-colors duration-200 flex items-center space-x-1"
                                        >
                                            <ClipboardIcon className={`w-5 h-5 ${copied ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`} />
                                            <span className={`${copied ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}>{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleRetrieve}
                                        className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-300
      ${isLoading
                                                ? 'bg-gray-100 text-gray-400 cursor-wait'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-md'
                                            }`}
                                        disabled={isLoading}
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                                    <span>Retrieving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    <span>Retrieve Content</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    {retrievedData && (
                                        <div className="mt-6 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm font-medium text-gray-600 mb-2">Response Preview:</h3>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden 
                         transition-all duration-300 shadow-sm">
                                                <pre className="p-5 text-sm text-gray-800 font-mono
                           overflow-auto max-h-[500px]
                           scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                           whitespace-pre-wrap break-words">
                                                    {JSON.stringify(retrievedData, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
