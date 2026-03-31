import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Users, ArrowRight, Clock } from 'lucide-react';
import { getSessions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSessions()
      .then((res) => setSessions(res.data.data || []))
      .catch(() => setError('Failed to load sessions. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Sessions — IndabaX Kabale</title>
        <meta name="description" content="Browse all IndabaX Kabale conference sessions and register your spot." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Conference Sessions</h1>
            <p className="text-gray-500 dark:text-gray-400">Browse and register for available sessions</p>
          </motion.div>

          {loading && <LoadingSpinner size="lg" className="py-16" />}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p>No sessions available yet. Check back soon!</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {sessions.map((session, i) => {
              const isFull = session.registration_count >= session.capacity;
              const fillPct = Math.round((session.registration_count / session.capacity) * 100);

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug flex-1 mr-2">
                      {session.title}
                    </h3>
                    <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${isFull ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {isFull ? 'Full' : 'Open'}
                    </span>
                  </div>

                  {session.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{session.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {session.speaker && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Users size={14} className="text-purple-500" />
                        {session.speaker}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock size={14} className="text-purple-500" />
                      {formatDate(session.start_time)}
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin size={14} className="text-purple-500" />
                        {session.location}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{session.registration_count} registered</span>
                      <span>{session.capacity} capacity</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {!isFull && (
                    <Link
                      to={`/register?session_id=${session.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-sm transition-colors"
                    >
                      Register for this Session <ArrowRight size={16} />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
