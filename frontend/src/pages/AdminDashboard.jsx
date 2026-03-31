import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Users, Search, Download, Plus, X, BarChart2, UserX, LayoutDashboard } from 'lucide-react';
import { getAttendees, exportCSV, getCabinetUsers, createCabinetUser, deactivateUser, getAnalytics } from '../services/api';
import { useAuthStore } from '../store/authStore';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadBlob } from '../utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#7C3AED', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899'];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('attendees');
  const [attendees, setAttendees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cabinetUsers, setCabinetUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [addingUser, setAddingUser] = useState(false);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const res = await getAttendees({ page, per_page: 20, search: search || undefined });
      setAttendees(res.data.data.registrations || []);
      setTotal(res.data.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  const fetchCabinetUsers = async () => {
    try {
      const res = await getCabinetUsers();
      setCabinetUsers(res.data.data || []);
    } catch {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics();
      setAnalytics(res.data.data);
    } catch {}
  };

  useEffect(() => {
    if (tab === 'attendees') fetchAttendees();
    if (tab === 'users') fetchCabinetUsers();
    if (tab === 'analytics') fetchAnalytics();
  }, [tab, page, search]);

  const handleExport = async () => {
    try {
      const res = await exportCSV({});
      downloadBlob(res.data, 'attendees.csv');
    } catch { alert('Export failed'); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      await createCabinetUser(newUser);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '' });
      fetchCabinetUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally { setAddingUser(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await deactivateUser(id);
      fetchCabinetUsers();
    } catch { alert('Failed to deactivate'); }
  };

  return (
    <>
      <Helmet><title>Admin Dashboard — IndabaX Kabale</title></Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome, {user?.name} (Super Admin)</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
            {[
              { id: 'attendees', icon: Users, label: 'Attendees' },
              { id: 'analytics', icon: BarChart2, label: 'Analytics' },
              { id: 'users', icon: LayoutDashboard, label: 'Team' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          {/* Attendees Tab */}
          {tab === 'attendees' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
                  <Download size={16} /> Export CSV
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total: <span className="font-semibold text-gray-900 dark:text-white">{total}</span> registrations</p>
                </div>
                {loading ? (
                  <LoadingSpinner size="lg" className="py-16" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          {['Reg. ID', 'Name', 'Email', 'Phone', 'Profession', 'Session', 'Registered'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {attendees.map(a => (
                          <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400 text-xs">{a.registration_id}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.full_name}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.email}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.phone || '—'}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.course_or_profession}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.session_title}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {!attendees.length && (
                          <tr><td colSpan={7} className="py-12 text-center text-gray-400">No registrations found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Pagination */}
                {total > 20 && (
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
                      <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total} className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {tab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {!analytics ? (
                <LoadingSpinner size="lg" className="py-16" />
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Daily Registrations (14 days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={analytics.daily_registrations}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={{ fill: '#7C3AED' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Session Popularity</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={analytics.session_popularity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="registrations" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Professions</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={analytics.top_professions} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                            {analytics.top_professions.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Team Tab */}
          {tab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cabinet Members</h2>
                <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors">
                  <Plus size={16} /> Add Member
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {['Name', 'Email', 'Status', 'Joined', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {cabinetUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {u.is_active && (
                            <button onClick={() => handleDeactivate(u.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                              <UserX size={14} /> Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!cabinetUsers.length && (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400">No cabinet members yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Cabinet Member</h3>
              <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input required placeholder="Full Name *" value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input required type="email" placeholder="Email *" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input required type="password" placeholder="Password *" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={addingUser} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors">
                  {addingUser ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
