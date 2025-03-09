import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ThumbsUp, ArrowRight, Building, Globe, Phone, Mail, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface CompletionScreenProps {
  clientName: string;
  formData?: any;
  onClose?: () => void;
  isAdmin?: boolean;
}

export function CompletionScreen({ clientName, formData, onClose, isAdmin }: CompletionScreenProps) {
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Trigger confetti when component mounts
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });

    // First confetti burst
    myConfetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.6 }
    });

    // Second confetti burst with slight delay
    setTimeout(() => {
      myConfetti({
        particleCount: 50,
        angle: 60,
        spread: 80,
        origin: { x: 0 }
      });
    }, 250);

    // Third confetti burst with slight delay
    setTimeout(() => {
      myConfetti({
        particleCount: 50,
        angle: 120,
        spread: 80,
        origin: { x: 1 }
      });
    }, 400);

    // No continuous bursts - just the initial celebration
    
    // Set a timeout to fade out and remove the canvas after 2 seconds
    const fadeOutTimeout = setTimeout(() => {
      if (canvas) {
        // Fade out animation
        const fadeEffect = setInterval(() => {
          if (!canvas) return clearInterval(fadeEffect);
          
          if (canvas.style.opacity === '') {
            canvas.style.opacity = '1';
          }
          
          if (parseFloat(canvas.style.opacity) > 0) {
            canvas.style.opacity = (parseFloat(canvas.style.opacity) - 0.1).toString();
          } else {
            clearInterval(fadeEffect);
            canvas.style.display = 'none';
          }
        }, 50);
      }
    }, 2000);

    return () => {
      clearTimeout(fadeOutTimeout);
    };
  }, []);

  // Extract business details and campaign info from formData
  const businessDetails = formData?.businessDetails || {};
  const campaign = formData?.campaign || {};

  return (
    <div className="relative">
      {/* Confetti canvas - positioned absolute to cover the entire screen */}
      <canvas 
        ref={confettiCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
      />

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
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Congratulations{clientName && <span>, {clientName}</span>}!
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-gray-300 mb-8"
          >
            You've successfully completed the onboarding process.
          </motion.p>
        </div>

        {/* Information Summary */}
        {formData && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Your Information Summary</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Business Details */}
              {businessDetails && Object.keys(businessDetails).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-emerald-400 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Business Details
                  </h4>
                  <ul className="space-y-2">
                    {businessDetails.name && (
                      <li className="text-gray-300">
                        <span className="text-gray-500">Company:</span> {businessDetails.name}
                      </li>
                    )}
                    {businessDetails.type && (
                      <li className="text-gray-300">
                        <span className="text-gray-500">Type:</span> {businessDetails.type}
                      </li>
                    )}
                    {businessDetails.website && (
                      <li className="text-gray-300">
                        <span className="text-gray-500">Website:</span> {businessDetails.website}
                      </li>
                    )}
                    {businessDetails.location && (
                      <li className="text-gray-300">
                        <span className="text-gray-500">Location:</span> {businessDetails.location}
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Campaign Info */}
              {campaign && Object.keys(campaign).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-emerald-400 flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Campaign Details
                  </h4>
                  <ul className="space-y-2">
                    {campaign.campaignName && (
                      <li className="text-gray-300">
                        <span className="text-gray-500">Campaign:</span> {campaign.campaignName}
                      </li>
                    )}
                    {campaign.objective && (
                      <li className="text-gray-300">
                        <span className="text-gray-500">Objective:</span> {campaign.objective}
                      </li>
                    )}
                    {campaign.keyMessages && (
                      <li className="text-gray-300">
                        <span className="text-gray-500">Key Messages:</span> {campaign.keyMessages}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <ThumbsUp className="w-10 h-10 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What happens next?</h3>
              <p className="text-gray-400 mb-4">
                Our team will review your information and start working on your campaign right away. 
                You'll receive an email confirmation shortly with next steps.
              </p>
              <p className="text-gray-400">
                If you have any questions or need to make changes, please contact your account manager.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center"
        >
          {isAdmin && onClose && (
            <Button 
              onClick={onClose}
              className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/20"
            >
              Return to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
} 