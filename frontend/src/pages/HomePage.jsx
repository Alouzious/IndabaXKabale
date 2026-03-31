import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, QrCode, Users, BarChart3, Shield, MapPin, Calendar, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>IndabaX Kabale — AI & ML Conference Registration</title>
        <meta name="description" content="Register for IndabaX Kabale — Uganda's premier AI and Machine Learning conference. Join the community shaping Africa's AI future." />
        <meta property="og:title" content="IndabaX Kabale" />
        <meta property="og:description" content="Uganda's premier AI and Machine Learning conference." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "IndabaX Kabale",
          "description": "AI and Machine Learning conference in Kabale, Uganda",
          "location": { "@type": "Place", "name": "Kabale, Uganda" },
          "organizer": { "@type": "Organization", "name": "IndabaX Kabale" }
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm mb-8"
            >
              <Zap size={14} className="text-amber-400" />
              AI & Machine Learning Conference
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
            >
              IndabaX{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                Kabale
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-purple-100 mb-10 max-w-2xl mx-auto"
            >
              Building Africa's AI future — one session at a time. 🌍
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
              >
                Register Now
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/sessions"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl text-lg transition-all backdrop-blur-sm"
              >
                View Sessions
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-white/70"
            >
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-amber-400" />
                Kabale, Uganda
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-amber-400" />
                Multiple Sessions
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-amber-400" />
                Limited Seats
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                A World-Class Registration Experience
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Replacing manual paper registration with a fast, digital, and beautiful platform.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, title: 'Easy Registration', desc: 'Register in seconds with a simple form. Get a unique ID instantly.', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                { icon: QrCode, title: 'QR Code Entry', desc: 'Scan a QR code to register directly for a specific session.', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time attendance tracking with beautiful charts.', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: Shield, title: 'Secure & Private', desc: 'Role-based access control protects attendee data.', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon size={24} className={item.color} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-12 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Join?</h2>
              <p className="text-purple-200 mb-8">Secure your seat at IndabaX Kabale. Spaces are limited!</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
              >
                Register Now <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
          <p className="text-sm">
            Made with ❤️ by the{' '}
            <span className="text-purple-400 font-medium">IndabaX Kabale Tech Team</span>
          </p>
        </footer>
      </div>
    </>
  );
}
