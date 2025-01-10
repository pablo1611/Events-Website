import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';
import { Geist } from 'next/font/google';
import Link from 'next/link';

const geist = Geist({ subsets: ['latin'] });

export default function Calendar() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
      fetchUserEvents();
    }
  }, [router]);

  const fetchUserEvents = async () => {
    try {
      const response = await fetch(`/api/user/events`);
      const data = await response.json();
      if (response.ok) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + increment)));
  };

  const getDayEvents = (dayDate) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === dayDate &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getDayEvents(day);
      days.push(
        <div key={day} className={`h-24 border border-gray-200 dark:border-gray-700 p-2 ${
          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
        }`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{day}</div>
          <div className="mt-1">
            {dayEvents.map((event, index) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className={`block text-xs truncate mb-1 rounded px-1 py-0.5 ${
                  darkMode 
                    ? 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800' 
                    : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                }`}
              >
                {event.title}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className={`flex items-center text-sm ${
                darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Events
            </Link>
            <h1 className={`${geist.className} text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              My Event Calendar
            </h1>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>

          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => changeMonth(-1)}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px text-xs sm:text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className={`text-center py-2 ${
                  darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {window.innerWidth < 640 ? day.charAt(0) : day}
              </div>
            ))}
            <div className="h-16 sm:h-24 border border-gray-200">
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 