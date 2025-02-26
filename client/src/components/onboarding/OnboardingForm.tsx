import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette, Building2, Type, Settings, Share, Globe, Phone, Linkedin, MapPin, Target, ChevronRight, AlertCircle, Info, CheckCircle2, ChevronLeft, Upload } from 'lucide-react';
import { ProgressTracker, type Step } from './ProgressTracker';
import { ShareSection } from './ShareSection';
import { type BusinessDetails, type OnboardingForm as FormType } from '@shared/schema';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast"; // Updated import path

interface Props {
  formId: string;
  sectionId?: string;
}

// Format phone number as user types
const formatPhoneNumber = (value: string) => {
  // Strip all non-numeric characters
  const phoneNumber = value.replace(/\D/g, '');

  // Format based on length
  if (phoneNumber.length <= 3) {
    return phoneNumber;
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
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
            className="w-full h-full py-3 pr-10 bg-transparent text-gray-200 appearance-none focus:outline-none transition-all duration-200"
            style={{ padding: "0.75rem 5rem" }}
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
            className="w-full h-full py-3 pr-3 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-200"
            style={{ padding: "0.75rem 5rem" }}
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
          Format: +1 (555) 555-5555
        </p>
      )}
      {hasError && <p id={`${name}-error`} className="sr-only">{errors[name]}</p>}
    </div>
  );
};

const validateField = (name: keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize", value: string) => {
  let error = '';

  // Don't validate empty optional fields
  if (!value && ['linkedin', 'website'].includes(name)) {
    return error;
  }

  switch (name) {
    case 'name':
      if (!value.trim()) error = 'Business name is required';
      else if (value.length < 2) error = 'Name must be at least 2 characters';
      break;
    case 'type':
      if (!value) error = 'Please select a business type';
      break;
    case 'website':
      if (value && !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(value))
        error = 'Please enter a valid URL starting with http:// or https://';
      break;
    case 'phone':
      if (!value) error = 'Phone number is required';
      else if (!/^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/.test(value))
        error = 'Please enter a valid phone number: +1 (555) 555-5555';
      break;
    case 'location':
      if (!value.trim()) error = 'Location is required';
      else if (value.length < 3) error = 'Location should be at least 3 characters';
      break;
    case 'campaignName':
      if (!value.trim()) error = 'Campaign name is required';
      break;
    case 'objective':
      if (!value) error = 'Please select a campaign objective';
      break;
    case 'jobTitles':
      if (!value.trim()) error = 'Job titles are required';
      break;
    case 'industries':
      if (!value) error = 'Please select at least one industry';
      break;
    case 'companySize':
      if (!value) error = 'Please select a company size';
      break;
  }

  return error;
};

const FormSection = ({ title, icon: Icon, children, onShareSection }: {
  title: string;
  icon: any;
  children: React.ReactNode;
  onShareSection: (e: React.MouseEvent, title: string) => void;
}) => {
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-emerald-900/10 hover:border-gray-600/50 transition-all duration-300">
      <div className="text-lg font-medium text-white mb-5 flex items-center justify-between">
        <span className="flex items-center">
          <Icon className="w-5 h-5 mr-2 text-emerald-400" />
          {title}
        </span>
        <button
          onClick={(e) => onShareSection(e, title)}
          className="p-2 bg-gray-700/50 hover:bg-emerald-700/50 rounded-full text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105 group"
          title={`Share ${title} section`}
          aria-label={`Share ${title} section`}
        >
          <Share className="w-4 h-4" />
          <span className="sr-only">Share {title}</span>
          <span className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Share {title}
          </span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
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

export function OnboardingForm({ formId, sectionId }: Props) {
  const { data: form } = useQuery<FormType>({
    queryKey: ["/api/forms", formId],
  });

  const { data: section } = useQuery<FormType>({
    queryKey: ["/api/sections", sectionId],
    enabled: !!sectionId,
  });

  const updateFormMutation = useMutation({
    mutationFn: async (data: any) => {
      if (sectionId) {
        await apiRequest("PATCH", `/api/sections/${sectionId}/data`, data);
      } else {
        await apiRequest("PATCH", `/api/forms/${formId}/data`, data);
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
    startDate: '',
    endDate: '',
    keyMessages: '',
    callToAction: ''
  });

  const [audience, setAudience] = useState({
    jobTitles: '',
    industries: '',
    companySize: '',
    locations: ''
  });

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


  // Update the progress calculation
  const calculateProgress = () => {
    // Helper function to check if a field is valid
    const isFieldValid = (value: any, fieldName: string) => {
      // Skip optional fields if they're empty
      if (['linkedin', 'website'].includes(fieldName) && (!value || value.trim() === '')) {
        return true;
      }

      if (typeof value === 'string') {
        return value.trim() !== '' && !errors[fieldName];
      }
      if (fieldName === 'logo') {
        return value !== null;
      }
      if (['mainColor', 'secondaryColor', 'highlightColor'].includes(fieldName)) {
        return true; // Colors always have a default value
      }
      return false;
    };

    let totalRequiredFields = 0;
    let validFields = 0;

    // Required fields from businessDetails
    const requiredBusinessFields = ['name', 'type', 'phone', 'location'];
    requiredBusinessFields.forEach(field => {
      totalRequiredFields++;
      if (isFieldValid(businessDetails[field as keyof BusinessDetails], field)) {
        validFields++;
      }
    });

    // Optional fields (don't count towards total if empty)
    ['website', 'linkedin'].forEach(field => {
      const value = businessDetails[field as keyof BusinessDetails];
      if (value && value.trim() !== '') {
        totalRequiredFields++;
        if (isFieldValid(value, field)) {
          validFields++;
        }
      }
    });

    // Required fields for the current step
    const currentStepFields = (() => {
      switch (currentStep) {
        case 0: // Business Details
          return requiredBusinessFields;
        case 1: // Campaign
          return ['campaignName', 'objective'];
        case 2: // Target Audience
          return ['jobTitles', 'industries', 'companySize'];
        case 3: // Typography
          return ['mainTitleFont', 'subtitleFont', 'bodyTextFont'];
        case 4: // Brand Assets
          return ['brandName', 'mainColor', 'secondaryColor', 'highlightColor'];
        default:
          return [];
      }
    })();

    // Update form progress
    return Math.round((validFields / Math.max(totalRequiredFields, 1)) * 100);
  };

  useEffect(() => {
    setFormProgress(calculateProgress());
  }, [businessDetails, brandAssets, campaign, audience, errors, currentStep]);

  useEffect(() => {
    if (sectionId && section?.data) {
      setBusinessDetails(section.data as BusinessDetails);
    } else if (form?.data) {
      setBusinessDetails(form.data as BusinessDetails);
    }
  }, [form, section, sectionId]);


  // Enhanced validation with real-time feedback and more detailed error messages
  const validateField = (name: keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize", value: string) => {
    let error = '';

    // Don't validate empty optional fields
    if (!value && ['linkedin', 'website'].includes(name)) {
      return error;
    }

    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Business name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'type':
        if (!value) error = 'Please select a business type';
        break;
      case 'website':
        if (value && !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(value))
          error = 'Please enter a valid URL starting with http:// or https://';
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/.test(value))
          error = 'Please enter a valid phone number: +1 (555) 555-5555';
        break;
      case 'location':
        if (!value.trim()) error = 'Location is required';
        else if (value.length < 3) error = 'Location should be at least 3 characters';
        break;
      case 'campaignName':
        if (!value.trim()) error = 'Campaign name is required';
        break;
      case 'objective':
        if (!value) error = 'Please select a campaign objective';
        break;
      case 'jobTitles':
        if (!value.trim()) error = 'Job titles are required';
        break;
      case 'industries':
        if (!value) error = 'Please select at least one industry';
        break;
      case 'companySize':
        if (!value) error = 'Please select a company size';
        break;
    }

    return error;
  };

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
      if (name === "campaignName" || name === "objective" || name === "startDate" || name === "endDate" || name === "keyMessages" || name === "callToAction") {
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

    // Validate on change
    const error = validateField(name as keyof BusinessDetails | "campaignName" | "objective" | "jobTitles" | "industries" | "companySize", name === 'phone' ? formatPhoneNumber(value) : value);
    setErrors(prev => ({
      ...prev,
      [name]: error
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
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleAudienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAudience(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleStepNavigation = (direction: 'next' | 'previous') => {
    if (animatingNav) return;
    setAnimatingNav(true);
    if (direction === 'next') {
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

    // Validate business details
    Object.keys(businessDetails).forEach(field => {
      newTouched[field] = true;
      const error = validateField(field as keyof BusinessDetails, businessDetails[field as keyof BusinessDetails]);
      if (error) {
        hasErrors = true;
        newErrors[field] = error;
      }
    });

    // Validate campaign fields
    Object.keys(campaign).forEach(field => {
      if (field !== 'keyMessages' && field !== 'callToAction') { // Optional fields
        newTouched[field] = true;
        const error = validateField(field as any, campaign[field as keyof typeof campaign]);
        if (error) {
          hasErrors = true;
          newErrors[field] = error;
        }
      }
    });

    // Validate audience fields
    Object.keys(audience).forEach(field => {
      newTouched[field] = true;
      const error = validateField(field as any, audience[field as keyof typeof audience]);
      if (error) {
        hasErrors = true;
        newErrors[field] = error;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (hasErrors) {
      // Show error toast
      useToast({ // Using the corrected import
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = {
        ...businessDetails,
        ...brandAssets,
        ...campaign,
        ...audience,
        logo: logoFile
      };

      await updateFormMutation.mutateAsync(formData);
      useToast({ // Using the corrected import
        title: "Success!",
        description: "Your form has been completed successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving form:', error);
      useToast({ // Using the corrected import
        title: "Error",
        description: "Failed to save the form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormActions = () => {
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
              Complete
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
        className="w-full space-y-8"
      >
        {/* Form progress indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
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

        <FormSection
          title="Business Information"
          icon={Building2}
          onShareSection={handleShareSection}
        >
          {formFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={businessDetails[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
              autoFocus={field.name === 'name'}
            />
          ))}
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
        <FormSection
          title="Brand Assets"
          icon={Palette}
          onShareSection={handleShareSection}
        >
          <div className="col-span-2">
            <div className="space-y-2">
              <label htmlFor="brandName" className="block text-sm font-medium text-gray-300">Brand Name</label>
              <Input
                id="brandName"
                value={brandAssets.brandName}
                onChange={(e) => setBrandAssets(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder="Enter your brand name"
                className={`w-full ${errors.brandName ? 'border-red-500' : ''}`}
              />
              {errors.brandName && (
                <p className="text-red-500 text-sm mt-1">{errors.brandName}</p>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Brand Logo</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 
                ${logoPreview ? 'border-emerald-500/50' : 'border-gray-700 hover:border-emerald-500/50'}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                  onChange={handleLogoUpload}
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex flex-col items-centerjustify-center"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="max-h-32 mb-2" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm text-gray-400">Upload logo file</span>
                      <span className="text-xs text-gray-500 mt-1">Click or drag and drop</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Brand Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              {['mainColor', 'secondaryColor', 'highlightColor'].map((colorType) => (
                <div key={colorType}>
                  <label className="block text-sm text-gray-400 mb-2">
                    {colorType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <div className="relative">
                    <input
                      type="color"
                      value={brandAssets[colorType as keyof typeof brandAssets]}
                      onChange={(e) => handleColorChange(e.target.value, colorType as any)}
                      className="w-full h-12 rounded-lg cursor-pointer bg-transparent border border-gray-700"
                    />
                    <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 mb-1">
                      {brandAssets[colorType as keyof typeof brandAssets]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Color Combination Preview</label>
            <div className="h-16 rounded-lg border border-gray-700 overflow-hidden">
              <div className="flex h-full">
                <div className="flex-1" style={{ backgroundColor: brandAssets.mainColor }}></div>
                <div className="flex-1" style={{ backgroundColor: brandAssets.secondaryColor }}></div>
                <div className="flex-1" style={{ backgroundColor: brandAssets.highlightColor }}></div>
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
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Target Audience</h2>
          <p className="text-gray-400">Define your ideal customer profile</p>
        </div>

        <FormSection
          title="Audience Criteria"
          icon={Target}
          onShareSection={handleShareSection}
        >
          {audienceFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={audience[field.name]}
              onChange={handleAudienceChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
            />
          ))}
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
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Campaign Information</h2>
          <p className="text-gray-400">Define your campaign goals and content</p>
        </div>

        <FormSection
          title="Campaign Details"
          icon={Target}
          onShareSection={handleShareSection}
        >
          {campaignFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={campaign[field.name]}
              onChange={handleCampaignChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
            />
          ))}

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Timeline</label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="startDate"
                type="date"
                placeholder="Start Date"
                className="w-full"
                value={campaign.startDate}
                onChange={handleCampaignChange}
              />
              <Input
                id="endDate"
                type="date"
                placeholder="End Date"
                className="w-full"
                value={campaign.endDate}
                onChange={handleCampaignChange}
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Key Messages</label>
            <textarea
              id="keyMessages"
              value={campaign.keyMessages}
              onChange={handleCampaignChange}
              placeholder="Enter your key messages (one per line)"
              className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Call to Action</label>
            <Input
              id="callToAction"
              value={campaign.callToAction}
              onChange={handleCampaignChange}
              placeholder="e.g., 'Sign up for a demo', 'Download our guide'"
              className="w-full"
            />
          </div>
        </FormSection>
      </motion.div>
    );
  };

  const renderTypographyForm = () => {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex items-center justify-center h-48"
      >
        <p className="text-gray-400">Typography Form</p>
      </motion.div>
    );
  };

  const renderSystemIntegrationForm = () => {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex items-center justify-center h-48"
      >
        <p className="text-gray-400">System Integration Form</p>
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

  return (
    <div className="min-h-screen bg-[#181c24] flex flex-col md:flex-row">
      {/* Side Navigation */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-800 p-6 flex flex-col bg-[#1a1f28]/50 backdrop-blur-sm">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Campaign Setup</h1>
        </div>
        <p className="text-sm text-gray-400 mb-10">Complete your onboarding</p>

        <ProgressTracker
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          isAnimating={animatingNav}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Share Button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Business Details</h2>
              <p className="text-gray-400 mt-1">Tell us about your business</p>
            </div>
            <ShareSection formId={1} section="Business Details" />
          </div>

          {/* Form Content */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              {renderFormContent()}
            </AnimatePresence>
          </div>

          {renderFormActions()}
        </div>
      </div>
    </div>
  );
}

interface BrandAssets {
  brandName: string;
  logo: File | null;
  mainColor: string;
  secondaryColor: string;
  highlightColor: string;
}