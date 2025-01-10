import Image from "next/image";
import { Geist } from "next/font/google";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

const geist = Geist({
  subsets: ["latin"],
});

const EVENTS_PER_PAGE = 6; // Number of events to show per page

export default function Home() {
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
      fetchEvents(1);
      fetchCategories();
    }
  }, [router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(['all', ...data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['all']);
    }
  };

  const fetchEvents = async (page, newCategory = selectedCategory) => {
    try {
      const response = await fetch(`/api/readFromDatabase?page=${page}&limit=${EVENTS_PER_PAGE}${
        newCategory !== 'all' ? `&category=${newCategory}` : ''
      }`);
      const data = await response.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
      setTotalPages(Math.ceil(data.total / EVENTS_PER_PAGE));
      setCurrentPage(page);
      setSelectedCategory(newCategory);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setIsLoading(true);
    fetchEvents(page);
  };

  const handleCategoryChange = (category) => {
    setIsLoading(true);
    fetchEvents(1, category);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isValidImageUrl = (url) => {
    if (!url) return false;
    try {
      return url.startsWith('https://images.unsplash.com/');
    } catch {
      return false;
    }
  };

  if (!user) {
    return null;
  }

  // Format date to a more readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'conference':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'workshop':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'seminar':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
          </svg>
        );
      case 'lecture':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case 'research':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/academic-logo.svg"
                alt="Academic Events Logo"
                width={40}
                height={40}
              />
              <h1 className={`ml-3 text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Academic Events
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/calendar"
                className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-gray-200 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                aria-label="View Calendar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </Link>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Welcome, {user.firstName}!
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-12">
            <h2 className={`${geist.className} text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Welcome to Academic Events
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your platform for managing and discovering academic events.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex justify-center space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                  ${selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border`}
              >
                {getCategoryIcon(category)}
                <span className="ml-2">{category === 'all' ? 'All Events' : category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Link 
                    href={`/events/${event._id}`} 
                    key={event._id}
                    className="transition-transform hover:-translate-y-1"
                  >
                    <div 
                      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
                    >
                      {isValidImageUrl(event.imageUrl) ? (
                        <div className="relative h-48">
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <Image
                            src="/academic-logo.svg"
                            alt="Academic Events Logo"
                            width={80}
                            height={80}
                            className="opacity-50"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                            {event.title}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-medium ${
                            darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                          } rounded-full flex items-center`}>
                            {getCategoryIcon(event.category)}
                            <span className="ml-1">{event.category}</span>
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                            {event.description || 'No description available'}
                          </p>
                        </div>

                        <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location || 'TBA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === i + 1
                          ? 'bg-indigo-600 text-white'
                          : darkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && events.length === 0 && (
            <div className="text-center py-12">
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No events found
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
