import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, User, Mail, Phone, BookOpen, ChevronDown, AlertCircle } from 'lucide-react';
import { getSessions, createRegistration, getSessionByToken } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  course_or_profession: z.string().min(2, 'Course or profession is required'),
  session_id: z.string().uuid('Please select a session'),
});

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get('session');
  const sessionId = searchParams.get('session_id');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { session_id: sessionId || '' },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (sessionToken) {
          const res = await getSessionByToken(sessionToken);
          const session = res.data.data;
          setSessions([session]);
          setValue('session_id', session.id);
        } else {
          const res = await getSessions();
          setSessions(res.data.data || []);
          if (sessionId) setValue('session_id', sessionId);
        }
      } catch {
        setError('Failed to load sessions.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sessionToken, sessionId, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await createRegistration({ ...data });
      setSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Register — IndabaX Kabale</title>
        <meta name="description" content="Register to attend IndabaX Kabale sessions." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 text-center"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">You're all set. See you at the conference!</p>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 mb-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Registration ID</p>
                  <p className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400">{success.registration_id}</p>
                  <p className="text-xs text-gray-400 mt-1">Save this ID for check-in</p>
                </div>

                <div className="text-left space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900 dark:text-white">{success.full_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900 dark:text-white">{success.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Profession</span>
                    <span className="font-medium text-gray-900 dark:text-white">{success.course_or_profession}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSuccess(null)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Register Another Person
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
                    <User size={28} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Register</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Secure your seat at IndabaX Kabale</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
                  >
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 space-y-5">
                  {/* Session */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Session *
                    </label>
                    <div className="relative">
                      <select
                        {...register('session_id')}
                        className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select a session</option>
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id} disabled={s.registration_count >= s.capacity}>
                            {s.title}{s.registration_count >= s.capacity ? ' (Full)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.session_id && <p className="text-red-500 text-xs mt-1">{errors.session_id.message}</p>}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('full_name')}
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number (optional)</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="+256 700 000 000"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Course / Profession */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course / Field / Profession *</label>
                    <div className="relative">
                      <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('course_or_profession')}
                        type="text"
                        placeholder="Computer Science, Machine Learning..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    {errors.course_or_profession && <p className="text-red-500 text-xs mt-1">{errors.course_or_profession.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        Registering...
                      </span>
                    ) : 'Register Now'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
