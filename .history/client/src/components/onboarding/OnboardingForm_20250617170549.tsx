import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette, Building2, Type, Settings, Share, Globe, Phone, Linkedin, MapPin, Target, ChevronRight, AlertCircle, Info, CheckCircle2, ChevronLeft, Upload, Calendar, Users, UserPlus, MessageSquare, FileUp, Plus, FormInput, X } from 'lucide-react';
import { ProgressTracker, type Step } from './ProgressTracker';
import { WelcomeScreen } from './WelcomeScreen';
import { CompletionScreen } from './CompletionScreen';
import { type BusinessDetails, type OnboardingForm as FormType } from '@shared/schema';
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getFormData, updateFormData, getSectionData, updateSectionData } from '@/lib/supabase';
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";

// ShareSection Component
interface ShareSectionProps {
  formId: string;
  section: string;
}

const ShareSection = ({ formId, section }: ShareSectionProps) => {
  const { toast } = useToast();
  const { theme } = useTheme(); // Add theme context

  const handleShare = async () => {
    try {
      console.log("Sharing section:", section, "for form ID:", formId);
      
      // Check if the form exists and get its slug
      const { data, error } = await supabase
        .from('forms')
        .select('id, slug')
        .eq('id', formId);
      
      if (error) {
        console.error("Error checking form:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error("Form not found:", formId);
        throw new Error("Form not found. Please make sure the form exists before sharing.");
      }
      
      // Generate a shareable link with a hashtag for the specific section
      const baseUrl = window.location.origin;
      // Convert section name to a URL-friendly format
      const sectionSlug = section.toLowerCase().replace(/\s+/g, '-');
      // Use the form slug if available, otherwise use the ID
      const formIdentifier = data[0].slug || data[0].id;
      const shareableLink = `${baseUrl}/onboarding/${formIdentifier}#${sectionSlug}`;
      
      console.log("Shareable link generated:", shareableLink);
      
      // Copy the link to clipboard
      navigator.clipboard.writeText(shareableLink).then(() => {
        toast({
          title: "Link copied!",
          description: "Shareable link copied to clipboard.",
          variant: "default",
        });
      }).catch((clipboardError) => {
        console.error("Error copying to clipboard:", clipboardError);
        // If clipboard API fails, still show the link
        toast({
          title: "Section shared!",
          description: `Share this link: ${shareableLink}`,
          variant: "default",
        });
      });
    } catch (error) {
      console.error('Error sharing section:', error);
      toast({
        title: "Error",
        description: `Failed to share section: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Prevent form submission
        handleShare();
      }}
      type="button" // Explicitly set button type to prevent form submission
      className={`flex items-center gap-2 px-3 py-2 text-sm
        ${theme === 'dark' 
          ? 'text-gray-400 hover:text-emerald-400' 
          : 'text-gray-600 hover:text-emerald-600'} 
        transition-colors`}
    >
      <Share className="w-4 h-4" />
      Share
    </button>
  );
};

interface Props {
  formId: string;
  sectionId?: string;
}

// Format phone number as user types - more flexible for international numbers
const formatPhoneNumber = (value: string) => {
  // Strip all non-numeric characters except + and spaces
  const cleaned = value.replace(/[^\d\s+]/g, '');
  
  // If it starts with a +, keep it
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If it starts with a 0, assume UK number
  if (cleaned.startsWith('0')) {
    return `+44 ${cleaned}`;
  }
  
  // Otherwise, just return the cleaned number
  return cleaned;
};

interface FormField {
  label: string;
  name: keyof BusinessDetails | "successCriteria" | "objective" | "jobTitles" | "industries" | "companySize";
  icon: any;
  placeholder: string;
  type?: string;
  options?: { value: string; label: string; }[];
  hint?: string;
}

const FormField = ({
  field,
  value,
  onChange,
  onBlur,
  errors,
  touched,
  autoFocus = false
}: {
  field: FormField;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  autoFocus?: boolean;
}) => {
  const { label, name, icon: Icon, placeholder, type = 'text', options = null, hint = null } = field;
  const hasError = touched[name] && errors[name];
  const isValid = touched[name] && !errors[name] && value && (type === 'select' ? true : value.trim() !== '');
  const inputId = `field-${name}`;
  const { theme } = useTheme(); // Add theme context

  const lightModeClasses = hasError 
    ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400'
    : isValid
      ? 'border-emerald-500/50 shadow-sm shadow-emerald-500/10'
      : 'border-gray-300';

  const darkModeClasses = hasError
    ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400'
    : isValid
      ? 'border-emerald-500/50 shadow-sm shadow-emerald-500/10'
      : 'border-gray-700';

  const iconContainerClasses = hasError
    ? theme === 'dark' ? 'bg-red-900/20' : 'bg-red-100'
    : isValid
      ? theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-100'
      : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100';

  const iconClasses = hasError
    ? 'text-red-400'
    : isValid
      ? 'text-emerald-500'
      : theme === 'dark'
        ? 'text-gray-500 group-hover:text-emerald-400'
        : 'text-gray-600 group-hover:text-emerald-600';

  return (
    <div className="group">
      <label htmlFor={inputId} className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 flex items-center justify-between`}>
        <span className="flex items-center">
          {label}
          {hint && !hasError && (
            <span className={`ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} cursor-help group-hover:text-gray-400 transition-colors`} title={hint}>
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        {hasError && (
          <span className="text-red-500 text-xs flex items-center animate-fadeIn">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors[name]}
          </span>
        )}
      </label>
      <div className={`relative border rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} group ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-400'} transition-all duration-200 focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 
        ${theme === 'dark' ? darkModeClasses : lightModeClasses}`}
      >
        <div
          aria-hidden="true"
          className={`absolute top-0 bottom-0 left-0 w-16 flex items-center justify-center ${iconContainerClasses} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-l-lg transition-colors duration-200`}
        >
          <Icon className={`w-4 h-4 ${iconClasses} transition-colors duration-200`} />
        </div>

        {type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`w-full h-full py-3 pl-20 pr-10 bg-transparent ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} appearance-none focus:outline-none transition-all duration-200`}
            aria-invalid={hasError ? "true" : "false"}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`w-full h-full py-3 pl-20 pr-4 bg-transparent ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} focus:outline-none transition-all duration-200 placeholder:${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
            aria-invalid={hasError ? "true" : "false"}
            autoFocus={autoFocus}
          />
        )}
      </div>
    </div>
  );
};

const validateField = (name: keyof BusinessDetails | "successCriteria" | "objective" | "jobTitles" | "industries" | "companySize", value: string) => {
  let error = '';

  switch (name) {
    case 'name':
      if (!value || !value.trim()) error = 'Business name is required';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
      break;
    case 'type':
      if (!value || value === '') error = 'Please select a business type';
      break;
    case 'website':
      // Remove URL validation - accept any non-empty value if provided
      break;
    case 'phone':
      if (!value) error = 'Phone number is required';
      // More lenient phone validation - just check for minimum length and basic format
      else if (value.length < 10 || !/^[+\d\s()-]+$/.test(value))
        error = 'Please enter a valid phone number';
      break;
    case 'location':
      if (!value.trim()) error = 'Location is required';
      else if (value.length < 3) error = 'Location should be at least 3 characters';
      break;

    case 'successCriteria':
      if (!value || !value.trim()) error = 'Please describe what success looks like for this campaign';
      else if (value.trim().length < 5) error = 'Please provide a more detailed description';
      break;
    case 'objective':
      if (!value) error = 'Please select a campaign objective';
      break;
    case 'jobTitles':
      if (!value || !value.trim()) error = 'Please enter at least one job title';
      break;
    case 'industries':
      if (!value || value === '') error = 'Please select at least one industry';
      break;
    case 'companySize':
      if (!value || value === '') error = 'Please select at least one company size';
      break;
  }

  return error;
};

// Update the FormSection component
const FormSection = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900/70' : 'bg-white'} w-full rounded-lg p-6 shadow-lg ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} border-l-4 border-l-emerald-500 mt-2 mb-8 relative z-10`}>
      {children}
    </div>
  );
};

const Input = ({ id, type = "text", placeholder, className, value, onChange }: { id: string; type?: string; placeholder: string; className: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const { theme } = useTheme();
  return (
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${className} ${
        theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700 text-gray-200'
          : 'bg-white border-gray-300 text-gray-800'
      } border p-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
    />
  );
}

// Add these constants outside of any component
const SYSTEM_INTEGRATION_OPTIONS = {
  crm: [
    {
      value: "salesforce",
      label: "Salesforce",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      value: "pipedrive",
      label: "Pipedrive",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      value: "hubspot",
      label: "HubSpot",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      value: "other",
      label: "Other CRM",
      icon: <Plus className="w-4 h-4" />,
    },
  ],
  scheduling: [
    {
      value: "calendly",
      label: "Calendly",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: "savvycal",
      label: "SavvyCal",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: "microsoft",
      label: "Microsoft",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: "other",
      label: "Other Tool",
      icon: <Plus className="w-4 h-4" />,
    },
  ],
};

// Update the ProgressPie component to use emerald color with theme awareness
const ProgressPie = ({ progress }: { progress: number }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const { theme } = useTheme();

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="transform -rotate-90 w-20 h-20">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgba(16, 185, 129, 0.8)" // Emerald color works well in both themes
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-emerald-500">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export function OnboardingForm({ formId, sectionId }: Props) {
  const { theme } = useTheme();
  const { data: form } = useQuery<FormType>({
    queryKey: ["/api/forms", formId],
    queryFn: async () => {
      return await getFormData(formId);
    }
  });

  const { data: section } = useQuery<FormType>({
    queryKey: ["/api/sections", sectionId],
    enabled: !!sectionId,
    queryFn: async () => {
      return await getSectionData(sectionId);
    }
  });

  const { toast } = useToast();

  const updateFormMutation = useMutation({
    mutationFn: async (data: any) => {
      if (sectionId) {
        await updateSectionData(sectionId, data);
      } else {
        await updateFormData(formId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms", formId] });
      if (sectionId) {
        queryClient.invalidateQueries({ queryKey: ["/api/sections", sectionId] });
      }
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [animatingNav, setAnimatingNav] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    name: '',
    type: '',
    website: '',
    linkedin: '',
    phone: '',
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formProgress, setFormProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Added state for brand assets
  const [brandAssets, setBrandAssets] = useState({
    brandName: '',
    mainColor: '#000000',
    secondaryColor: '#000000',
    highlightColor: '#000000',
    additionalAssets: ''
  });

  // Added state for file upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Add new state for campaign and audience data
  const [campaign, setCampaign] = useState({
    successCriteria: '',
    objective: '',
    keyMessages: '',
    callToAction: ''
  });

  const [audience, setAudience] = useState({
    jobTitles: '',
    industries: '',
    companySize: '',
    locations: ''
  });

  // Added state for selected industries and other industry input
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [otherIndustry, setOtherIndustry] = useState('');
  const [showOtherIndustryInput, setShowOtherIndustryInput] = useState(false);

  // Add new state for selected company sizes
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([]);

  // Define industry and company size options
  const industryOptions = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Professional Services',
    'Marketing & Advertising',
    'Media & Entertainment',
    'Real Estate',
    'Construction',
    'Transportation',
    'Hospitality',
    'Non-profit',
    'Government'
  ];

  const companySizeOptions = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1,000 employees',
    '1,001-5,000 employees',
    '5,001-10,000 employees',
    '10,000+ employees'
  ];

  // Animation variants for consistent animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Add new state for typography selections
  const [typography, setTypography] = useState({
    titleFont: '',
    subtitleFont: '',
    bodyFont: '',
    customTitleFont: '',
    customSubtitleFont: '',
    customBodyFont: ''
  });

  const [selectedFonts, setSelectedFonts] = useState({
    title: '',
    subtitle: '',
    body: ''
  });

  // Update the brandPresets state with new secondary colors
  const [brandPresets, setBrandPresets] = useState({
    mainColor: [
      { name: 'Emerald', value: '#10B981' },
      { name: 'Blue', value: '#3B82F6' },
      { name: 'Purple', value: '#8B5CF6' },
      { name: 'Red', value: '#EF4444' },
      { name: 'Orange', value: '#F97316' },
      { name: 'Custom', value: 'custom' }
    ],
    secondaryColor: [
      { name: 'Navy', value: '#1E40AF' },
      { name: 'Forest', value: '#166534' },
      { name: 'Indigo', value: '#4338CA' },
      { name: 'Rose', value: '#BE185D' },
      { name: 'Amber', value: '#B45309' },
      { name: 'Custom', value: 'custom' }
    ],
    highlightColor: [
      { name: 'Yellow', value: '#EAB308' },
      { name: 'Amber', value: '#F59E0B' },
      { name: 'Lime', value: '#84CC16' },
      { name: 'Cyan', value: '#06B6D4' },
      { name: 'Pink', value: '#EC4899' },
      { name: 'Custom', value: 'custom' }
    ]
  });

  const [selectedColors, setSelectedColors] = useState({
    main: '',
    secondary: '',
    highlight: ''
  });

  // Form fields configuration
  const formFields: FormField[] = [
    {
      label: "Business Name",
      name: "name",
      icon: Building2,
      placeholder: "Your business name",
      hint: "The legal or trading name of your business"
    },
    {
      label: "Business Type",
      name: "type",
      icon: Building2,
      placeholder: "Select business type",
      type: "select",
      options: [
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'saas', label: 'SaaS' },
        { value: 'agency', label: 'Agency' },
        { value: 'retail', label: 'Retail' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance' },
        { value: 'education', label: 'Education' },
        { value: 'other', label: 'Other' }
      ],
      hint: "The industry or category your business operates in"
    },
    {
      label: "Website",
      name: "website",
      icon: Globe,
      placeholder: "https://your-website.com",
      hint: "Your business website URL"
    },
    {
      label: "LinkedIn Page",
      name: "linkedin",
      icon: Linkedin,
      placeholder: "LinkedIn URL",
      hint: "URL to your company's LinkedIn profile"
    },
    {
      label: "Phone Number",
      name: "phone",
      icon: Phone,
      placeholder: "(555) 555-5555",
      type: "tel",
      hint: "Your business contact number"
    },
    {
      label: "Location",
      name: "location",
      icon: MapPin,
      placeholder: "City, Country",
      hint: "Primary location of your business"
    }
  ];

  //New fields from edited code
  const campaignFields = [
    {
      label: "What would make this campaign successful for you?",
      name: "successCriteria",
      icon: Target,
      placeholder: "Describe what success looks like for this campaign",
      hint: "E.g., 'Generate 50 qualified leads' or 'Increase brand awareness by 30%'"
    },
    {
      label: "Campaign Objective",
      name: "objective",
      icon: Target,
      placeholder: "Select campaign objective",
      type: "select",
      options: [
        { value: 'awareness', label: 'Brand Awareness' },
        { value: 'leads', label: 'Lead Generation' },
        { value: 'sales', label: 'Drive Sales' },
        { value: 'engagement', label: 'Increase Engagement' },
        { value: 'retention', label: 'Customer Retention' },
        { value: 'loyalty', label: 'Build Brand Loyalty' }
      ],
      hint: "What do you want to achieve with this campaign?"
    }
  ];

  const audienceFields = [
    {
      label: "Job Titles",
      name: "jobTitles",
      icon: Target,
      placeholder: "Enter target job titles",
      type: "text"
    },
    {
      label: "Industries",
      name: "industries",
      icon: Building2,
      placeholder: "Select target industries",
      type: "select",
      options: [
        { value: 'tech', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'retail', label: 'Retail' }
      ]
    },
    {
      label: "Company Size",
      name: "companySize",
      icon: Building2,
      placeholder: "Select company size",
      type: "select",
      options: [
        { value: '1-10', label: '1-10 employees' },
        { value: '11-50', label: '11-50 employees' },
        { value: '51-200', label: '51-200 employees' },
        { value: '201-500', label: '201-500 employees' },
        { value: '501-1,000', label: '501-1,000 employees' },
        { value: '1,001-5,000', label: '1,001-5,000 employees' },
        { value: '5,001-10,000', label: '5,001-10,000 employees' },
        { value: '10,000+', label: '10,000+ employees' }
      ]
    }
  ];

  // Move getRequiredFields to component level
  const getRequiredFields = () => {
      switch (currentStep) {
        case 0: // Business Details
        return ['name', 'type', 'phone', 'location'];
        case 1: // Campaign
          return ['successCriteria', 'objective'];
        case 2: // Target Audience
          return ['jobTitles', 'industries', 'companySize'];
        case 3: // Typography
        return [];
        case 4: // Brand Assets
        return ['brandName'];
        default:
          return [];
      }
  };

  // Update the progress calculation and update functions
  const calculateProgress = () => {
    // Calculate progress based on completed steps
    if (steps.length === 0) return 0;
    
    // Base progress from completed steps
    const completedProgress = (completedSteps.length / steps.length) * 100;
    
    // If all steps are completed, return 100%
    if (completedSteps.length >= steps.length) {
      return 100;
    }
    
    // Ensure minimum progress of 8%
    return Math.max(Math.round(completedProgress), 8);
  };

  // Add an effect to update progress when form data changes
  useEffect(() => {
    const updateProgress = async () => {
      const newProgress = calculateProgress();
      if (newProgress !== formProgress) {
        setFormProgress(newProgress);
        try {
          await supabase
            .from('forms')
            .update({ progress: newProgress })
            .eq('id', formId);
            
          queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }
    };

    updateProgress();
  }, [businessDetails, campaign, audience, typography, completedSteps, formProgress, formId]);

  // Load business details from form data
  useEffect(() => {
    if (sectionId && section?.data) {
      const sectionData = section.data as any;
      if (sectionData.businessDetails) {
        setBusinessDetails(sectionData.businessDetails);
      }
    } else if (form?.data) {
      const formData = form.data as any;
      if (formData.businessDetails) {
        setBusinessDetails(formData.businessDetails);
      }
    }
  }, [form, section, sectionId]);

  // Load campaign data from form data
  useEffect(() => {
    if (sectionId && section?.data) {
      const sectionData = section.data as any;
      if (sectionData.campaign) {
        setCampaign(sectionData.campaign);
      }
    } else if (form?.data) {
      const formData = form.data as any;
      if (formData.campaign) {
        setCampaign(formData.campaign);
      }
    }
  }, [form, section, sectionId]);

  // Load audience data from form data
  useEffect(() => {
    if (sectionId && section?.data) {
      const sectionData = section.data as any;
      if (sectionData.audience) {
        setAudience(sectionData.audience);
      }
    } else if (form?.data) {
      const formData = form.data as any;
      if (formData.audience) {
        setAudience(formData.audience);
      }
    }
  }, [form, section, sectionId]);

  // Load typography data from form data
  useEffect(() => {
    if (sectionId && section?.data?.typography) {
      setTypography(section.data.typography);
    } else if (form?.data?.typography) {
      setTypography(form.data.typography);
    }
  }, [form, section, sectionId]);

  // Load brand assets data from form data
  useEffect(() => {
    if (sectionId && section?.data?.brandAssets) {
      setBrandAssets(section.data.brandAssets);
    } else if (form?.data?.brandAssets) {
      setBrandAssets(form.data.brandAssets);
    }
  }, [form, section, sectionId]);

  const getStepStatus = (stepId: number): Step['status'] => {
    if (completedSteps.includes(stepId)) {
      return 'completed';
    }
    if (stepId === currentStep) {
      return 'current';
    }
    return 'upcoming';
  };

  // Update steps with current status using useMemo
  const steps = useMemo(() => [
    { id: 1, title: 'Business Details', icon: Building2, status: getStepStatus(0) },
    { id: 2, title: 'Campaign', icon: Target, status: getStepStatus(1) },
    { id: 3, title: 'Target Audience', icon: Users, status: getStepStatus(2) },
    { id: 4, title: 'Typography', icon: Type, status: getStepStatus(3) },
    { id: 5, title: 'Brand Assets', icon: Palette, status: getStepStatus(4) },
    { id: 6, title: 'System Integration', icon: Settings, status: getStepStatus(5) }
  ], [completedSteps, currentStep]);

  // Load completed steps from form data when component mounts
  useEffect(() => {
    if (form?.data?.completedSteps) {
      const loadedSteps = form.data.completedSteps;
      setCompletedSteps(loadedSteps);
      
      // Recalculate progress immediately
      const newProgress = Math.round((loadedSteps.length / steps.length) * 100);
      setFormProgress(Math.max(newProgress, 8)); // Ensure minimum 8% progress
    }
  }, [form, steps.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Format phone number as the user types
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setBusinessDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      if (name === "successCriteria" || name === "objective" || name === "keyMessages" || name === "callToAction") {
        setCampaign(prev => ({ ...prev, [name]: value }));
      } else if (name === "jobTitles" || name === "industries" || name === "companySize" || name === "locations") {
        setAudience(prev => ({ ...prev, [name]: value }));
      } else {
        setBusinessDetails(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }

    // Validate on change and set touched
    const error = validateField(name as keyof BusinessDetails | "successCriteria" | "objective" | "jobTitles" | "industries" | "companySize", name === 'phone' ? formatPhoneNumber(value) : value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    const error = validateField(name as keyof BusinessDetails | "successCriteria" | "objective" | "jobTitles" | "industries" | "companySize", businessDetails[name as keyof BusinessDetails] || campaign[name as keyof typeof campaign] || audience[name as keyof typeof audience] || "");
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Add file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add color change handler
  const handleColorChange = (color: string, type: 'mainColor' | 'secondaryColor' | 'highlightColor') => {
    setBrandAssets(prev => ({
      ...prev,
      [type]: color
    }));
  };

  // Update the validation to include brand assets
  const validateBrandAssets = () => {
    const errors: Record<string, string> = {};

    if (!brandAssets.brandName) {
      errors.brandName = 'Brand name is required';
    }

    return errors;
  };

  const validateBusinessInfo = () => {
    const errors: Record<string, string> = {};
    for (const field of formFields) {
      const error = validateField(field.name, businessDetails[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    }
    return errors;
  };

  const handleCampaignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({ ...prev, [name]: value }));
    
    // Set touched for this field
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate the field
    const error = validateField(name as "successCriteria" | "objective", value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleAudienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAudience(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched and validate immediately
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name as "jobTitles" | "industries" | "companySize", value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleIndustrySelect = (industry: string) => {
    let newSelectedIndustries: string[];
    
    if (selectedIndustries.includes(industry)) {
      // Remove the industry if it's already selected
      newSelectedIndustries = selectedIndustries.filter(i => i !== industry);
    } else {
      // Add the industry if it's not selected
      newSelectedIndustries = [...selectedIndustries, industry];
    }
    
    setSelectedIndustries(newSelectedIndustries);

    // Update the audience state with selected industries
    const industriesString = newSelectedIndustries
      .filter(i => i !== 'Other')
      .concat(newSelectedIndustries.includes('Other') && otherIndustry ? [otherIndustry] : [])
      .join(', ');

    setAudience(prev => ({ ...prev, industries: industriesString }));
    
    // Mark as touched and validate
    setTouched(prev => ({ ...prev, industries: true }));
    const error = validateField('industries', industriesString);
    setErrors(prev => ({ ...prev, industries: error }));
  };

  const handleOtherIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherIndustry(value);
    
    // Update the audience state with all industries including the new "other" value
    const industriesString = selectedIndustries
      .filter(i => i !== 'Other')
      .concat(value ? [value] : [])
      .join(', ');

    setAudience(prev => ({ ...prev, industries: industriesString }));
    
    // Validate the updated industries
    const error = validateField('industries', industriesString);
    setErrors(prev => ({ ...prev, industries: error }));
  };

  // Add company size selection handler
  const handleCompanySizeSelect = (size: string) => {
    let newSelectedSizes: string[];
    
    if (selectedCompanySizes.includes(size)) {
      // Remove the size if it's already selected
      newSelectedSizes = selectedCompanySizes.filter(s => s !== size);
    } else {
      // Add the size if it's not selected
      newSelectedSizes = [...selectedCompanySizes, size];
    }
    
    setSelectedCompanySizes(newSelectedSizes);

    // Update the audience state with selected sizes
    const sizesString = newSelectedSizes.join(', ');
    setAudience(prev => ({ ...prev, companySize: sizesString }));
    
    // Mark as touched and validate
    setTouched(prev => ({ ...prev, companySize: true }));
    const error = validateField('companySize', sizesString);
    setErrors(prev => ({ ...prev, companySize: error }));
  };

  // Update the handleStepNavigation function to save progress
  const handleStepNavigation = async (direction: 'next' | 'previous') => {
    if (animatingNav) return;
    setAnimatingNav(true);

    // Determine the potential next completed steps before saving
    const updatedCompletedSteps = direction === 'next' && !completedSteps.includes(currentStep)
      ? [...completedSteps, currentStep]
      : completedSteps;

    // Save current form data, including the potentially updated completed steps
    try {
      await supabase
        .from('forms')
        .update({
          data: {
            ...form?.data,
            businessDetails,
            campaign,
            audience,
            typography,
            completedSteps: updatedCompletedSteps // Save updated steps
          }
        })
        .eq('id', formId);

      // Invalidate the forms query to update the dashboard
      queryClient.invalidateQueries({ queryKey: ["forms"] });

      // Update local state if moving next
      if (direction === 'next') {
        setCompletedSteps(updatedCompletedSteps);
      }

    } catch (error) {
      console.error('Error saving form data:', error);
      toast({
        title: "Error",
        description: "Failed to save form data",
        variant: "destructive"
      });
      // Don't proceed with navigation if save failed
      setAnimatingNav(false);
      return;
    }

    if (direction === 'next') {
      // If all steps are now completed, show completion screen
      if (updatedCompletedSteps.length >= steps.length) {
        // Update form status to completed
        await supabase
          .from('forms')
          .update({ 
            status: 'completed',
            progress: 100
          })
          .eq('id', formId);
        
        // Show completion screen with confetti
        setIsCompleted(true);
        setAnimatingNav(false);
        return;
      }
      
      // Find the next uncompleted step using the *updated* list
      let nextStep = currentStep + 1;
      while (nextStep < steps.length && updatedCompletedSteps.includes(nextStep)) {
        nextStep++;
      }
      
      // If we've gone through all steps, show completion screen
      if (nextStep >= steps.length) {
        // Update form status to completed
        await supabase
          .from('forms')
          .update({ 
            status: 'completed',
            progress: 100
          })
          .eq('id', formId);
        
        // Show completion screen with confetti
        setIsCompleted(true);
      } else {
        // Otherwise, go to the next uncompleted step
        setCurrentStep(nextStep);
      }
    } else {
      // For previous navigation, just go to the previous step
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }

    setTimeout(() => {
      setAnimatingNav(false);
    }, 600);
  };

  const handleComplete = async () => {
    // Validate all fields before completing
    let hasErrors = false;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    // Get required fields for current step
    const requiredFields = getRequiredFields();

    // Get the current step's data to validate
    let currentData: Record<string, string> = {};
    if (currentStep === 0) {
      currentData = businessDetails;
    } else if (currentStep === 1) {
      currentData = campaign;
    } else if (currentStep === 2) {
      currentData = audience;
    }

    // Validate required fields for the current step
    requiredFields.forEach(field => {
      newTouched[field] = true;
      const value = currentData[field as keyof typeof currentData] || '';
      const error = validateField(field as keyof BusinessDetails | "successCriteria" | "objective" | "jobTitles" | "industries" | "companySize", value);
      if (error) {
        hasErrors = true;
        newErrors[field] = error;
      }
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (hasErrors) {
      toast({
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let formData = {};
      
      // Only include relevant data for the current step
      if (currentStep === 0) {
        formData = { ...businessDetails };
      } else if (currentStep === 1) {
        formData = { ...campaign };
      } else if (currentStep === 2) {
        formData = { ...audience };
      } else if (currentStep === 4) {
        formData = { ...brandAssets };
      }

      await updateFormMutation.mutateAsync(formData);

      // Mark the current step as completed
      const updatedCompletedSteps = [...completedSteps];
      if (!updatedCompletedSteps.includes(currentStep)) {
        updatedCompletedSteps.push(currentStep);
      }
      
      // Update the state with the new completed steps
      setCompletedSteps(updatedCompletedSteps);

      // Calculate the actual progress based on completed steps
      const newProgress = Math.round((updatedCompletedSteps.length / steps.length) * 100);

      // Update form progress in Supabase
      await supabase
        .from('forms')
        .update({ 
          progress: newProgress,
          data: {
            ...form?.data,
            businessDetails,
            campaign,
            audience,
            typography,
            completedSteps: updatedCompletedSteps
          }
        })
        .eq('id', formId);

      // Invalidate the forms query to update the dashboard
      queryClient.invalidateQueries({ queryKey: ["forms"] });

      // Check if all sections are now completed
      const allSectionsCompleted = updatedCompletedSteps.length >= steps.length || 
                                  currentStep === steps.length - 1;

      // If all sections are completed or this is the final section, show completion screen
      if (allSectionsCompleted) {
        // Update form status to completed
        await supabase
          .from('forms')
          .update({ 
            status: 'completed',
            progress: 100
          })
          .eq('id', formId);
        
        // Show completion screen with confetti
        setIsCompleted(true);

        // Fire-and-forget request to backend to trigger the form-completion webhook
        // We don't await this call so the UI remains responsive. Any error is logged
        // silently – users don't need to know the webhook delivery status.
        fetch(`/api/forms/${formId}/complete`, {
          method: "POST"
        }).catch(err => {
          console.error("Failed to trigger completion webhook", err);
        });
      } else {
        // Show section completion message and move to next section
        toast({
          title: "Section completed!",
          description: `${steps[currentStep].title} has been saved successfully`,
          variant: "default"
        });
        
        // Move to next section, skipping completed ones
        handleStepNavigation('next');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "Failed to save the form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const renderFormActions = () => {
    // We're removing this function's content since we'll only use the bottom navigation bar
    return null; // Return null instead of rendering duplicate navigation buttons
  };

  const handleShareSection = (e: React.MouseEvent, sectionTitle: string) => {
    e.stopPropagation(); // Share functionality is handled by the ShareSection component
  };

  const hasFormErrors = () => {
    return Object.values(errors).some(error => error !== '');
  };

  const renderBusinessInfoForm = () => {
    const businessTypeSuggestion = getBusinessTypeSuggestion(businessDetails.website);
    
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} id="section-business-details">Business Details</h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tell us about your business</p>
            
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2 mt-2">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-xs text-blue-500">
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              )}
              {autoSaveStatus === 'saved' && lastSaved && (
                <div className="flex items-center gap-2 text-xs text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" />
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  Save failed - will retry
                </div>
              )}
            </div>
          </div>
          <ShareSection formId={formId} section="Business Details" />
        </div>

        {/* Quick Start Tips */}
        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-emerald-300 bg-emerald-50'}`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <Info className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} mb-1`}>Quick Tips</h3>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-emerald-300/80' : 'text-emerald-600/80'}`}>
                <li>• Your information is automatically saved as you type</li>
                <li>• We'll suggest business type based on your website</li>
                <li>• Phone numbers are formatted automatically for your location</li>
              </ul>
            </div>
          </div>
        </div>

        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Business Identity */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Business Identity</h3>
              
              <FormField
                key="name"
                field={formFields[0]} // Business Name
                value={businessDetails.name}
                onChange={handleChange}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
                autoFocus={true}
              />
              
              {/* Enhanced Business Type with Smart Suggestion */}
              <div className="space-y-2">
                <FormField
                  key="type"
                  field={formFields[1]} // Business Type
                  value={businessDetails.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                
                {/* Smart suggestion for business type */}
                {businessTypeSuggestion && !businessDetails.type && businessDetails.website && (
                  <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-blue-500/30 bg-blue-900/10' : 'border-blue-300 bg-blue-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} flex items-center justify-center`}>
                          <Target className={`w-3 h-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                          Based on your website, this looks like an {businessTypeSuggestion} business
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setBusinessDetails(prev => ({ ...prev, type: businessTypeSuggestion }));
                          setTouched(prev => ({ ...prev, type: true }));
                        }}
                        className={`text-xs px-3 py-1 rounded ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition-colors`}
                      >
                        Use This
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Website with better validation feedback */}
              <div className="space-y-2">
                <FormField
                  key="website"
                  field={formFields[2]} // Website
                  value={businessDetails.website}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                
                {/* Website validation helper */}
                {businessDetails.website && !businessDetails.website.startsWith('http') && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} flex items-center gap-1`}>
                    <Info className="w-3 h-3" />
                    We'll add "https://" automatically if needed
                  </div>
                )}
              </div>
            </div>

            {/* Location & Contact */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Location & Contact</h3>
              
              <FormField
                key="location"
                field={formFields[5]} // Location
                value={businessDetails.location}
                onChange={handleChange}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
              />
              
              {/* Enhanced Phone with Smart Formatting */}
              <div className="space-y-2">
                <FormField
                  key="phone"
                  field={{
                    ...formFields[4], // Phone Number
                    placeholder: businessDetails.location 
                      ? detectCountryFromLocation(businessDetails.location) === 'UK' 
                        ? '+44 20 1234 5678'
                        : detectCountryFromLocation(businessDetails.location) === 'US'
                        ? '+1 (555) 123-4567'
                        : formFields[4].placeholder
                      : formFields[4].placeholder
                  }}
                  value={businessDetails.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumberSmart(e.target.value, businessDetails.location);
                    handleChange({ ...e, target: { ...e.target, value: formatted } });
                  }}
                  onBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                
                {/* Phone formatting helper */}
                {businessDetails.location && businessDetails.phone && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Phone number formatted for {detectCountryFromLocation(businessDetails.location) || 'international'} format
                  </div>
                )}
              </div>

              {/* LinkedIn with better guidance */}
              <div className="space-y-2">
                <FormField
                  key="linkedin"
                  field={{
                    ...formFields[3], // LinkedIn
                    placeholder: "https://linkedin.com/company/your-company"
                  }}
                  value={businessDetails.linkedin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                
                {/* LinkedIn helper */}
                {!businessDetails.linkedin && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-1`}>
                    <Info className="w-3 h-3" />
                    Optional: Helps us understand your brand better
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress indicator for this section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Section Progress
              </span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {Object.values(businessDetails).filter(v => v && v.trim()).length} / {Object.keys(businessDetails).length} fields completed
              </span>
            </div>
            <div className={`mt-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.values(businessDetails).filter(v => v && v.trim()).length / Object.keys(businessDetails).length) * 100}%` 
                }}
              />
            </div>
          </div>
        </FormSection>
      </motion.div>
    );
  };

  const renderBrandAssetsForm = () => {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} id="section-brand-assets">Brand Assets & Guidelines</h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Help us understand your brand by sharing your visual identity</p>
          </div>
          <ShareSection formId={formId} section="Brand Assets" />
        </div>

        <FormSection>
          <div className="space-y-10">
            {/* Quick Start Guide */}
            <div className={`p-6 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-emerald-300 bg-emerald-50'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                  <Target className={`w-5 h-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} mb-2`}>What we need from you</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Essential:</h4>
                      <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Your logo (any format)</li>
                        <li>• Primary brand color</li>
                        <li>• Company name</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Optional but helpful:</h4>
                      <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Brand guidelines document</li>
                        <li>• Secondary colors</li>
                        <li>• Font preferences</li>
                        <li>• Style references</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Brand Name</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>What should we call your brand?</p>
              </div>
              <input
                type="text"
                value={brandAssets.brandName}
                onChange={(e) => setBrandAssets(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder="Enter your brand or company name"
                className={`w-full max-w-md ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-800'
                } border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Logo</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Upload your logo in any format (PNG, JPG, SVG, PDF)</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    onChange={handleLogoUpload}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-900/10' 
                        : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {logoPreview ? (
                      <div className="space-y-4">
                        <img src={logoPreview} alt="Logo preview" className="max-h-32 mx-auto rounded-lg" />
                        <div className="space-y-2">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>Logo uploaded successfully!</p>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setLogoPreview('');
                              setLogoFile(null);
                            }}
                            className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                          >
                            Remove and upload different logo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-xl ${
                          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
                        } flex items-center justify-center`}>
                          <Upload className={`w-8 h-8 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className={`text-base font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>Drop your logo here or click to browse</p>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          } mt-1`}>PNG, JPG, SVG, or PDF • Up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {/* Logo Tips */}
                <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>Logo Tips</h4>
                  <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• High resolution works best</li>
                    <li>• Transparent background preferred</li>
                    <li>• Vector formats (SVG) are ideal</li>
                    <li>• We'll optimize it for different uses</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Brand Colors - Simplified */}
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Brand Colors</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Choose or enter your brand colors. Click any color below to customize it.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Primary Color */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Primary Color <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {/* Color Picker */}
                    <div className="relative">
                      <input
                        type="color"
                        value={brandAssets.mainColor}
                        onChange={(e) => setBrandAssets(prev => ({ ...prev, mainColor: e.target.value }))}
                        className="w-full h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: brandAssets.mainColor }}
                      />
                      <div className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded">
                          Click to change
                        </span>
                      </div>
                    </div>
                    {/* Hex Input */}
                    <input
                      type="text"
                      value={brandAssets.mainColor.toUpperCase()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                          setBrandAssets(prev => ({ ...prev, mainColor: value }));
                        }
                      }}
                      placeholder="#000000"
                      className={`w-full text-center font-mono text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-800'
                      } border rounded-lg p-2 focus:outline-none focus:border-emerald-500`}
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Secondary Color
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={brandAssets.secondaryColor}
                        onChange={(e) => setBrandAssets(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-full h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: brandAssets.secondaryColor }}
                      />
                      <div className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded">
                          Click to change
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={brandAssets.secondaryColor.toUpperCase()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                          setBrandAssets(prev => ({ ...prev, secondaryColor: value }));
                        }
                      }}
                      placeholder="#000000"
                      className={`w-full text-center font-mono text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-800'
                      } border rounded-lg p-2 focus:outline-none focus:border-emerald-500`}
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Accent Color
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={brandAssets.highlightColor}
                        onChange={(e) => setBrandAssets(prev => ({ ...prev, highlightColor: e.target.value }))}
                        className="w-full h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: brandAssets.highlightColor }}
                      />
                      <div className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded">
                          Click to change
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={brandAssets.highlightColor.toUpperCase()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                          setBrandAssets(prev => ({ ...prev, highlightColor: value }));
                        }
                      }}
                      placeholder="#000000"
                      className={`w-full text-center font-mono text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-800'
                      } border rounded-lg p-2 focus:outline-none focus:border-emerald-500`}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Color Presets */}
              <div className="space-y-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Or choose from popular color combinations:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Professional Blue', primary: '#2563EB', secondary: '#1E40AF', accent: '#3B82F6' },
                    { name: 'Modern Green', primary: '#059669', secondary: '#047857', accent: '#10B981' },
                    { name: 'Creative Purple', primary: '#7C3AED', secondary: '#5B21B6', accent: '#8B5CF6' },
                    { name: 'Bold Orange', primary: '#EA580C', secondary: '#C2410C', accent: '#F97316' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setBrandAssets(prev => ({
                          ...prev,
                          mainColor: preset.primary,
                          secondaryColor: preset.secondary,
                          highlightColor: preset.accent
                        }));
                      }}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        theme === 'dark'
                          ? 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }}></div>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }}></div>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }}></div>
                      </div>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {preset.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand Guidelines Upload */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Brand Guidelines & Assets</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Upload any brand guidelines, style guides, or reference materials you have</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="file"
                    id="brand-guidelines-upload"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.svg"
                    className="hidden"
                  />
                  <label
                    htmlFor="brand-guidelines-upload"
                    className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-900/10' 
                        : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className={`w-12 h-12 mx-auto rounded-lg ${
                        theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
                      } flex items-center justify-center`}>
                        <Upload className={`w-6 h-6 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>Upload brand materials</p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        } mt-1`}>PDF, DOC, images • Multiple files OK</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>What to include:</h4>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• Brand style guides</li>
                    <li>• Color palettes</li>
                    <li>• Typography guidelines</li>
                    <li>• Logo variations</li>
                    <li>• Visual references</li>
                    <li>• Competitor examples</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Additional Brand Notes</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Tell us about your brand personality, style preferences, or anything else we should know</p>
              </div>
              
              <textarea
                value={brandAssets.additionalAssets}
                onChange={(e) => setBrandAssets(prev => ({ ...prev, additionalAssets: e.target.value }))}
                placeholder="Describe your brand style, personality, what you like/dislike, or any specific requirements..."
                rows={4}
                className={`w-full ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-800'
                } border rounded-lg p-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none`}
              />
            </div>

            {/* Brand Preview */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Brand Preview</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>See how your brand colors work together</p>
              </div>
              
              <div className={`border rounded-xl p-8 ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
                <div className="space-y-6">
                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="flex justify-center">
                      <img src={logoPreview} alt="Brand logo" className="max-h-16" />
                    </div>
                  )}

                  {/* Brand Name */}
                  <div className="text-center">
                    <h4 className="text-2xl font-bold" style={{ color: brandAssets.mainColor }}>
                      {brandAssets.brandName || 'Your Brand Name'}
                    </h4>
                  </div>

                  {/* Color Palette */}
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-200 mx-auto mb-2"
                        style={{ backgroundColor: brandAssets.mainColor }}
                      ></div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Primary</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-200 mx-auto mb-2"
                        style={{ backgroundColor: brandAssets.secondaryColor }}
                      ></div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Secondary</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-200 mx-auto mb-2"
                        style={{ backgroundColor: brandAssets.highlightColor }}
                      ></div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Accent</p>
                    </div>
                  </div>

                  {/* Sample UI */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p style={{ color: brandAssets.secondaryColor }}>
                        Sample text in your secondary color
                      </p>
                      <button
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: brandAssets.highlightColor }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Extra bottom padding to prevent overlap with bottom bar */}
        <div className="h-20"></div>
      </motion.div>
    );
  };

  const renderTargetAudienceForm = () => {
    // Smart suggestions based on business type
    const getJobTitleSuggestions = () => {
      switch (businessDetails.type) {
        case 'saas':
          return ['CTO', 'VP of Engineering', 'Software Developer', 'Product Manager', 'IT Director'];
        case 'ecommerce':
          return ['Marketing Manager', 'E-commerce Manager', 'Digital Marketing Director', 'CMO', 'Brand Manager'];
        case 'agency':
          return ['Marketing Director', 'Brand Manager', 'CMO', 'VP of Marketing', 'Business Owner'];
        case 'healthcare':
          return ['Practice Manager', 'Healthcare Administrator', 'Medical Director', 'Clinic Owner'];
        case 'finance':
          return ['CFO', 'Finance Director', 'Investment Manager', 'Financial Advisor', 'Controller'];
        default:
          return ['CEO', 'Marketing Manager', 'Operations Manager', 'Business Owner', 'Director'];
      }
    };

    const getIndustrySuggestions = () => {
      switch (businessDetails.type) {
        case 'saas':
          return ['Technology', 'Professional Services', 'Finance'];
        case 'ecommerce':
          return ['Retail', 'Manufacturing', 'Technology'];
        case 'agency':
          return ['Marketing & Advertising', 'Professional Services', 'Media & Entertainment'];
        default:
          return [];
      }
    };

    const jobTitleSuggestions = getJobTitleSuggestions();
    const industrySuggestions = getIndustrySuggestions();

    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} id="section-target-audience">Target Audience</h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Define who you want to reach with your campaign</p>
          </div>
          <ShareSection formId={formId} section="Target Audience" />
        </div>

        {/* Audience Strategy Guide */}
        <div className={`p-6 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-purple-500/30 bg-purple-900/10' : 'border-purple-300 bg-purple-50'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} mb-2`}>Think about your ideal customer</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Who makes the buying decision?</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Focus on decision-makers and influencers in the buying process
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>What's their biggest challenge?</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Think about the problems your product or service solves
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FormSection>
          <div className="space-y-8">
            {/* Job Titles with Smart Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Target Job Titles</label>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {audience.jobTitles.split('\n').filter(t => t.trim()).length} titles added
                </span>
              </div>
              
              {/* Smart suggestions based on business type */}
              {jobTitleSuggestions.length > 0 && !audience.jobTitles && (
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-blue-500/30 bg-blue-900/10' : 'border-blue-300 bg-blue-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                      Suggested job titles for {businessDetails.type} businesses:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {jobTitleSuggestions.map((title) => (
                      <button
                        key={title}
                        onClick={() => {
                          const currentTitles = audience.jobTitles ? audience.jobTitles.split('\n').filter(t => t.trim()) : [];
                          if (!currentTitles.includes(title)) {
                            const newTitles = [...currentTitles, title].join('\n');
                            setAudience(prev => ({ ...prev, jobTitles: newTitles }));
                            setTouched(prev => ({ ...prev, jobTitles: true }));
                          }
                        }}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          theme === 'dark'
                            ? 'border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
                            : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        + {title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                name="jobTitles"
                placeholder="Enter job titles, one per line (e.g., Marketing Manager, CEO, IT Director)"
                className={`w-full h-32 ${theme === 'dark' ? 'bg-gray-800/50 text-gray-200' : 'bg-white text-gray-800'} border rounded-lg p-3 focus:outline-none focus:ring-1 ${
                  touched.jobTitles && errors.jobTitles
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : touched.jobTitles && !errors.jobTitles
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
                    : theme === 'dark' 
                      ? 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500' 
                      : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                value={audience.jobTitles}
                onChange={handleAudienceChange}
                onBlur={handleBlur}
              />
              {touched.jobTitles && errors.jobTitles && (
                <p className="text-red-400 text-sm mt-1">{errors.jobTitles}</p>
              )}
              
              {/* Job titles helper */}
              {audience.jobTitles && (
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Great! You've added {audience.jobTitles.split('\n').filter(t => t.trim()).length} job titles
                </div>
              )}
            </div>

            {/* Target Industries with Smart Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Target Industries</label>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedIndustries.length} selected
                </span>
              </div>

              {/* Smart suggestions */}
              {industrySuggestions.length > 0 && selectedIndustries.length === 0 && (
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-emerald-300 bg-emerald-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      Recommended industries for your business:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {industrySuggestions.map((industry) => (
                      <button
                        key={industry}
                        onClick={() => handleIndustrySelect(industry)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          theme === 'dark'
                            ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        + {industry}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {industryOptions.map(industry => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleIndustrySelect(industry)}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedIndustries.includes(industry)
                        ? theme === 'dark'
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{industry}</span>
                      {selectedIndustries.includes(industry) && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowOtherIndustryInput(!showOtherIndustryInput)}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-2 ${
                    showOtherIndustryInput
                      ? theme === 'dark'
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Other Industry
                </button>
              </div>
              
              {showOtherIndustryInput && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otherIndustry}
                      onChange={handleOtherIndustryChange}
                      placeholder="Enter industry name"
                      className={`flex-1 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-800'} border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
                    />
                    <button
                      onClick={() => {
                        if (otherIndustry.trim()) {
                          handleIndustrySelect(otherIndustry);
                          setOtherIndustry('');
                        }
                      }}
                      disabled={!otherIndustry.trim()}
                      className={`px-4 py-2 rounded-lg ${
                        !otherIndustry.trim()
                          ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      } font-medium transition-all duration-200`}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              {touched.industries && errors.industries && (
                <p className="text-red-400 text-sm mt-1">{errors.industries}</p>
              )}
            </div>

            {/* Company Size with Better Guidance */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Company Size</label>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedCompanySizes.length} selected
                </span>
              </div>
              
              {/* Company size guidance */}
              {selectedCompanySizes.length === 0 && (
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    💡 <strong>Tip:</strong> You can select multiple company sizes. Consider both your current customers and your growth targets.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {companySizeOptions.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleCompanySizeSelect(size)}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedCompanySizes.includes(size)
                        ? theme === 'dark'
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{size}</span>
                      {selectedCompanySizes.includes(size) && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {touched.companySize && errors.companySize && (
                <p className="text-red-400 text-sm mt-1">{errors.companySize}</p>
              )}
            </div>

            {/* Target Locations with Examples */}
            <div className="space-y-4">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Target Locations (Optional)</label>
              
              {/* Location examples */}
              {!audience.locations && (
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    <strong>Examples:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['United States', 'United Kingdom', 'European Union', 'North America', 'Global', 'New York, NY', 'London, UK'].map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          const currentLocations = audience.locations ? audience.locations.split('\n').filter(l => l.trim()) : [];
                          if (!currentLocations.includes(location)) {
                            const newLocations = [...currentLocations, location].join('\n');
                            setAudience(prev => ({ ...prev, locations: newLocations }));
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        + {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                name="locations"
                placeholder="Enter locations, one per line (e.g., New York, USA, European Union, Global)"
                className={`w-full h-32 ${theme === 'dark' ? 'bg-gray-800/50 text-gray-200' : 'bg-white text-gray-800'} border rounded-lg p-3 focus:outline-none focus:ring-1 ${
                  theme === 'dark' 
                    ? 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500' 
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                value={audience.locations}
                onChange={handleAudienceChange}
              />
            </div>

            {/* Audience Summary */}
            {(audience.jobTitles || selectedIndustries.length > 0 || selectedCompanySizes.length > 0) && (
              <div className={`mt-8 p-6 rounded-xl border ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>Your Target Audience Summary</h4>
                <div className="space-y-2 text-sm">
                  {audience.jobTitles && (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Job Titles:</strong> {audience.jobTitles.split('\n').filter(t => t.trim()).join(', ')}
                    </p>
                  )}
                  {selectedIndustries.length > 0 && (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Industries:</strong> {selectedIndustries.join(', ')}
                    </p>
                  )}
                  {selectedCompanySizes.length > 0 && (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Company Sizes:</strong> {selectedCompanySizes.join(', ')}
                    </p>
                  )}
                  {audience.locations && (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Locations:</strong> {audience.locations.split('\n').filter(l => l.trim()).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </FormSection>
        {/* Extra bottom padding to prevent overlap with bottom bar */}
        <div className="pb-16"></div>
      </motion.div>
    );
  };

  // Create a reusable TextArea component with proper theme support
  const TextArea = ({ name, placeholder, value, onChange, onBlur }: { 
    name: string; 
    placeholder: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  }) => {
    const { theme } = useTheme();
    return (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full h-32 ${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500'
            : 'bg-white border-gray-300 text-gray-800 placeholder:text-gray-400'
        } border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
      />
    );
  };

  // Update the renderCampaignForm method to use the new TextArea component
  const renderCampaignForm = () => {
    // Smart suggestions based on business type and objective
    const getSuccessCriteriaExamples = () => {
      const baseExamples = {
        'awareness': [
          'Increase brand awareness by 30% in our target market',
          'Generate 10,000 impressions per month',
          'Achieve 25% increase in website traffic'
        ],
        'leads': [
          'Generate 50 qualified leads per month',
          'Achieve 15% conversion rate from visitors to leads',
          'Build email list of 1,000 subscribers'
        ],
        'sales': [
          'Increase sales by 20% this quarter',
          'Generate $100K in new revenue',
          'Convert 10% of leads to customers'
        ],
        'engagement': [
          'Increase social media engagement by 40%',
          'Achieve 500 comments and shares per post',
          'Build community of 5,000 active members'
        ]
      };
      
      return baseExamples[campaign.objective as keyof typeof baseExamples] || baseExamples.leads;
    };

    const getKeyMessageSuggestions = () => {
      switch (businessDetails.type) {
        case 'saas':
          return [
            'Save time and increase productivity',
            'Streamline your workflow',
            'Scale your business efficiently',
            'Reduce manual work by 80%'
          ];
        case 'ecommerce':
          return [
            'Premium quality at affordable prices',
            'Fast shipping and easy returns',
            'Exclusive deals for loyal customers',
            'Sustainable and eco-friendly products'
          ];
        case 'agency':
          return [
            'Expert team with proven results',
            'Customized solutions for your business',
            'ROI-focused marketing strategies',
            'Full-service digital marketing'
          ];
        default:
          return [
            'Trusted by industry leaders',
            'Proven results and expertise',
            'Personalized service and support',
            'Innovation that drives success'
          ];
      }
    };

    const successExamples = getSuccessCriteriaExamples();
    const messagesSuggestions = getKeyMessageSuggestions();

    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} id="section-campaign">Campaign</h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tell us about your marketing campaign</p>
          </div>
          <ShareSection formId={formId} section="Campaign" />
        </div>

        {/* Campaign Strategy Guide */}
        <div className={`p-6 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-orange-500/30 bg-orange-900/10' : 'border-orange-300 bg-orange-50'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              <Target className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'} mb-2`}>Campaign Planning Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Be Specific with Goals</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Use numbers and timeframes. "Increase leads by 50% in 3 months" is better than "get more leads"
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Focus on Benefits</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your key messages should highlight how you solve customer problems, not just features
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FormSection>
          <div className="space-y-8">
            {/* Campaign Basics */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Campaign Basics</h3>
              
              {/* Campaign Objective */}
              <FormField
                field={{
                  label: "Campaign Objective",
                  name: "objective",
                  icon: Target,
                  placeholder: "Select campaign objective",
                  type: "select",
                  options: [
                    { value: 'awareness', label: 'Brand Awareness' },
                    { value: 'leads', label: 'Lead Generation' },
                    { value: 'sales', label: 'Drive Sales' },
                    { value: 'engagement', label: 'Increase Engagement' },
                    { value: 'retention', label: 'Customer Retention' },
                    { value: 'loyalty', label: 'Build Brand Loyalty' }
                  ],
                  hint: "What do you want to achieve with this campaign?"
                }}
                value={campaign.objective}
                onChange={(e) => setCampaign(prev => ({ ...prev, objective: e.target.value }))}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
                autoFocus={true}
              />

              {/* Success Criteria with Smart Examples */}
              <div className="space-y-4">
                <FormField
                  field={{
                    label: "What would make this campaign successful for you?",
                    name: "successCriteria",
                    icon: Target,
                    placeholder: "Describe what success looks like for this campaign",
                    hint: "Be specific about your desired outcomes"
                  }}
                  value={campaign.successCriteria}
                  onChange={(e) => setCampaign(prev => ({ ...prev, successCriteria: e.target.value }))}
                  onBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />

                {/* Smart examples based on selected objective */}
                {campaign.objective && !campaign.successCriteria && (
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-green-500/30 bg-green-900/10' : 'border-green-300 bg-green-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                        Example success criteria for {campaign.objective} campaigns:
                      </span>
                    </div>
                    <div className="space-y-2">
                      {successExamples.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCampaign(prev => ({ ...prev, successCriteria: example }));
                            setTouched(prev => ({ ...prev, successCriteria: true }));
                          }}
                          className={`block w-full text-left p-2 rounded border transition-colors ${
                            theme === 'dark'
                              ? 'border-green-500/30 text-green-300 hover:bg-green-500/10'
                              : 'border-green-300 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          <span className="text-xs">💡</span> {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Content */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Campaign Content</h3>
              
              {/* Key Messages with Suggestions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Key Messages</label>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {campaign.keyMessages.split('\n').filter(m => m.trim()).length} messages
                  </span>
                </div>

                {/* Message suggestions */}
                {!campaign.keyMessages && businessDetails.type && (
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-blue-500/30 bg-blue-900/10' : 'border-blue-300 bg-blue-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        Suggested key messages for {businessDetails.type} businesses:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {messagesSuggestions.map((message, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const currentMessages = campaign.keyMessages ? campaign.keyMessages.split('\n').filter(m => m.trim()) : [];
                            if (!currentMessages.includes(message)) {
                              const newMessages = [...currentMessages, message].join('\n');
                              setCampaign(prev => ({ ...prev, keyMessages: newMessages }));
                            }
                          }}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            theme === 'dark'
                              ? 'border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
                              : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          + {message}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <TextArea
                  name="keyMessages"
                  value={campaign.keyMessages}
                  onChange={(e) => setCampaign(prev => ({ ...prev, keyMessages: e.target.value }))}
                  
                  placeholder="Enter your key campaign messages (one per line)&#10;Example:&#10;• Save 10 hours per week with our automation&#10;• Trusted by 10,000+ businesses worldwide&#10;• 30-day money-back guarantee"
                />

                {/* Key messages helper */}
                {campaign.keyMessages && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {campaign.keyMessages.split('\n').filter(m => m.trim()).length} key messages added
                  </div>
                )}
              </div>

              {/* Call to Action with Examples */}
              <div className="space-y-4">
                <FormField
                  field={{
                    label: "Call to Action",
                    name: "callToAction",
                    icon: ChevronRight,
                    placeholder: "e.g., 'Book a Demo', 'Sign Up Now', 'Learn More'",
                    hint: "What action do you want your audience to take?"
                  }}
                  value={campaign.callToAction}
                  onChange={(e) => setCampaign(prev => ({ ...prev, callToAction: e.target.value }))}
                  onBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />

                {/* CTA suggestions */}
                {!campaign.callToAction && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      <strong>Popular CTAs by objective:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Get Started Free',
                        'Book a Demo',
                        'Download Now',
                        'Learn More',
                        'Sign Up Today',
                        'Request Quote',
                        'Try Free Trial',
                        'Contact Sales'
                      ].map((cta) => (
                        <button
                          key={cta}
                          onClick={() => {
                            setCampaign(prev => ({ ...prev, callToAction: cta }));
                            setTouched(prev => ({ ...prev, callToAction: true }));
                          }}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            theme === 'dark'
                              ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {cta}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Preview */}
            {(campaign.objective || campaign.successCriteria || campaign.keyMessages || campaign.callToAction) && (
              <div className={`mt-8 p-6 rounded-xl border ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Campaign Summary</h4>
                <div className="space-y-3 text-sm">
                  {campaign.objective && (
                    <div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Objective:</span>
                      <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {campaign.objective.charAt(0).toUpperCase() + campaign.objective.slice(1)}
                      </span>
                    </div>
                  )}
                  {campaign.successCriteria && (
                    <div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Success Criteria:</span>
                      <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {campaign.successCriteria}
                      </span>
                    </div>
                  )}
                  {campaign.keyMessages && (
                    <div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Key Messages:</span>
                      <ul className={`ml-4 mt-1 space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {campaign.keyMessages.split('\n').filter(m => m.trim()).map((message, index) => (
                          <li key={index} className="text-sm">• {message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {campaign.callToAction && (
                    <div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Call to Action:</span>
                      <span className={`ml-2 px-3 py-1 rounded ${theme === 'dark' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} text-sm font-medium`}>
                        {campaign.callToAction}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </FormSection>
      </motion.div>
    );
  };

  const renderTypographyForm = () => {
    const commonFonts = [
      { value: 'inter', label: 'Inter' },
      { value: 'roboto', label: 'Roboto' },
      { value: 'opensans', label: 'Open Sans' },
      { value: 'montserrat', label: 'Montserrat' },
      { value: 'poppins', label: 'Poppins' },
      { value: 'custom', label: 'Custom Font' }
    ];

    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} id="section-typography">Typography</h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Choose fonts for your brand's visual identity</p>
          </div>
          <ShareSection formId={formId} section="Typography" />
        </div>

        <FormSection>
          <div className="space-y-8">
            {/* Title Font */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Title Font</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Select a font for main headings and titles</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commonFonts.map(font => (
                  <button
                    key={`title-${font.value}`}
                    type="button"
                    onClick={() => handleFontSelect(font.value, 'title')}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedFonts.title === font.value
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-500'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={font.value !== 'custom' ? font.value : ''}>{font.label}</span>
                  </button>
                ))}
              </div>
              {selectedFonts.title === 'custom' && (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={typography.customTitleFont}
                    onChange={(e) => setTypography(prev => ({ ...prev, customTitleFont: e.target.value }))}
                    placeholder="Enter custom font name"
                    className={`w-full ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-800'
                    } border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
                  />
                  <button className={`w-full p-3 border rounded-lg ${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-700/50'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                  } transition-colors flex items-center justify-center gap-2`}>
                    <Upload className="w-4 h-4" />
                    Upload font file (OTF or TTF)
                  </button>
                </div>
              )}
            </div>

            {/* Subtitle Font */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Subtitle Font</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Select a font for subheadings and section titles</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commonFonts.map(font => (
                  <button
                    key={`subtitle-${font.value}`}
                    type="button"
                    onClick={() => handleFontSelect(font.value, 'subtitle')}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedFonts.subtitle === font.value
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-500'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={font.value !== 'custom' ? font.value : ''}>{font.label}</span>
                  </button>
                ))}
              </div>
              {selectedFonts.subtitle === 'custom' && (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={typography.customSubtitleFont}
                    onChange={(e) => setTypography(prev => ({ ...prev, customSubtitleFont: e.target.value }))}
                    placeholder="Enter custom font name"
                    className={`w-full ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-800'
                    } border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
                  />
                  <button className={`w-full p-3 border rounded-lg ${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-700/50'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                  } transition-colors flex items-center justify-center gap-2`}>
                    <Upload className="w-4 h-4" />
                    Upload font file (OTF or TTF)
                  </button>
                </div>
              )}
            </div>

            {/* Body Font */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Body Font</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Select a font for main text content</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commonFonts.map(font => (
                  <button
                    key={`body-${font.value}`}
                    type="button"
                    onClick={() => handleFontSelect(font.value, 'body')}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedFonts.body === font.value
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-500'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={font.value !== 'custom' ? font.value : ''}>{font.label}</span>
                  </button>
                ))}
              </div>
              {selectedFonts.body === 'custom' && (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={typography.customBodyFont}
                    onChange={(e) => setTypography(prev => ({ ...prev, customBodyFont: e.target.value }))}
                    placeholder="Enter custom font name"
                    className={`w-full ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-800'
                    } border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
                  />
                  <button className={`w-full p-3 border rounded-lg ${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-700/50'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                  } transition-colors flex items-center justify-center gap-2`}>
                    <Upload className="w-4 h-4" />
                    Upload font file (OTF or TTF)
                  </button>
                </div>
              )}
            </div>
          </div>
        </FormSection>
        {/* Extra bottom padding to prevent overlap with bottom bar */}
        <div className="pb-16"></div>
      </motion.div>
    );
  };

  const [systemIntegrationData, setSystemIntegrationData] = useState({
    crm: {
      system: '',
      instance: '',
      apiKey: '',
      customSystem: ''
    },
    calendar: {
      system: '',
      schedulingTool: '',
      customTool: ''
    },
    process: {
      leadCapture: '',
      statusChanges: '',
      notifications: '',
      additionalSteps: '',
      customLeadCapture: ''
    }
  });

  // Update the renderSystemIntegrationForm to use the moved state and options
  const renderSystemIntegrationForm = () => {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} id="section-system-integration">System Integration</h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Connect your systems for a streamlined workflow</p>
          </div>
          <ShareSection formId={formId} section="System Integration" />
        </div>

        {/* Help Banner */}
        <div className={`${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} border rounded-lg p-4 mb-6`}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-400 font-medium mb-1">Need help with the setup?</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-emerald-400/80' : 'text-emerald-600/80'}`}>
                Don't worry if you're missing some information! You can skip fields you're unsure about, 
                and our team will guide you through the setup process later. We'll help you locate API keys, 
                configure integrations, and optimize your workflow.
              </p>
            </div>
          </div>
        </div>

        <FormSection>
          {/* CRM Integration */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-8 w-8 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} flex items-center justify-center`}>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>CRM Integration</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Connect your Customer Relationship Management system</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Select Your CRM</label>
              <div className="grid grid-cols-2 gap-3">
                {SYSTEM_INTEGRATION_OPTIONS.crm.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSystemIntegrationData(prev => ({
                      ...prev,
                      crm: { ...prev.crm, system: option.value }
                    }))}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-3
                      ${systemIntegrationData.crm.system === option.value
                        ? theme === 'dark'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-blue-50 border-blue-300 text-blue-700'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span className="flex-shrink-0">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              {systemIntegrationData.crm.system === 'other' && (
                <input
                  type="text"
                  value={systemIntegrationData.crm.customSystem}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    crm: { ...prev.crm, customSystem: e.target.value }
                  }))}
                  placeholder="Enter your CRM name"
                  className={`w-full ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-800'
                  } border rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                />
              )}
            </div>

            <div className="space-y-4">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>CRM Instance Details</label>
              <input
                type="text"
                value={systemIntegrationData.crm.instance}
                onChange={(e) => setSystemIntegrationData(prev => ({
                  ...prev,
                  crm: { ...prev.crm, instance: e.target.value }
                }))}
                placeholder="Your CRM instance name or URL"
                className={`w-full ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-800'
                } border rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              />
              <div className="relative">
                <input
                  type="password"
                  value={systemIntegrationData.crm.apiKey}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    crm: { ...prev.crm, apiKey: e.target.value }
                  }))}
                  placeholder="API Key (if available)"
                  className={`w-full ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-800'
                  } border rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Info className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} my-8`}></div>

          {/* Calendar Integration */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-8 w-8 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} flex items-center justify-center`}>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Calendar Integration</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Connect your scheduling tools</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Scheduling Tool</label>
              <div className="grid grid-cols-2 gap-3">
                {SYSTEM_INTEGRATION_OPTIONS.scheduling.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSystemIntegrationData(prev => ({
                      ...prev,
                      calendar: { ...prev.calendar, schedulingTool: option.value }
                    }))}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-3
                      ${systemIntegrationData.calendar.schedulingTool === option.value
                        ? theme === 'dark'
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                          : 'bg-purple-50 border-purple-300 text-purple-700'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span className="flex-shrink-0">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              {systemIntegrationData.calendar.schedulingTool === 'other' && (
                <input
                  type="text"
                  value={systemIntegrationData.calendar.customTool}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    calendar: { ...prev.calendar, customTool: e.target.value }
                  }))}
                  placeholder="Enter your scheduling tool name"
                  className={`w-full ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-800'
                  } border rounded-lg p-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                />
              )}
            </div>
          </div>

          <div className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} my-8`}></div>

          {/* Sales Process Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-8 w-8 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center`}>
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Sales Process Configuration</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Define your ideal sales workflow</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Lead Capture Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSystemIntegrationData(prev => ({
                    ...prev,
                    process: { ...prev.process, leadCapture: 'form' }
                  }))}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-3
                    ${systemIntegrationData.process.leadCapture === 'form'
                      ? theme === 'dark'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="flex-shrink-0"><FormInput className="w-4 h-4" /></span>
                  <span>Web Forms</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSystemIntegrationData(prev => ({
                    ...prev,
                    process: { ...prev.process, leadCapture: 'manual' }
                  }))}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-3
                    ${systemIntegrationData.process.leadCapture === 'manual'
                      ? theme === 'dark'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="flex-shrink-0"><UserPlus className="w-4 h-4" /></span>
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Lead Status Workflow</label>
              <textarea
                value={systemIntegrationData.process.leadStatusFlow}
                onChange={(e) => setSystemIntegrationData(prev => ({
                  ...prev,
                  process: { ...prev.process, leadStatusFlow: e.target.value }
                }))}
                placeholder="How should lead status changes be handled? (e.g., Qualified → Meeting Scheduled → Demo Completed)"
                className={`w-full h-24 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-800'
                } border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
              />
            </div>
          </div>
        </FormSection>
        {/* Extra bottom padding to prevent overlap with bottom bar */}
        <div className="pb-16"></div>
      </motion.div>
    );
  };

  const renderFormContent = () => {
    switch (currentStep) {
      case 0:
        return renderBusinessInfoForm();
      case 1:
        return renderCampaignForm();
      case 2:
        return renderTargetAudienceForm();
      case 3:
        return renderTypographyForm();
      case 4:
        return renderBrandAssetsForm();
      case 5:
        return renderSystemIntegrationForm();
      default:
        return renderBusinessInfoForm();
    }
  };

  const defaultSteps = [
    { id: 1, title: 'Business Details', icon: Building2 },
    { id: 2, title: 'Campaign', icon: Target },
    { id: 3, title: 'Target Audience', icon: Target },
    { id: 4, title: 'Typography', icon: Type },
    { id: 5, title: 'Brand Assets', icon: Palette },
    { id: 6, title: 'System Integration', icon: Settings }
  ];

  const handleStepClick = (index: number) => {
    setAnimatingNav(true);
    setCurrentStep(index);

    setTimeout(() => {
      setAnimatingNav(false);
    }, 600);
  };

  // Add typography font selection handler
  const handleFontSelect = (font: string, type: 'title' | 'subtitle' | 'body') => {
    setSelectedFonts(prev => ({ ...prev, [type]: font }));
    setTypography(prev => ({ ...prev, [`${type}Font`]: font }));
    
    // Clear custom font if a preset is selected
    if (font !== 'custom') {
      setTypography(prev => ({ ...prev, [`custom${type.charAt(0).toUpperCase() + type.slice(1)}Font`]: '' }));
    }
  };

  // Add this new component for the color preview card
  const ColorPreviewCard = ({
    label,
    colorValue,
    colorType,
    selectedColors,
    setSelectedColors,
    brandAssets,
    setBrandAssets
  }: {
    label: string;
    colorValue: string;
    colorType: 'mainColor' | 'secondaryColor' | 'highlightColor';
    selectedColors: any;
    setSelectedColors: any;
    brandAssets: any;
    setBrandAssets: any;
  }) => {
    return (
      <div className="flex-1 space-y-2">
        <div 
          className="relative p-4 rounded-lg cursor-pointer group transition-all duration-200 hover:ring-2 hover:ring-white/20"
          style={{ backgroundColor: colorValue }}
          onClick={() => {
            // Mark as custom when the color is clicked
            setSelectedColors(prev => ({ ...prev, [colorType.replace('Color', '')]: 'custom' }));
          }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded p-3">
            <p className="text-white text-sm font-medium">{label}</p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={colorValue.toUpperCase()}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setBrandAssets(prev => ({ ...prev, [colorType]: newColor }));
                  setSelectedColors(prev => ({ ...prev, [colorType.replace('Color', '')]: 'custom' }));
                }}
                className="w-24 bg-white/10 text-white/70 text-xs px-2 py-1 rounded border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/30"
                onClick={(e) => {
                  // Prevent event propagation to parent
                  e.stopPropagation();
                }}
              />
              <div className="relative inline-block">
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => {
                    setBrandAssets(prev => ({ ...prev, [colorType]: e.target.value }));
                    setSelectedColors(prev => ({ ...prev, [colorType.replace('Color', '')]: 'custom' }));
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  onClick={(e) => {
                    // Prevent event propagation to parent
                    e.stopPropagation();
                  }}
                />
                <div className="w-6 h-6 border border-white/30 rounded overflow-hidden flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </div>
          </div>
          {/* Add a subtle overlay on hover to indicate interactivity */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-lg transition-all duration-200" />
        </div>
      </div>
    );
  };

  // Update progress in Supabase when completedSteps changes
  useEffect(() => {
    if (!formId || completedSteps.length === 0) return;
    
    const updateProgressInSupabase = async () => {
      const newProgress = calculateProgress();
      
      try {
        await supabase
          .from('forms')
          .update({ 
            progress: newProgress
          })
          .eq('id', formId);
          
        // Invalidate the forms query to update the dashboard
        queryClient.invalidateQueries({ queryKey: ["forms"] });
      } catch (error) {
        console.error('Error updating progress in Supabase:', error);
      }
    };
    
    updateProgressInSupabase();
  }, [completedSteps, formId]);

  // Add a useEffect to handle hashtag navigation
  useEffect(() => {
    // Skip if we're still showing the welcome screen
    if (showWelcome) return;
    
    // Check if there's a hashtag in the URL
    const hash = window.location.hash;
    if (!hash) return;
    
    // Remove the # character
    const sectionSlug = hash.substring(1);
    console.log("Found section hashtag:", sectionSlug);
    
    // Map section slugs to step indices
    const sectionMap: Record<string, number> = {
      'business-details': 0,
      'campaign-details': 1,
      'target-audience': 2,
      'typography': 3,
      'brand-assets': 4,
      'system-integration': 5
    };
    
    // If we have a matching section, navigate to it
    if (sectionSlug in sectionMap) {
      const targetStep = sectionMap[sectionSlug];
      console.log("Navigating to step:", targetStep);
      setCurrentStep(targetStep);
      
      // Scroll the section into view with a slight delay to ensure rendering
      setTimeout(() => {
        const sectionElement = document.getElementById(`section-${sectionSlug}`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [showWelcome]);

  // Add state for preview background color
  const [previewBgColor, setPreviewBgColor] = useState('#FFFFFF');

  // Add auto-save functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save effect
  useEffect(() => {
    const autoSave = async () => {
      if (autoSaveStatus === 'saving') return; // Prevent multiple saves
      
      setAutoSaveStatus('saving');
      try {
        const formData = {
          businessDetails,
          campaign,
          audience,
          typography,
          brandAssets,
          completedSteps
        };

        await updateFormMutation.mutateAsync(formData);
        setLastSaved(new Date());
        setAutoSaveStatus('saved');
        
        // Reset to idle after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    };

    // Debounce auto-save by 2 seconds
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [businessDetails, campaign, audience, typography, brandAssets]);

  // Add smart suggestions for business types based on website
  const getBusinessTypeSuggestion = (website: string) => {
    if (!website) return null;
    
    const domain = website.toLowerCase();
    if (domain.includes('shop') || domain.includes('store') || domain.includes('ecommerce')) {
      return 'ecommerce';
    }
    if (domain.includes('saas') || domain.includes('software') || domain.includes('app')) {
      return 'saas';
    }
    if (domain.includes('agency') || domain.includes('marketing') || domain.includes('design')) {
      return 'agency';
    }
    if (domain.includes('health') || domain.includes('medical') || domain.includes('clinic')) {
      return 'healthcare';
    }
    return null;
  };

  // Add smart phone number formatting with country detection
  const detectCountryFromLocation = (location: string) => {
    const loc = location.toLowerCase();
    if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('england') || loc.includes('scotland') || loc.includes('wales')) {
      return 'UK';
    }
    if (loc.includes('usa') || loc.includes('united states') || loc.includes('america')) {
      return 'US';
    }
    if (loc.includes('canada')) {
      return 'CA';
    }
    if (loc.includes('australia')) {
      return 'AU';
    }
    return null;
  };

  // Enhanced phone formatting with country-specific logic
  const formatPhoneNumberSmart = (value: string, location: string = '') => {
    const cleaned = value.replace(/[^\d\s+]/g, '');
    const country = detectCountryFromLocation(location);
    
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    switch (country) {
      case 'UK':
        if (cleaned.startsWith('0')) {
          return `+44 ${cleaned.substring(1)}`;
        }
        break;
      case 'US':
      case 'CA':
        if (cleaned.length === 10) {
          return `+1 ${cleaned}`;
        }
        break;
      case 'AU':
        if (cleaned.startsWith('0')) {
          return `+61 ${cleaned.substring(1)}`;
        }
        break;
    }
    
    return cleaned;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} relative overflow-hidden`}>
      
      {/* Add background decoration that works in both themes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full ${theme === 'dark' ? 'bg-emerald-900/5' : 'bg-emerald-100/50'}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full ${theme === 'dark' ? 'bg-emerald-900/5' : 'bg-emerald-100/50'}`}></div>
      </div>
      
      {showWelcome ? (
        <div className="h-screen flex items-center justify-center">
          <WelcomeScreen 
            clientName={businessDetails.name || ''} 
            onStart={() => setShowWelcome(false)} 
          />
        </div>
      ) : isCompleted ? (
        <div className="flex-1 flex items-center justify-center">
          <CompletionScreen 
            clientName={businessDetails.name || ''} 
            formData={{
              businessDetails,
              campaign,
              audience,
              typography,
              brandAssets,
              systemIntegration: systemIntegrationData
            }}
            onClose={() => window.close()} 
            isAdmin={false}
          />
        </div>
      ) : (
        <>
          {/* Left sidebar with progress tracker */}
          <div className={`hidden md:block fixed top-0 left-0 h-screen w-64 ${theme === 'dark' ? 'bg-[#02040a] border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col`}>
            <div className="p-6 flex-1 overflow-y-auto">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>Onboarding</h1>
              <ProgressTracker 
                steps={steps} 
                currentStep={currentStep} 
                onStepClick={handleStepClick}
                isAnimating={animatingNav}
              />
            </div>
          </div>

          {/* Main content area - added bottom padding to prevent content from being hidden by bottom bar */}
          <div className={`flex-1 md:ml-64 ${theme === 'dark' ? 'bg-[#0d1116]' : 'bg-gray-50'} min-h-screen`}>
            <div className="max-w-4xl mx-auto p-6 md:p-10 pb-36">
              {/* Mobile progress indicator */}
              <div className="md:hidden mb-8">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>Onboarding</h1>
                <ProgressTracker steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
              </div>

              {/* Form content */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {renderFormContent()}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Bottom progress tracker container - hide when welcome screen or completion screen is shown */}
      {!showWelcome && !isCompleted && (
        <div className={`fixed bottom-0 left-0 p-4 z-20 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/90'} backdrop-blur-sm border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} w-full`}>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ProgressPie progress={formProgress} />
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formProgress === 100 ? 'Completed!' : `${formProgress}% Complete`}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentStep + 1} of {steps.length} sections
                </p>
              </div>
            </div>
            <div>
              {/* Continue/Previous buttons with theme awareness */}
              <div className="flex space-x-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => handleStepNavigation('previous')}
                    disabled={isSubmitting || animatingNav}
                    className={`flex items-center ${theme === 'dark' ? 'text-gray-200 border-gray-700 hover:bg-gray-800' : 'text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={() => handleStepNavigation('next')}
                    disabled={hasFormErrors() || isSubmitting || animatingNav}
                    className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={hasFormErrors() || isSubmitting}
                    className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmitting ? 'Saving...' : 'Complete Form'} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OnboardingForm;

interface BrandAssets {
  brandName: string;
  logo: File | null;
  mainColor: string;
  secondaryColor: string;
  highlightColor: string;
  additionalAssets: string;
}