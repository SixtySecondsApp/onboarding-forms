import { motion } from 'framer-motion';
import { ArrowRight, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  clientName: string;
  onStart: () => void;
}

export function WelcomeScreen({ clientName, onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto px-6 py-12 rounded-2xl bg-[#0d1116] backdrop-blur-lg border border-gray-800/50 shadow-2xl"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-emerald-400" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Welcome to <span className="text-emerald-400">Sixty Seconds</span>
          {clientName && <span>, {clientName}</span>}!
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl text-gray-300 mb-8"
        >
          We're excited to get your campaign up and running quickly.
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid md:grid-cols-3 gap-6 mb-10"
      >
        <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <Clock className="w-10 h-10 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Quick & Easy</h3>
          <p className="text-gray-400">This form takes about 5 minutes to complete, with clear steps to guide you through.</p>
        </div>
        
        <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <CheckCircle className="w-10 h-10 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Save Progress</h3>
          <p className="text-gray-400">Your progress is automatically saved at each step. Come back anytime.</p>
        </div>
        
        <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <Sparkles className="w-10 h-10 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Get Results</h3>
          <p className="text-gray-400">Once completed, we'll start working on your campaign right away.</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center"
      >
        <Button 
          onClick={onStart}
          className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/20"
        >
          Let's Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <p className="mt-4 text-gray-500 text-sm">
          This should take about 5 minutes of your time.
        </p>
      </motion.div>
    </motion.div>
  );
} 