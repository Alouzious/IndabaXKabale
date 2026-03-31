import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, title, value, color = 'purple', delay = 0 }) {
  const colors = {
    purple: 'from-purple-500 to-purple-700',
    amber: 'from-amber-400 to-amber-600',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
