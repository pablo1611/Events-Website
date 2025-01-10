import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Geist } from 'next/font/google';
import { useTheme } from '../../context/ThemeContext';
import Link from 'next/link';

const geist = Geist({ subsets: ['latin'] });

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { darkMode } = useTheme();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setEvent(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className={`mb-4 flex items-center text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </button>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={event.imageUrl || '/academic-logo.svg'}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="md:w-1/3">
              <h1 className={`${geist.className} text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {event.title}
              </h1>
              
              <div className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedDate}
                </div>
                
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>

                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {event.type || 'Event'}
                  </span>
                </div>

                <p className="mb-6">{event.description}</p>

                <Link
                  href={`/events/${id}/register`}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  Sign Up for Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 