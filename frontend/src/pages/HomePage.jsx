import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Users, BarChart3, MapPin, Calendar, Zap, Mic, FlaskConical, Network, Globe, Brain, Rocket } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>INDABAX AI CLUB KAB — Where Africa's AI Leaders Are Born</title>
        <meta name="description" content="INDABAX AI CLUB KAB is Kabale's home for artificial intelligence — workshops, research, talks, and a community pushing the frontier of AI in Uganda." />
        <meta property="og:title" content="INDABAX AI CLUB KAB" />
        <meta property="og:description" content="Where Africa's AI leaders are born. Join the movement in Kabale, Uganda." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "INDABAX AI CLUB KAB",
          "description": "AI and Machine Learning community in Kabale, Uganda",
          "location": { "@type": "Place", "name": "Kabale, Uganda" },
        })}</script>
      </Helmet>

      <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-gray-950">

        {/* ── Hero ── */}
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900" />

          {/* Decorative blobs */}
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm mb-8"
            >
              <Zap size={13} className="text-amber-400 shrink-0" />
              Kabale's AI & Machine Learning Community
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight"
            >
              INDABAX{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                AI CLUB
              </span>{' '}
              KAB
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-semibold text-purple-200 mb-4"
            >
              Where Africa's AI leaders are born.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-purple-300/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              We are a passionate community of students, researchers, and innovators in Kabale
              building skills, sharing knowledge, and shaping the future of AI on the African continent.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
              >
                Join the Club <ArrowRight size={20} />
              </Link>
              <Link
                to="/sessions"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl text-lg transition-all backdrop-blur-sm"
              >
                Explore Sessions
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-14 flex flex-wrap justify-center gap-6 text-white/60 text-sm"
            >
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-amber-400 shrink-0" />
                Kabale, Uganda
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-amber-400 shrink-0" />
                Regular Sessions
              </div>
              <div className="flex items-center gap-2">
                <Users size={15} className="text-amber-400 shrink-0" />
                Open to Everyone
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── What We Do ── */}
        <section className="py-24 px-4 w-full bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">What We Do</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                More than a club. A movement.
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                From beginner workshops to cutting-edge research, we create spaces where curiosity becomes capability.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FlaskConical,
                  title: 'Hands-on Workshops',
                  desc: 'Learn by doing. Our workshops cover ML fundamentals, Python, deep learning, and real-world AI applications.',
                  color: 'text-purple-600',
                  bg: 'bg-purple-50 dark:bg-purple-900/20',
                },
                {
                  icon: Mic,
                  title: 'Talks & Speakers',
                  desc: 'Hear from researchers, engineers, and AI practitioners from across Uganda and beyond.',
                  color: 'text-amber-600',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                },
                {
                  icon: Network,
                  title: 'Community & Networking',
                  desc: 'Connect with like-minded people. Build friendships, find collaborators, and grow together.',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  icon: BarChart3,
                  title: 'Research & Projects',
                  desc: 'Work on real AI projects tackling local and continental challenges. Publish, present, and innovate.',
                  color: 'text-green-600',
                  bg: 'bg-green-50 dark:bg-green-900/20',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 shrink-0`}>
                    <item.icon size={22} className={item.color} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Join ── */}
        <section className="py-24 px-4 w-full bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Why Join Us</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                The opportunity is now.
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                AI is reshaping every industry. Be part of the generation that leads that change from Kabale.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                {
                  icon: Globe,
                  color: 'text-purple-500',
                  bg: 'bg-purple-50 dark:bg-purple-900/20',
                  label: 'Pan-African Network',
                  sub: 'Part of the global IndabaX movement across Africa',
                },
                {
                  icon: Brain,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                  label: 'Real Skills',
                  sub: 'Practical knowledge you can use in research and industry',
                },
                {
                  icon: Rocket,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                  label: 'Launch Your Career',
                  sub: 'Connect with opportunities, mentors, and collaborators',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center p-6"
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon size={28} className={item.color} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{item.label}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-4 w-full bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-3xl p-14 shadow-2xl"
            >
              <p className="text-purple-300 text-sm font-semibold uppercase tracking-widest mb-4">Don't miss out</p>
              <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                Ready to build Africa's AI future?
              </h2>
              <p className="text-purple-200 mb-10 text-lg">
                Register for our next session. Seats are limited — show up, learn, and lead.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:-translate-y-0.5"
              >
                Register Now <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-gray-900 text-gray-500 py-10 px-4 text-center border-t border-gray-800">
          <p className="text-base font-semibold text-white mb-1">INDABAX AI CLUB KAB</p>
          <p className="text-sm mb-4">Kabale, Uganda — Part of the IndabaX Pan-African AI Network</p>
          <p className="text-xs">
            Built with ❤️ by the{' '}
            <span className="text-purple-400 font-medium">IndabaX Kabale Tech Team</span>
          </p>
        </footer>

      </div>
    </>
  );
}