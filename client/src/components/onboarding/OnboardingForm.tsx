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
  name: keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize";
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
    case 'campaignName':
      if (!value || !value.trim()) error = 'Campaign name is required';
      else if (value.trim().length < 2) error = 'Campaign name must be at least 2 characters';
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
    location: '',
    brandName: "",
    logo: null,
    mainColor: "#000000",
    secondaryColor: "#000000",
    highlightColor: "#000000"

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
      setBusinessDetails(section.data.businessDetails || {});
    } else if (form?.data?.businessDetails) {
      setBusinessDetails(form.data.businessDetails);
    }
  }, [form, section, sectionId]);

  // Load campaign data from form data
  useEffect(() => {
    if (sectionId && section?.data?.campaign) {
      setCampaign(section.data.campaign);
    } else if (form?.data?.campaign) {
      setCampaign(form.data.campaign);
    }
  }, [form, section, sectionId]);

  // Load audience data from form data
  useEffect(() => {
    if (sectionId && section?.data?.audience) {
      setAudience(section.data.audience);
    } else if (form?.data?.audience) {
      setAudience(form.data.audience);
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
    e.stopPropagation();
    // Share functionality is handled by the ShareSection component
  };

  const hasFormErrors = () => {
    return Object.values(errors).some(error => error !== '');
  };

  const renderBusinessInfoForm = () => {
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
          </div>
          <ShareSection formId={formId} section="Business Details" />
        </div>

        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Identity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Business Identity</h3>
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
              <FormField
                key="type"
                field={formFields[1]} // Business Type
                value={businessDetails.type}
                onChange={handleChange}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
              />
            </div>

            {/* Location & Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Location & Contact</h3>
              <FormField
                key="location"
                field={formFields[5]} // Location
                value={businessDetails.location}
                onChange={handleChange}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
              />
              <FormField
                key="phone"
                field={formFields[4]} // Phone Number
                value={businessDetails.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
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
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} id="section-brand-assets">Brand Assets</h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Upload your brand logo and select your brand colors</p>
          </div>
          <ShareSection formId={formId} section="Brand Assets" />
        </div>

        <FormSection>
          <div className="space-y-8">
            {/* Logo Upload */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Brand Logo</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Upload your company logo</p>
              </div>
              
              <div className="mt-4">
                <input
                  type="file"
                  id="logo-upload"
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className={`block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'border-gray-700 hover:border-gray-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    {logoPreview ? (
                      <div className="space-y-4">
                        <img src={logoPreview} alt="Logo preview" className="max-h-40 mx-auto" />
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setLogoPreview('');
                            setLogoFile(null);
                          }}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove logo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`w-20 h-20 mx-auto rounded-full ${
                          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
                        } flex items-center justify-center`}>
                          <Upload className={`w-8 h-8 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>Drop your logo here or click to upload</p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          } mt-1`}>SVG, PNG, or JPG (max. 800x400px)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Brand Colors</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Choose colors that represent your brand</p>
              </div>

              {/* Main Color */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Main Color</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {brandPresets.mainColor.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setSelectedColors(prev => ({ ...prev, main: color.value }));
                        if (color.value !== 'custom') {
                          setBrandAssets(prev => ({ ...prev, mainColor: color.value }));
                        }
                      }}
                      className={`group relative h-16 rounded-lg transition-all duration-200 ${
                        selectedColors.main === color.value
                          ? `ring-2 ${theme === 'dark' ? 'ring-white' : 'ring-gray-800'} ring-offset-2 ${theme === 'dark' ? 'ring-offset-gray-900' : 'ring-offset-white'}`
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color.value === 'custom' ? (theme === 'dark' ? '#374151' : '#F3F4F6') : color.value,
                        border: color.value === 'custom' ? `2px dashed ${theme === 'dark' ? '#4B5563' : '#D1D5DB'}` : 'none'
                      }}
                    >
                      <span className="sr-only">{color.name}</span>
                      {color.value === 'custom' && (
                        <input
                          type="color"
                          value={brandAssets.mainColor}
                          onChange={(e) => {
                            setBrandAssets(prev => ({ ...prev, mainColor: e.target.value }));
                            setSelectedColors(prev => ({ ...prev, main: 'custom' }));
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      )}
                      <span className={`absolute inset-x-0 bottom-0 px-2 py-1 text-xs ${
                        theme === 'dark' ? 'text-gray-300 bg-black/50' : 'text-gray-700 bg-white/70'
                      } rounded-b-lg`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Secondary Color</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {brandPresets.secondaryColor.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setSelectedColors(prev => ({ ...prev, secondary: color.value }));
                        if (color.value !== 'custom') {
                          setBrandAssets(prev => ({ ...prev, secondaryColor: color.value }));
                        }
                      }}
                      className={`group relative h-16 rounded-lg transition-all duration-200 ${
                        selectedColors.secondary === color.value
                          ? `ring-2 ${theme === 'dark' ? 'ring-white' : 'ring-gray-800'} ring-offset-2 ${theme === 'dark' ? 'ring-offset-gray-900' : 'ring-offset-white'}`
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color.value === 'custom' ? (theme === 'dark' ? '#374151' : '#F3F4F6') : color.value,
                        border: color.value === 'custom' ? `2px dashed ${theme === 'dark' ? '#4B5563' : '#D1D5DB'}` : 'none'
                      }}
                    >
                      <span className="sr-only">{color.name}</span>
                      {color.value === 'custom' && (
                        <input
                          type="color"
                          value={brandAssets.secondaryColor}
                          onChange={(e) => {
                            setBrandAssets(prev => ({ ...prev, secondaryColor: e.target.value }));
                            setSelectedColors(prev => ({ ...prev, secondary: 'custom' }));
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      )}
                      <span className={`absolute inset-x-0 bottom-0 px-2 py-1 text-xs ${
                        theme === 'dark' ? 'text-gray-300 bg-black/50' : 'text-gray-700 bg-white/70'
                      } rounded-b-lg`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlight Color */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Highlight Color</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {brandPresets.highlightColor.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setSelectedColors(prev => ({ ...prev, highlight: color.value }));
                        if (color.value !== 'custom') {
                          setBrandAssets(prev => ({ ...prev, highlightColor: color.value }));
                        }
                      }}
                      className={`group relative h-16 rounded-lg transition-all duration-200 ${
                        selectedColors.highlight === color.value
                          ? `ring-2 ${theme === 'dark' ? 'ring-white' : 'ring-gray-800'} ring-offset-2 ${theme === 'dark' ? 'ring-offset-gray-900' : 'ring-offset-white'}`
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color.value === 'custom' ? (theme === 'dark' ? '#374151' : '#F3F4F6') : color.value,
                        border: color.value === 'custom' ? `2px dashed ${theme === 'dark' ? '#4B5563' : '#D1D5DB'}` : 'none'
                      }}
                    >
                      <span className="sr-only">{color.name}</span>
                      {color.value === 'custom' && (
                        <input
                          type="color"
                          value={brandAssets.highlightColor}
                          onChange={(e) => {
                            setBrandAssets(prev => ({ ...prev, highlightColor: e.target.value }));
                            setSelectedColors(prev => ({ ...prev, highlight: 'custom' }));
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      )}
                      <span className={`absolute inset-x-0 bottom-0 px-2 py-1 text-xs ${
                        theme === 'dark' ? 'text-gray-300 bg-black/50' : 'text-gray-700 bg-white/70'
                      } rounded-b-lg`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Brand Assets */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Additional Brand Assets</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Describe any other brand assets or guidelines you'd like us to know about</p>
              </div>
              
              <textarea
                value={brandAssets.additionalAssets}
                onChange={(e) => setBrandAssets(prev => ({ ...prev, additionalAssets: e.target.value }))}
                placeholder="Describe any other brand assets, guidelines, or requirements (e.g., patterns, icons, imagery style, brand voice)"
                className={`w-full h-32 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-800'
                } border rounded-lg p-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
              />
            </div>

            {/* Brand Preview */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Brand Preview</h3>
                <div className="flex items-center gap-2">
                  <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Background:
                  </label>
                  <div className="relative w-6 h-6 rounded overflow-hidden border border-gray-400">
                    <input
                      type="color"
                      value={previewBgColor}
                      onChange={(e) => setPreviewBgColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0" style={{ backgroundColor: previewBgColor }}></div>
                  </div>
                  <button
                    onClick={() => setPreviewBgColor('#FFFFFF')}
                    className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-opacity`}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div 
                className="border rounded-lg p-6 overflow-hidden transition-colors duration-200"
                style={{ backgroundColor: previewBgColor }}
              >
                <div className="space-y-6">
                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="flex justify-center p-4 bg-white/50 backdrop-blur-sm rounded-lg">
                      <img src={logoPreview} alt="Brand logo" className="max-h-24" />
                    </div>
                  )}

                  {/* Color Scheme Preview */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <ColorPreviewCard
                        label="Main Color"
                        colorValue={brandAssets.mainColor}
                        colorType="mainColor"
                        selectedColors={selectedColors}
                        setSelectedColors={setSelectedColors}
                        brandAssets={brandAssets}
                        setBrandAssets={setBrandAssets}
                      />
                      <ColorPreviewCard
                        label="Secondary Color"
                        colorValue={brandAssets.secondaryColor}
                        colorType="secondaryColor"
                        selectedColors={selectedColors}
                        setSelectedColors={setSelectedColors}
                        brandAssets={brandAssets}
                        setBrandAssets={setBrandAssets}
                      />
                      <ColorPreviewCard
                        label="Highlight Color"
                        colorValue={brandAssets.highlightColor}
                        colorType="highlightColor"
                        selectedColors={selectedColors}
                        setSelectedColors={setSelectedColors}
                        brandAssets={brandAssets}
                        setBrandAssets={setBrandAssets}
                      />
                    </div>

                    {/* Sample UI Elements */}
                    <div className="p-6 rounded-lg space-y-4" style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)' }}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold" style={{ color: brandAssets.mainColor }}>
                          {businessDetails.name || 'Your Brand Name'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setBrandAssets(prev => ({ ...prev, mainColor: brandAssets.mainColor }));
                              setSelectedColors(prev => ({ ...prev, main: 'custom' }));
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                            style={{ borderColor: brandAssets.mainColor }}
                          >
                            Use for Main
                          </button>
                          <button
                            onClick={() => {
                              setBrandAssets(prev => ({ ...prev, secondaryColor: brandAssets.mainColor }));
                              setSelectedColors(prev => ({ ...prev, secondary: 'custom' }));
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                            style={{ borderColor: brandAssets.secondaryColor }}
                          >
                            Use for Secondary
                          </button>
                          <button
                            onClick={() => {
                              setBrandAssets(prev => ({ ...prev, highlightColor: brandAssets.mainColor }));
                              setSelectedColors(prev => ({ ...prev, highlight: 'custom' }));
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                            style={{ borderColor: brandAssets.highlightColor }}
                          >
                            Use for Highlight
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: brandAssets.secondaryColor }}>
                          Sample text using your brand's secondary color
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setBrandAssets(prev => ({ ...prev, mainColor: brandAssets.secondaryColor }));
                              setSelectedColors(prev => ({ ...prev, main: 'custom' }));
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                            style={{ borderColor: brandAssets.mainColor }}
                          >
                            Use for Main
                          </button>
                          <button
                            onClick={() => {
                              setBrandAssets(prev => ({ ...prev, highlightColor: brandAssets.secondaryColor }));
                              setSelectedColors(prev => ({ ...prev, highlight: 'custom' }));
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                            style={{ borderColor: brandAssets.highlightColor }}
                          >
                            Use for Highlight
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200"
                          style={{ backgroundColor: brandAssets.highlightColor }}
                        >
                          Sample Button
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setBrandAssets(prev => ({ ...prev, mainColor: brandAssets.highlightColor }));
                              setSelectedColors(prev => ({ ...prev, main: 'custom' }));
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                            style={{ borderColor: brandAssets.mainColor }}
                          >
                            Use for Main
                          </button>
                          <button
                            onClick={() => {
                              setBrandAssets(prev => ({ ...prev, secondaryColor: brandAssets.highlightColor }));
                              setSelectedColors(prev => ({ ...prev, secondary: 'custom' }));
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                            style={{ borderColor: brandAssets.secondaryColor }}
                          >
                            Use for Secondary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>
        {/* Extra bottom padding to prevent overlap with bottom bar */}
        <div className="pb-16"></div>
      </motion.div>
    );
  };

  const renderTargetAudienceForm = () => {
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

        <FormSection>
          <div className="space-y-6">
            {/* Job Titles */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mb-2`}>Target Job Titles</label>
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
            </div>

            {/* Target Industries */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mb-2`}>Target Industries</label>
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
                    {industry}
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

            {/* Company Size */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mb-2`}>Company Size</label>
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
                    {size}
                  </button>
                ))}
              </div>
              {touched.companySize && errors.companySize && (
                <p className="text-red-400 text-sm mt-1">{errors.companySize}</p>
              )}
            </div>

            {/* Target Locations */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mb-2`}>Target Locations</label>
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

        <FormSection>
          <div className="space-y-8">
            {/* Campaign Basics */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Campaign Basics</h3>
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
                autoFocus={true}
              />
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
              />
            </div>

            {/* Campaign Content */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Campaign Content</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Key Messages</label>
                  <TextArea
                    name="keyMessages"
                    value={campaign.keyMessages}
                    onChange={(e) => setCampaign(prev => ({ ...prev, keyMessages: e.target.value }))}
                    onBlur={(e) => handleBlur(e)}
                    placeholder="Enter your key campaign messages (one per line)"
                  />
                </div>

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
              </div>
            </div>
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