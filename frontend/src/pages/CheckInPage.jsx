import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, CheckCircle, User, AlertCircle, Clock, MapPin } from 'lucide-react';
import { searchAttendees, checkIn, getSessionByToken, getSessions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CheckInPage() {
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get('session');
  const sessionIdParam = searchParams.get('session_id');

  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(sessionIdParam || '');
  const [loadingSession, setLoadingSession] = useState(true);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [checkInState, setCheckInState] = useState(null); // { attendee, session_title, already_checked_in, checked_in_at }
  const [checkingIn, setCheckingIn] = useState(null); // attendee id being processed
  const [error, setError] = useState('');

  const debouncedQuery = useDebounce(query, 300);

  // Load session info
  useEffect(() => {
    const load = async () => {
      setLoadingSession(true);
      try {
        if (sessionToken) {
          const res = await getSessionByToken(sessionToken);
          const s = res.data.data;
          setSession(s);
          setSelectedSessionId(s.id);
        } else {
          const res = await getSessions();
          setSessions(res.data.data || []);
          if (sessionIdParam) setSelectedSessionId(sessionIdParam);
        }
      } catch {
        // ignore
      } finally {
        setLoadingSession(false);
      }
    };
    load();
  }, [sessionToken, sessionIdParam]);

  // Live search
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    searchAttendees(debouncedQuery.trim())
      .then((res) => setResults(res.data.data || []))
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const handleCheckIn = useCallback(async (attendee) => {
    if (!selectedSessionId) {
      setError('Please select a session first.');
      return;
    }
    setError('');
    setCheckingIn(attendee.id);
    try {
      const res = await checkIn({ attendee_id: attendee.id, session_id: selectedSessionId });
      const data = res.data;
      setCheckInState({
        attendee: data.data.attendee,
        session_title: data.data.session_title,
        already_checked_in: data.already_checked_in,
        checked_in_at: data.data.attendance?.checked_in_at,
      });
      setQuery('');
      setResults([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setCheckingIn(null);
    }
  }, [selectedSessionId]);

  const reset = () => {
    setCheckInState(null);
    setQuery('');
    setResults([]);
    setError('');
  };

  const currentSession = session || sessions.find((s) => s.id === selectedSessionId);

  return (
    <>
      <Helmet>
        <title>Session Check-in — IndabaX Kabale</title>
        <meta name="description" content="Check in to your IndabaX Kabale session by searching your name." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {/* ✅ Success / Already checked in screen */}
            {checkInState ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 ${checkInState.already_checked_in ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}
                >
                  {checkInState.already_checked_in ? (
                    <span className="text-5xl">⚠️</span>
                  ) : (
                    <span className="text-6xl">✅</span>
                  )}
                </motion.div>

                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                  {checkInState.already_checked_in ? 'Already Checked In!' : 'Checked In!'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                  {checkInState.already_checked_in
                    ? "You've already checked in to this session."
                    : `Welcome, ${checkInState.attendee.full_name}! 🎉`}
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-left mb-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{checkInState.attendee.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Session</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{checkInState.session_title}</p>
                    </div>
                  </div>
                  {checkInState.checked_in_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock size={18} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Checked in at</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(checkInState.checked_in_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={reset}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg"
                >
                  Check In Another Person
                </button>
              </motion.div>
            ) : (
              /* Search / check-in form */
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
                    <CheckCircle size={28} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Session Check-in</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Search your name to check in</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-5">
                  {/* Session selector (shown only when not QR-locked) */}
                  {!sessionToken && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Select Session
                      </label>
                      {loadingSession ? (
                        <LoadingSpinner size="sm" className="py-2" />
                      ) : (
                        <select
                          value={selectedSessionId}
                          onChange={(e) => { setSelectedSessionId(e.target.value); reset(); }}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">— Select a session —</option>
                          {sessions.map((s) => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Current session badge */}
                  {currentSession && (
                    <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl px-4 py-3">
                      <MapPin size={16} className="text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-purple-400">Checking in for</p>
                        <p className="font-semibold text-purple-800 dark:text-purple-200 truncate">{currentSession.title}</p>
                        {currentSession.start_time && (
                          <p className="text-xs text-purple-400">{formatDate(currentSession.start_time)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Search box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Your Name
                    </label>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Start typing your name..."
                        autoFocus
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                      />
                      {searching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Type at least 2 characters</p>
                  </div>

                  {/* Search results */}
                  <AnimatePresence>
                    {results.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2"
                      >
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          {results.length} result{results.length !== 1 ? 's' : ''} — tap your name to check in
                        </p>
                        {results.map((attendee) => (
                          <motion.button
                            key={attendee.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleCheckIn(attendee)}
                            disabled={checkingIn === attendee.id}
                            className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 rounded-xl text-left transition-all group cursor-pointer disabled:opacity-60"
                          >
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                              <User size={18} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{attendee.full_name}</p>
                              <p className="text-xs text-gray-400 truncate">{attendee.course_or_profession}</p>
                            </div>
                            {checkingIn === attendee.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <CheckCircle size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 transition-colors" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}

                    {query.trim().length >= 2 && !searching && results.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6"
                      >
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No attendee found for "<strong>{query}</strong>"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Not registered yet?{' '}
                          <a href="/register" className="text-purple-600 hover:underline">Register first →</a>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
