import { Check, Target, Palette, Building2, Type, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
  isAnimating: boolean;
}

export const defaultSteps: Step[] = [
  {
    id: 0,
    title: 'Campaign Info',
    subtitle: 'Goals and content',
    icon: Target,
    status: 'completed'
  },
  {
    id: 1,
    title: 'Brand Assets',
    subtitle: 'Logo and colors',
    icon: Palette,
    status: 'current'
  },
  {
    id: 2,
    title: 'Business Info',
    subtitle: 'Company details',
    icon: Building2,
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'Typography',
    subtitle: 'Fonts and text styles',
    icon: Type,
    status: 'upcoming'
  },
  {
    id: 4,
    title: 'System Setup',
    subtitle: 'Integration details',
    icon: Settings,
    status: 'upcoming'
  }
];

export function ProgressTracker({ 
  steps, 
  currentStep, 
  onStepClick, 
  isAnimating 
}: ProgressTrackerProps) {
  // Progress line animation variants
  const progressLineVariants = {
    initial: { height: '0%' },
    animate: (progress: number) => ({
      height: `${progress}%`,
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0.0, 0.2, 1]
      }
    })
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const stepPositions = [8, 29, 50, 71, 92];
    if (currentStep === 0) return stepPositions[0];
    return stepPositions[Math.min(currentStep, stepPositions.length - 1)];
  };

  return (
    <div className="relative flex flex-col space-y-10">
      {/* Vertical Progress Line */}
      <div className="absolute left-8 top-0 h-full">
        <div className="absolute w-1.5 h-full bg-gray-800 rounded-full" />
        <motion.div 
          variants={progressLineVariants}
          initial="initial"
          animate="animate"
          custom={calculateProgress()}
          className="absolute w-1.5 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-500"
        />
      </div>

      {/* Steps */}
      {steps.map((step, index) => {
        const iconContainerVariants = {
          initial: { scale: 0.8, opacity: 0 },
          animate: { 
            scale: 1, 
            opacity: 1,
            transition: { 
              delay: index * 0.08,
              duration: 0.3,
              ease: "easeOut"
            }
          }
        };

        const textVariants = {
          initial: { x: -10, opacity: 0 },
          animate: { 
            x: 0, 
            opacity: 1,
            transition: { 
              delay: index * 0.08 + 0.1,
              duration: 0.3,
              ease: "easeOut"
            }
          }
        };

        return (
          <div key={index} className="relative z-10 flex items-center w-full">
            <motion.div
              variants={iconContainerVariants}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
                  step.status === 'completed' || step.status === 'current'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'
                    : 'bg-gradient-to-br from-gray-800 to-gray-900'
                } transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                onClick={() => !isAnimating && onStepClick(index)}
              >
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center border ${
                  step.status === 'completed' || step.status === 'current'
                    ? 'border-emerald-400/30'
                    : 'border-gray-700'
                } backdrop-blur-sm`}>
                  <AnimatePresence mode="wait">
                    {step.status === 'completed' ? (
                      <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Check className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <step.icon
                          className={`w-7 h-7 ${
                            step.status === 'upcoming' 
                              ? 'text-gray-500' 
                              : 'text-white drop-shadow-lg'
                          } transition-all duration-300`}
                          strokeWidth={2}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={textVariants}
              initial="initial"
              animate="animate"
              className="ml-4 flex-1"
            >
              <div 
                className={`cursor-pointer ${step.status !== 'upcoming' ? 'hover:text-emerald-400' : ''}`}
                onClick={() => !isAnimating && onStepClick(index)}
              >
                <p className={`font-semibold ${
                  step.status === 'upcoming' ? 'text-gray-500' : 
                  step.status === 'current' ? 'text-emerald-400' : 'text-white'
                } text-lg tracking-wide mb-1 transition-colors duration-300`}>
                  {step.title}
                </p>
                <p className="text-sm text-gray-500 font-medium tracking-wide">
                  {step.subtitle}
                </p>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
