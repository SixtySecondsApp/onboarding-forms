import { useState } from 'react';
import { Share, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ShareSectionProps {
  formId: number;
  section: string;
  onShare?: () => void;
}

export function ShareSection({ formId, section, onShare }: ShareSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      const response = await apiRequest('POST', '/api/sections', {
        formId,
        section,
        shareId: crypto.randomUUID()
      });
      
      const data = await response.json();
      const url = `${window.location.origin}/onboarding/section/${data.shareId}`;
      setShareUrl(url);
      setIsOpen(true);
      
      if (onShare) {
        onShare();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create shareable link"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Success",
        description: "Link copied to clipboard"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link"
      });
    }
  };

  return (
    <>
      <button 
        onClick={handleShare}
        className="p-2 bg-gray-700/50 hover:bg-emerald-700/50 rounded-full text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105 group relative"
        title={`Share ${section} section`}
        aria-label={`Share ${section} section`}
      >
        <Share className="w-4 h-4" />
        <span className="sr-only">Share {section}</span>
        <span className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Share {section}
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share {section} Section</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="w-full"
              />
            </div>
            <Button
              type="button"
              size="icon"
              onClick={copyToClipboard}
              className="px-3"
            >
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">Copy link</span>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Anyone with this link can view and edit this section of the form.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
