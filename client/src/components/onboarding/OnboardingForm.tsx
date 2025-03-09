import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette, Building2, Type, Settings, Share, Globe, Phone, Linkedin, MapPin, Target, ChevronRight, AlertCircle, Info, CheckCircle2, ChevronLeft, Upload, Calendar } from 'lucide-react';
import { ProgressTracker, type Step } from './ProgressTracker';
import { type BusinessDetails, type OnboardingForm as FormType } from '@shared/schema';
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getFormData, updateFormData, getSectionData, updateSectionData } from '@/lib/supabase';
import { supabase } from "@/lib/supabase";

// ShareSection Component
interface ShareSectionProps {
  formId: number;
  section: string;
}

const ShareSection = ({ formId, section }: ShareSectionProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      const { data, error } = await supabase
        .from('form_sections')
        .insert({
          form_id: formId,
          section,
          share_id: Math.random().toString(36).substring(7),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Section shared!",
        description: "A shareable link has been created.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error sharing section:', error);
      toast({
        title: "Error",
        description: "Failed to share section. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
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
  // A field is only valid if:
  // 1. It has been touched
  // 2. Has no errors
  // 3. Has a value
  // 4. For text fields, the value is not just whitespace
  const isValid = touched[name] && !errors[name] && value && (type === 'select' ? true : value.trim() !== '');
  const inputId = `field-${name}`;

  return (
    <div className="group">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-2 flex items-center justify-between">
        <span className="flex items-center">
          {label}
          {hint && !hasError && (
            <span className="ml-2 text-gray-500 cursor-help group-hover:text-gray-400 transition-colors" title={hint}>
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        {hasError && (
          <span className="text-red-400 text-xs flex items-center animate-fadeIn">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors[name]}
          </span>
        )}
      </label>
      <div className={`relative border rounded-lg overflow-hidden bg-gray-800/50 group hover:border-gray-600 transition-all duration-200 focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 
        ${hasError
          ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400'
          : isValid
            ? 'border-emerald-500/50 shadow-sm shadow-emerald-500/10'
            : 'border-gray-700'
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute top-0 bottom-0 left-0 w-16 flex items-center justify-center bg-gray-700/50 border-r border-gray-700 rounded-l-lg transition-colors duration-200 
          ${hasError ? 'bg-red-900/20' : isValid ? 'bg-emerald-900/20' : ''}`}
        >
          <Icon className={`w-4 h-4 ${
            hasError ? 'text-red-400' : isValid ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'
          } transition-colors duration-200`} />
        </div>

        {type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className="w-full h-full py-3 pl-20 pr-10 bg-transparent text-gray-200 appearance-none focus:outline-none transition-all duration-200"
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${name}-error` : undefined}
            autoFocus={autoFocus}
          >
            <option value="" disabled>{placeholder}</option>
            {options && options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
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
            className="w-full bg-transparent text-gray-200 pl-20 pr-4 py-3 focus:outline-none"
            placeholder={placeholder}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${name}-error` : undefined}
            autoComplete={name === 'name' ? 'organization' : name === 'website' ? 'url' : name === 'phone' ? 'tel' : name === 'location' ? 'address-level2' : 'off'}
            autoFocus={autoFocus}
          />
        )}

        {isValid && !hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </motion.div>
          </div>
        )}

        {type === 'select' && (
          <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
            hasError ? 'text-red-400' : 'text-gray-500 group-hover:text-emerald-400'
          } transition-colors duration-200`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        )}
      </div>

      {name === 'website' && !hasError && (
        <p id="website-hint" className="mt-1 text-xs text-gray-500 flex items-center">
          <Info className="w-3 h-3 mr-1 text-gray-500" />
          Include https:// for external links
        </p>
      )}
      {name === 'phone' && !hasError && (
        <p id="phone-hint" className="mt-1 text-xs text-gray-500 flex items-center">
          <Info className="w-3 h-3 mr-1 text-gray-500" />
          Enter your phone number with country code (e.g., +44 for UK)
        </p>
      )}
      {hasError && <p id={`${name}-error`} className="sr-only">{errors[name]}</p>}
    </div>
  );
};

const validateField = (name: keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize", value: string) => {
  let error = '';

  // Don't validate empty optional fields
  if (!value && ['linkedin', 'website', 'keyMessages', 'callToAction', 'locations'].includes(name)) {
    return error;
  }

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
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-emerald-900/10 hover:border-gray-600/50 transition-all duration-300 backdrop-blur-sm">
      {children}
    </div>
  );
};

const Input = ({ id, type = "text", placeholder, className, value, onChange }: { id: string; type?: string; placeholder: string; className: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type={type}
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`${className} bg-gray-800/50 border border-gray-700 text-gray-200 p-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
  />
)

// Add these constants outside of any component
const SYSTEM_INTEGRATION_OPTIONS = {
  crm: [
    { value: 'salesforce', label: 'Salesforce', icon: '⭐️' },
    { value: 'hubspot', label: 'HubSpot', icon: '🟠' },
    { value: 'zoho', label: 'Zoho CRM', icon: '🔵' },
    { value: 'pipedrive', label: 'Pipedrive', icon: '🟢' },
    { value: 'freshsales', label: 'Freshsales', icon: '🌟' },
    { value: 'other', label: 'Other CRM', icon: '➕' }
  ],
  calendar: [
    { value: 'google', label: 'Google Calendar', icon: '📅' },
    { value: 'outlook', label: 'Outlook Calendar', icon: '📆' },
    { value: 'apple', label: 'Apple Calendar', icon: '🗓️' },
    { value: 'other', label: 'Other Calendar', icon: '➕' }
  ],
  scheduling: [
    { value: 'calendly', label: 'Calendly', icon: '🎯' },
    { value: 'youcanbook.me', label: 'YouCanBook.me', icon: '📚' },
    { value: 'hubspot', label: 'HubSpot Meetings', icon: '🟠' },
    { value: 'other', label: 'Other Tool', icon: '➕' }
  ]
};

// Update the ProgressPie component to use emerald color
const ProgressPie = ({ progress }: { progress: number }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="transform -rotate-90 w-20 h-20">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgba(16, 185, 129, 0.8)" // Changed to emerald color
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-emerald-400">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export function OnboardingForm({ formId, sectionId }: Props) {
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

  // Added state for brand assets
  const [brandAssets, setBrandAssets] = useState({
    brandName: '',
    mainColor: '#000000',
    secondaryColor: '#000000',
    highlightColor: '#000000'
  });

  // Added state for file upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Add new state for campaign and audience data
  const [campaign, setCampaign] = useState({
    campaignName: '',
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

  // Add new state for selected company sizes
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([]);

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
      label: "Campaign Name",
      name: "campaignName",
      icon: Target,
      placeholder: "What is your campaign called?",
      type: "text"
    },
    {
      label: "Campaign Objective",
      name: "objective",
      icon: Target,
      placeholder: "Select an objective",
      type: "select",
      options: [
        { value: 'awareness', label: 'Brand Awareness' },
        { value: 'leads', label: 'Lead Generation' },
        { value: 'sales', label: 'Sales' },
        { value: 'engagement', label: 'Engagement' }
      ]
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
        { value: '500+', label: '500+ employees' }
      ]
    }
  ];

  // Move getRequiredFields to component level
  const getRequiredFields = () => {
      switch (currentStep) {
        case 0: // Business Details
        return ['name', 'type', 'phone', 'location'];
        case 1: // Campaign
          return ['campaignName', 'objective'];
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
    // Count total fields and completed fields
    const totalFields = getRequiredFields().length;
    let completedFields = 0;

    // Check each required field based on current step
    getRequiredFields().forEach(field => {
      if (field in businessDetails && businessDetails[field] && !errors[field]) {
        completedFields++;
      }
      if (field in campaign && campaign[field] && !errors[field]) {
        completedFields++;
      }
      if (field in audience && audience[field] && !errors[field]) {
        completedFields++;
      }
      if (field in typography && typography[field] && !errors[field]) {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
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
  }, [businessDetails, campaign, audience, typography, errors]);

  useEffect(() => {
    if (sectionId && section?.data) {
      setBusinessDetails(section.data as BusinessDetails);
    } else if (form?.data) {
      setBusinessDetails(form.data as BusinessDetails);
    }
  }, [form, section, sectionId]);


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
      if (name === "campaignName" || name === "objective" || name === "keyMessages" || name === "callToAction") {
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
    const error = validateField(name as keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize", name === 'phone' ? formatPhoneNumber(value) : value);
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
    const error = validateField(name as keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize", businessDetails[name as keyof BusinessDetails] || campaign[name as keyof typeof campaign] || audience[name as keyof typeof audience] || "");
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
    
    // Mark field as touched and validate immediately
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name as "campaignName" | "objective", value);
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

    // Calculate and save progress before moving to next step
    if (direction === 'next') {
      const newProgress = calculateProgress();
      try {
        await supabase
          .from('forms')
          .update({ 
            progress: newProgress,
            data: {
              ...form?.data,
              businessDetails,
              campaign,
              audience,
              typography
            }
          })
          .eq('id', formId);

        // Invalidate the forms query to update the dashboard
        queryClient.invalidateQueries({ queryKey: ["forms"] });
      } catch (error) {
        console.error('Error updating progress:', error);
        toast({
          title: "Error",
          description: "Failed to save progress",
          variant: "destructive"
        });
      }

      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
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
      const error = validateField(field as keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize", value);
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

      // If this is the final section, show completion message
      if (currentStep === steps.length - 1) {
        toast({
        title: "Success!",
        description: "Your form has been completed successfully",
        variant: "default"
      });
      } else {
        // Show section completion message and move to next section
        toast({
          title: "Section completed!",
          description: `${steps[currentStep].title} has been saved successfully`,
          variant: "default"
        });
        
        // Move to next section
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
    const isLastSection = currentStep === steps.length - 1;
    
    return (
      <div className="flex justify-between items-center mt-8">
        <div className="flex space-x-3">
          {currentStep > 0 && (
            <button
              onClick={() => handleStepNavigation('previous')}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-all duration-200 flex items-center transform hover:scale-105"
              disabled={animatingNav}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button
              onClick={() => handleStepNavigation('next')}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-all duration-200 flex items-center transform hover:scale-105"
              disabled={animatingNav}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
        <button
          onClick={handleComplete}
          className={`px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg text-white font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg hover:shadow-emerald-700/20 transform hover:scale-105 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              {isLastSection ? 'Complete Form' : 'Complete Section'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    );
  };

  const handleShareSection = (e: React.MouseEvent, sectionTitle: string) => {
    e.stopPropagation();
    // Share functionality is handled by the ShareSection component
  };

  const getStepStatus = (stepId: number): Step['status'] => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  // Update steps with current status
  const steps = [
    { id: 1, title: 'Business Details', icon: Building2, status: getStepStatus(0) },
    { id: 2, title: 'Campaign', icon: Target, status: getStepStatus(1) },
    { id: 3, title: 'Target Audience', icon: Target, status: getStepStatus(2) },
    { id: 4, title: 'Typography', icon: Type, status: getStepStatus(3) },
    { id: 5, title: 'Brand Assets', icon: Palette, status: getStepStatus(4) },
    { id: 6, title: 'System Integration', icon: Settings, status: getStepStatus(5) }
  ];


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
        className="w-full"
      >
        {/* Form Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Business Details</h2>
            <p className="text-gray-400 mt-1">Tell us about your business</p>
          </div>
          <ShareSection formId={1} section="Business Details" />
        </div>

        {/* Form Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-400">Form Progress</span>
            <span className="text-sm font-medium text-emerald-400">{formProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${formProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <FormSection>
          {/* Primary Business Information */}
          <div className="space-y-6">
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

            {/* Online Presence - Full Width Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Online Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  key="website"
                  field={formFields[2]} // Website
                  value={businessDetails.website}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                <FormField
                  key="linkedin"
                  field={formFields[3]} // LinkedIn
                  value={businessDetails.linkedin}
                  onChange={handleChange}
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

  const renderBrandAssetsForm = () => {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Brand Assets</h2>
            <p className="text-gray-400 mt-1">Define your brand's visual identity</p>
          </div>
          <ShareSection formId={1} section="Brand Assets" />
        </div>

        <FormSection>
          <div className="space-y-8">
            {/* Brand Logo */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Brand Logo</h3>
                <p className="text-sm text-gray-400 mt-1">Upload your brand logo in high resolution</p>
            </div>
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 
                ${logoPreview ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-gray-700 hover:border-emerald-500/50'}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                  onChange={handleLogoUpload}
                />
                <label
                  htmlFor="logo-upload"
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
                      <div className="w-20 h-20 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Drop your logo here or click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, or JPG (max. 800x400px)</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Brand Colors</h3>
                <p className="text-sm text-gray-400 mt-1">Choose colors that represent your brand</p>
          </div>

              {/* Main Color */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Main Color</label>
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
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color.value === 'custom' ? '#374151' : color.value,
                        border: color.value === 'custom' ? '2px dashed #4B5563' : 'none'
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
                      <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-xs text-gray-300 bg-black/50 rounded-b-lg">
                        {color.name}
                      </span>
                    </button>
                  ))}
                    </div>
                  </div>

              {/* Secondary Color */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Secondary Color</label>
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
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color.value === 'custom' ? '#374151' : color.value,
                        border: color.value === 'custom' ? '2px dashed #4B5563' : 'none'
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
                      <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-xs text-gray-300 bg-black/50 rounded-b-lg">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlight Color */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Highlight Color</label>
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
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color.value === 'custom' ? '#374151' : color.value,
                        border: color.value === 'custom' ? '2px dashed #4B5563' : 'none'
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
                      <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-xs text-gray-300 bg-black/50 rounded-b-lg">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
            </div>
          </div>

            {/* Brand Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Brand Preview</h3>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                <div className="space-y-6">
                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="flex justify-center p-4 bg-gray-900/50 rounded-lg">
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
                    <div className="p-6 bg-gray-900/50 rounded-lg space-y-4">
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Target Audience</h2>
            <p className="text-gray-400 mt-1">Define who you want to reach with your campaign</p>
          </div>
          <ShareSection formId={1} section="Target Audience" />
        </div>

        <FormSection>
          <div className="space-y-6">
            {/* Job Titles */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white mb-2">Target Job Titles</label>
              <textarea
                name="jobTitles"
                placeholder="Enter job titles, one per line (e.g., Marketing Manager, CEO, IT Director)"
                className={`w-full h-32 bg-gray-800/50 border rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-1 ${
                  touched.jobTitles && errors.jobTitles
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : touched.jobTitles && !errors.jobTitles
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
                    : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500'
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
              <label className="block text-sm font-medium text-white mb-2">Target Industries</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  'Software & SaaS',
                  'IT Services & Consulting',
                  'Financial Services',
                  'Professional Services',
                  'Digital Marketing & Advertising',
                  'Business Services',
                  'Manufacturing & Industrial',
                  'Healthcare Technology',
                  'EdTech & E-Learning',
                  'Cybersecurity',
                  'Cloud Services',
                  'Data Analytics & BI',
                  'Telecommunications',
                  'Legal Services',
                  'Other'
                ].map(industry => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleIndustrySelect(industry)}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedIndustries.includes(industry)
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>

              {selectedIndustries.includes('Other') && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={otherIndustry}
                    onChange={handleOtherIndustryChange}
                    placeholder="Please specify other industries"
                    className={`w-full bg-gray-800/50 border rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-1 ${
                      touched.industries && errors.industries
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                  />
                </div>
              )}
              
              {touched.industries && errors.industries && (
                <p className="text-red-400 text-sm mt-1">{errors.industries}</p>
              )}
            </div>

            {/* Company Size - Updated to use multi-select buttons */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white mb-2">Target Company Sizes</label>
              <p className="text-sm text-gray-400 mb-3">Select all company sizes you want to target</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: '1-10', label: '1-10 employees' },
                  { value: '11-50', label: '11-50 employees' },
                  { value: '51-200', label: '51-200 employees' },
                  { value: '201-500', label: '201-500 employees' },
                  { value: '500+', label: '500+ employees' }
                ].map(size => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => handleCompanySizeSelect(size.value)}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedCompanySizes.includes(size.value)
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              {touched.companySize && errors.companySize && (
                <p className="text-red-400 text-sm mt-1">{errors.companySize}</p>
              )}
            </div>

            {/* Target Locations - Optional */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white mb-2">Target Locations (Optional)</label>
              <textarea
                name="locations"
                placeholder="Enter target locations (e.g., North America, Europe, Global)"
                className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={audience.locations}
                onChange={handleAudienceChange}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </FormSection>
      </motion.div>
    );
  };

  const renderCampaignForm = () => {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Campaign Details</h2>
            <p className="text-gray-400 mt-1">Tell us about your marketing campaign</p>
          </div>
          <ShareSection formId={1} section="Campaign Details" />
        </div>

        <FormSection>
          <div className="space-y-6">
            {/* Campaign Identity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Campaign Identity</h3>
            <FormField
                field={{
                  label: "Campaign Name",
                  name: "campaignName",
                  icon: Target,
                  placeholder: "Enter your campaign name",
                  hint: "A memorable name for your campaign"
                }}
                value={campaign.campaignName}
                onChange={(e) => setCampaign(prev => ({ ...prev, campaignName: e.target.value }))}
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
              <h3 className="text-lg font-semibold text-white mb-4">Campaign Content</h3>
              <div className="space-y-4">
                <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Key Messages</label>
            <textarea
              value={campaign.keyMessages}
                    onChange={(e) => setCampaign(prev => ({ ...prev, keyMessages: e.target.value }))}
                    onBlur={(e) => handleBlur(e)}
                    name="keyMessages"
                    placeholder="Enter your key campaign messages (one per line)"
                    className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Typography</h2>
            <p className="text-gray-400 mt-1">Choose fonts for your brand's visual identity</p>
          </div>
          <ShareSection formId={1} section="Typography" />
        </div>

        <FormSection>
          <div className="space-y-8">
            {/* Title Font */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Title Font</h3>
                <p className="text-sm text-gray-400 mt-1">Select a font for main headings and titles</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commonFonts.map(font => (
                  <button
                    key={`title-${font.value}`}
                    type="button"
                    onClick={() => handleFontSelect(font.value, 'title')}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedFonts.title === font.value
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button className="w-full p-3 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload font file (OTF or TTF)
            </button>
                </div>
              )}
          </div>

          {/* Subtitle Font */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Subtitle Font</h3>
                <p className="text-sm text-gray-400 mt-1">Select a font for subheadings and section titles</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commonFonts.map(font => (
                  <button
                    key={`subtitle-${font.value}`}
                    type="button"
                    onClick={() => handleFontSelect(font.value, 'subtitle')}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedFonts.subtitle === font.value
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button className="w-full p-3 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload font file (OTF or TTF)
            </button>
                </div>
              )}
          </div>

            {/* Body Font */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Body Font</h3>
                <p className="text-sm text-gray-400 mt-1">Select a font for main text content</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commonFonts.map(font => (
                  <button
                    key={`body-${font.value}`}
                    type="button"
                    onClick={() => handleFontSelect(font.value, 'body')}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedFonts.body === font.value
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button className="w-full p-3 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload font file (OTF or TTF)
            </button>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="mt-8 p-6 bg-gray-800/30 border border-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-4">Typography Preview</h4>
              <div className="space-y-4">
                <div style={{ fontFamily: selectedFonts.title === 'custom' ? typography.customTitleFont : selectedFonts.title }}>
                  <h1 className="text-3xl font-bold text-white">Main Heading Example</h1>
                </div>
                <div style={{ fontFamily: selectedFonts.subtitle === 'custom' ? typography.customSubtitleFont : selectedFonts.subtitle }}>
                  <h2 className="text-xl font-semibold text-gray-300">Subtitle Example</h2>
                </div>
                <div style={{ fontFamily: selectedFonts.body === 'custom' ? typography.customBodyFont : selectedFonts.body }}>
                  <p className="text-base text-gray-400">
                    This is an example of body text that shows how your selected fonts will look in paragraphs and general content. 
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>
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
      additionalSteps: ''
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">System Integration</h2>
            <p className="text-gray-400 mt-1">Connect your systems for a streamlined workflow</p>
          </div>
          <ShareSection formId={1} section="System Integration" />
        </div>

        {/* Help Banner */}
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-400 font-medium mb-1">Need help with the setup?</p>
              <p className="text-sm text-emerald-400/80">
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
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">CRM Integration</h3>
                <p className="text-sm text-gray-400">Connect your Customer Relationship Management system</p>
              </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Select Your CRM</label>
                <div className="grid grid-cols-2 gap-3">
                  {SYSTEM_INTEGRATION_OPTIONS.crm.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSystemIntegrationData(prev => ({
                        ...prev,
                        crm: { ...prev.crm, system: option.value }
                      }))}
                      className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-2
                        ${systemIntegrationData.crm.system === option.value
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                        }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      {option.label}
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">CRM Instance Details</label>
                <input
                  type="text"
                  value={systemIntegrationData.crm.instance}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    crm: { ...prev.crm, instance: e.target.value }
                  }))}
                  placeholder="Your CRM instance name or URL"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Info className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 my-8"></div>

          {/* Calendar Integration */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Calendar Integration</h3>
                <p className="text-sm text-gray-400">Connect your calendar and scheduling tools</p>
              </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Select Calendar System</label>
                <div className="grid grid-cols-2 gap-3">
                  {SYSTEM_INTEGRATION_OPTIONS.calendar.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSystemIntegrationData(prev => ({
                        ...prev,
                        calendar: { ...prev.calendar, system: option.value }
                      }))}
                      className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-2
                        ${systemIntegrationData.calendar.system === option.value
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                        }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Scheduling Tool</label>
                <div className="grid grid-cols-2 gap-3">
                  {SYSTEM_INTEGRATION_OPTIONS.scheduling.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSystemIntegrationData(prev => ({
                        ...prev,
                        calendar: { ...prev.calendar, schedulingTool: option.value }
                      }))}
                      className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center gap-2
                        ${systemIntegrationData.calendar.schedulingTool === option.value
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                        }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      {option.label}
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 my-8"></div>

          {/* Sales Process Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Sales Process Configuration</h3>
                <p className="text-sm text-gray-400">Define your ideal sales workflow</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Lead Capture Process</label>
                <textarea
                  value={systemIntegrationData.process.leadCapture}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    process: { ...prev.process, leadCapture: e.target.value }
                  }))}
                  placeholder="Describe your ideal lead capture workflow (e.g., Form submission → CRM entry → Sales rep notification)"
                  className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Status Change Workflow</label>
                <textarea
                  value={systemIntegrationData.process.statusChanges}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    process: { ...prev.process, statusChanges: e.target.value }
                  }))}
                  placeholder="How should lead status changes be handled? (e.g., Qualified → Meeting Scheduled → Demo Completed)"
                  className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Team Notifications</label>
                <textarea
                  value={systemIntegrationData.process.notifications}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    process: { ...prev.process, notifications: e.target.value }
                  }))}
                  placeholder="How should your team be notified of updates? (e.g., Email for new leads, Slack for status changes)"
                  className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Additional Steps or Automation</label>
                <textarea
                  value={systemIntegrationData.process.additionalSteps}
                  onChange={(e) => setSystemIntegrationData(prev => ({
                    ...prev,
                    process: { ...prev.process, additionalSteps: e.target.value }
                  }))}
                  placeholder="Any other steps or automation you'd like to implement? (e.g., Follow-up email sequences, Lead scoring)"
                  className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </FormSection>
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
              />
              <input
                type="color"
                value={colorValue}
                onChange={(e) => {
                  setBrandAssets(prev => ({ ...prev, [colorType]: e.target.value }));
                  setSelectedColors(prev => ({ ...prev, [colorType.replace('Color', '')]: 'custom' }));
                }}
                className="w-6 h-6 rounded overflow-hidden cursor-pointer"
              />
            </div>
          </div>
          {/* Add a subtle overlay on hover to indicate interactivity */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-lg transition-all duration-200" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#181c24] flex">
      {/* Fixed Side Navigation */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800/50 border-r border-gray-800 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
        <ProgressTracker
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          isAnimating={animatingNav}
        />
      </div>

        {/* Progress Pie Chart - Fixed at bottom */}
        <div className="p-6 pt-4 border-t border-gray-700/50">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-3">Total Progress</p>
            <ProgressPie progress={calculateProgress()} />
          </div>
        </div>
      </div>

      {/* Scrollable Main Content Area */}
      <div className="flex-1 ml-64">
        <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              {renderFormContent()}
            </AnimatePresence>
          </div>
          {renderFormActions()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;

interface BrandAssets {
  brandName: string;
  logo: File | null;
  mainColor: string;
  secondaryColor: string;
  highlightColor: string;
}