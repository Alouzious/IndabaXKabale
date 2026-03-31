import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Users, Calendar, TrendingUp, QrCode, Plus, X, Download, CheckCircle, UserX } from 'lucide-react';
import QRCode from 'react-qr-code';
import { getCabinetStats, createSession, getSessionQrCode, getSessionCheckins, getNeverAttended } from '../services/api';
import { useAuthStore } from '../store/authStore';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProgressColor } from '../utils';

export default function CabinetDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: '', speaker: '', location: '', start_time: '', end_time: '', capacity: 100, description: '' });

  // Session checkins panel
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState('');
  const [checkins, setCheckins] = useState([]);
  const [loadingCheckins, setLoadingCheckins] = useState(false);

  // Never attended panel
  const [showNeverAttended, setShowNeverAttended] = useState(false);
  const [neverAttended, setNeverAttended] = useState([]);
  const [loadingNever, setLoadingNever] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await getCabinetStats();
      setStats(res.data.data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createSession({
        ...sessionForm,
        capacity: parseInt(sessionForm.capacity),
        start_time: new Date(sessionForm.start_time).toISOString(),
        end_time: new Date(sessionForm.end_time).toISOString(),
      });
      setShowCreateSession(false);
      setSessionForm({ title: '', speaker: '', location: '', start_time: '', end_time: '', capacity: 100, description: '' });
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleShowQr = async (sessionId) => {
    try {
      const res = await getSessionQrCode(sessionId);
      setQrData(res.data.data);
    } catch {
      alert('Failed to load QR code');
    }
  };

  const handleShowCheckins = async (sessionId, title) => {
    setSelectedSessionId(sessionId);
    setSelectedSessionTitle(title);
    setLoadingCheckins(true);
    setCheckins([]);
    try {
      const res = await getSessionCheckins(sessionId);
      setCheckins(res.data.data || []);
    } catch {
      alert('Failed to load check-ins');
    } finally {
      setLoadingCheckins(false);
    }
  };

  const handleShowNeverAttended = async () => {
    setShowNeverAttended(true);
    setLoadingNever(true);
    try {
      const res = await getNeverAttended();
      setNeverAttended(res.data.data || []);
    } catch (e) {
      console.error('Failed to load never-attended list:', e);
    } finally { setLoadingNever(false); }
  };

  const downloadQR = (format) => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    if (format === 'svg') {
      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'qrcode.svg'; a.click(); URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      const scale = 4;
      canvas.width = 300 * scale; canvas.height = 300 * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'qrcode.png'; a.click(); URL.revokeObjectURL(url); };
      img.src = url;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <Helmet><title>Cabinet Dashboard — IndabaX Kabale</title></Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cabinet Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShowNeverAttended}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-medium rounded-xl text-sm transition-colors hover:bg-amber-100"
              >
                <UserX size={16} /> Never Attended
              </button>
              <button
                onClick={() => setShowCreateSession(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-sm transition-colors"
              >
                <Plus size={16} /> New Session
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} title="Total Attendees" value={stats?.total_attendees || 0} color="purple" delay={0} />
            <StatCard icon={CheckCircle} title="Total Check-ins" value={stats?.total_checkins || 0} color="green" delay={0.05} />
            <StatCard icon={Calendar} title="Total Sessions" value={stats?.total_sessions || 0} color="blue" delay={0.1} />
            <StatCard icon={UserX} title="Never Attended" value={stats?.never_attended || 0} color="amber" delay={0.15} />
          </div>

          {/* Sessions with check-ins */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sessions Overview</h2>
            <div className="space-y-4">
              {(stats?.sessions || []).map((s) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{s.title}</p>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">{s.checkin_count}/{s.capacity} checked in</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(s.fill_percentage)}`}
                        style={{ width: `${Math.min(s.fill_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleShowCheckins(s.id, s.title)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle size={13} /> List
                    </button>
                    <button
                      onClick={() => handleShowQr(s.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <QrCode size={13} /> QR
                    </button>
                  </div>
                </div>
              ))}
              {!stats?.sessions?.length && (
                <p className="text-center text-gray-400 py-4 text-sm">No sessions yet</p>
              )}
            </div>
          </div>

          {/* Recent check-ins */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Recent Check-ins <span className="text-xs text-gray-400 font-normal">(refreshes every 30s)</span>
            </h2>
            <div className="space-y-3">
              {(stats?.recent_checkins || []).map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{r.full_name}</p>
                    <p className="text-xs text-gray-400">{r.course_or_profession} · {r.session_title}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.checked_in_at).toLocaleTimeString()}</span>
                </div>
              ))}
              {!stats?.recent_checkins?.length && (
                <p className="text-center text-gray-400 py-4 text-sm">No check-ins yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Check-ins Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Check-ins</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSessionTitle}</p>
              </div>
              <button onClick={() => setSelectedSessionId(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {loadingCheckins ? (
              <LoadingSpinner size="lg" className="py-8" />
            ) : (
              <div className="overflow-y-auto flex-1">
                {checkins.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No check-ins yet for this session</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-3">{checkins.length} people checked in</p>
                    {checkins.map((c, i) => (
                      <div key={c.attendee_id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                        <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">{i + 1}</span>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{c.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{c.course_or_profession}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(c.checked_in_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Never Attended Modal */}
      {showNeverAttended && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Never Attended</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registered but no check-ins</p>
              </div>
              <button onClick={() => setShowNeverAttended(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {loadingNever ? (
              <LoadingSpinner size="lg" className="py-8" />
            ) : (
              <div className="overflow-y-auto flex-1">
                {neverAttended.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Everyone has attended at least one session! 🎉</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-3">{neverAttended.length} registered, never checked in</p>
                    {neverAttended.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserX size={14} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{a.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{a.course_or_profession}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Session</h3>
              <button onClick={() => setShowCreateSession(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <input required placeholder="Session title *" value={sessionForm.title} onChange={e => setSessionForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <input placeholder="Speaker name" value={sessionForm.speaker} onChange={e => setSessionForm(f => ({ ...f, speaker: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <input placeholder="Location" value={sessionForm.location} onChange={e => setSessionForm(f => ({ ...f, location: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <textarea placeholder="Description" value={sessionForm.description} onChange={e => setSessionForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Time *</label>
                  <input required type="datetime-local" value={sessionForm.start_time} onChange={e => setSessionForm(f => ({ ...f, start_time: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Time *</label>
                  <input required type="datetime-local" value={sessionForm.end_time} onChange={e => setSessionForm(f => ({ ...f, end_time: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                </div>
              </div>
              <input required type="number" min={1} placeholder="Capacity *" value={sessionForm.capacity} onChange={e => setSessionForm(f => ({ ...f, capacity: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateSession(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors">
                  {creating ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* QR Modal */}
      {qrData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session QR Code</h3>
              <button onClick={() => setQrData(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{qrData.session?.title}</p>
            <p className="text-xs text-purple-400 mb-4">Scans open the check-in page</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-4">
              <QRCode id="qr-svg" value={qrData.qr_url} size={200} />
            </div>
            <p className="text-xs text-gray-400 mb-4 break-all">{qrData.qr_url}</p>
            <div className="flex gap-3">
              <button onClick={() => downloadQR('svg')} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <Download size={14} /> SVG
              </button>
              <button onClick={() => downloadQR('png')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">
                <Download size={14} /> PNG
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

