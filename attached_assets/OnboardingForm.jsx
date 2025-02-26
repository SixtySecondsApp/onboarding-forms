import React, { useState, useEffect, useCallback } from 'react';
import { Check, Palette, Building2, Type, Settings, Share, ArrowRight, Globe, Phone, Linkedin, MapPin, Target, ChevronRight, AlertCircle, Info, CheckCircle2, Save, Download, Upload, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Extract FormField component for better reusability
const FormField = ({ label, name, icon: Icon, placeholder, type = 'text', options = null, value, onChange, onBlur, errors, touched, autoFocus = false, hint = null }) => {
  const hasError = touched[name] && errors[name];
  const isValid = touched[name] && !errors[name] && value;
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
        {/* Icon container with increased width for better separation */}
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
            style={{ padding: "0.75rem 5rem !important" }}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${name}-error` : null}
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
            style={{ padding: "0.75rem 5rem !important" }}
            placeholder={placeholder}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${name}-error` : null}
            autoComplete={name === 'name' ? 'organization' : name === 'website' ? 'url' : name === 'phone' ? 'tel' : name === 'location' ? 'address-level2' : 'off'}
            autoFocus={autoFocus}
          />
        )}
        
        {/* Status indicator - Enhance with animation */}
        {isValid && (
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
        
        {/* Dropdown arrow for select */}
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
      
      {/* Field hint */}
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

// Extract FormSection component
const FormSection = ({ title, icon: Icon, children, onShareSection }) => {
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

// Add this after imports
// Format phone number as user types
const formatPhoneNumber = (value) => {
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

const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [animatingNav, setAnimatingNav] = useState(false);
  const [businessDetails, setBusinessDetails] = useState({
    name: 'mmmer',
    type: '',
    website: '',
    linkedin: '',
    phone: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formProgress, setFormProgress] = useState(0);
  const [formSaved, setFormSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Calculate form completion progress
  useEffect(() => {
    const totalFields = Object.keys(businessDetails).length;
    const filledFields = Object.values(businessDetails).filter(value => value.trim() !== '').length;
    setFormProgress(Math.round((filledFields / totalFields) * 100));
    
    // Mark form as unsaved when changes are made
    if (formSaved) {
      setFormSaved(false);
    }
  }, [businessDetails, formSaved]);

  // Load saved form data if available
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('onboardingFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setBusinessDetails(parsedData);
        setFormSaved(true);
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  }, []);

  // Save form data to localStorage
  const saveFormData = useCallback(() => {
    try {
      localStorage.setItem('onboardingFormData', JSON.stringify(businessDetails));
      setFormSaved(true);
      
      // Show save toast
      setShowSaveToast(true);
      setTimeout(() => {
        setShowSaveToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [businessDetails]);

  // Enhanced validation with real-time feedback and more detailed error messages
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Business name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'type':
        if (!value) error = 'Please select a business type';
        break;
      case 'website':
        if (value && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(value)) 
          error = 'Please enter a valid URL (e.g., https://example.com)';
        break;
      case 'phone':
        if (value && !/^(\+\d{1,3}\s?)?(\(\d{3}\)\s?\d{3}-\d{4}|\d{10})$/.test(value))
          error = 'Please enter a valid phone number';
        break;
      case 'location':
        if (value && value.length < 3) error = 'Location should be at least 3 characters';
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number as the user types
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setBusinessDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setBusinessDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Validate on change
    const error = validateField(name, name === 'phone' ? formatPhoneNumber(value) : value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate on blur
    const error = validateField(name, businessDetails[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Auto-save on field blur
  useEffect(() => {
    const hasAnyFieldBeenTouched = Object.values(touched).some(t => t);
    if (hasAnyFieldBeenTouched) {
      const saveTimeout = setTimeout(() => {
        saveFormData();
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [touched, saveFormData]);

  // Export form data as JSON
  const exportFormData = () => {
    const dataStr = JSON.stringify(businessDetails, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'onboarding-form-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import form data from JSON
  const importFormData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        setBusinessDetails(importedData);
        setFormSaved(true);
      } catch (error) {
        console.error('Error importing form data:', error);
        alert('The selected file contains invalid data. Please try again with a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Steps configuration
  const steps = [
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

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const handleContinue = () => {
    if (animatingNav) return;
    
    // Validate all fields before continuing
    let hasErrors = false;
    const newErrors = {};
    const newTouched = {};
    
    Object.keys(businessDetails).forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, businessDetails[field]);
      if (error) {
        hasErrors = true;
        newErrors[field] = error;
      }
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    if (hasErrors) {
      // Focus on the first field with an error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Save form data before continuing
    saveFormData();
    
    setAnimatingNav(true);
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    
    // Reset animation lock after animation completes
    setTimeout(() => {
      setAnimatingNav(false);
    }, 600);
  };

  // Handle Complete with loading state
  const handleComplete = () => {
    // Validate all fields
    let hasErrors = false;
    const newErrors = {};
    const newTouched = {};
    
    Object.keys(businessDetails).forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, businessDetails[field]);
      if (error) {
        hasErrors = true;
        newErrors[field] = error;
      }
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    if (hasErrors) {
      // Focus on the first field with an error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Set loading state and save form data
    setIsSubmitting(true);
    saveFormData();
    
    // Simulate API submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      handleContinue();
    }, 800);
  };

  const handleStepClick = (index) => {
    if (getStepStatus(index) !== 'upcoming' && !animatingNav) {
      setAnimatingNav(true);
      setCurrentStep(index);
      
      // Reset animation lock after animation completes
      setTimeout(() => {
        setAnimatingNav(false);
      }, 600);
    }
  };

  const handleShareSection = (e, sectionTitle) => {
    e.stopPropagation(); // Prevent triggering the step click
    // In a real app, this would open a share dialog or copy a link
    alert(`Sharing section: ${sectionTitle}`);
  };

  const handlePrevious = () => {
    if (animatingNav || currentStep <= 0) return;
    
    setAnimatingNav(true);
    setCurrentStep(prev => Math.max(prev - 1, 0));
    
    // Reset animation lock after animation completes
    setTimeout(() => {
      setAnimatingNav(false);
    }, 600);
  };

  // Render business information form with enhanced fields and hints
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
          <FormField 
            label="Business Name" 
            name="name" 
            icon={Building2} 
            placeholder="Your business name"
            value={businessDetails.name}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            autoFocus={true}
            hint="The legal or trading name of your business"
          />
          <FormField 
            label="Business Type" 
            name="type" 
            icon={Building2} 
            placeholder="Select business type"
            type="select"
            options={[
              { value: 'ecommerce', label: 'E-commerce' },
              { value: 'saas', label: 'SaaS' },
              { value: 'agency', label: 'Agency' },
              { value: 'retail', label: 'Retail' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'finance', label: 'Finance' },
              { value: 'education', label: 'Education' },
              { value: 'other', label: 'Other' }
            ]}
            value={businessDetails.type}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            hint="The industry or category your business operates in"
          />
        </FormSection>
        
        <FormSection 
          title="Contact Information" 
          icon={Phone} 
          onShareSection={handleShareSection}
        >
          <FormField 
            label="Website" 
            name="website" 
            icon={Globe} 
            placeholder="https://your-website.com"
            value={businessDetails.website}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            hint="Your business website URL"
          />
          <FormField 
            label="LinkedIn Page" 
            name="linkedin" 
            icon={Linkedin} 
            placeholder="LinkedIn URL"
            value={businessDetails.linkedin}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            hint="URL to your company's LinkedIn profile"
          />
          <FormField 
            label="Phone Number" 
            name="phone" 
            icon={Phone} 
            placeholder="(555) 555-5555"
            type="tel"
            value={businessDetails.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            hint="Your business contact number"
          />
          <FormField 
            label="Location" 
            name="location" 
            icon={MapPin} 
            placeholder="City, Country"
            value={businessDetails.location}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            hint="Primary location of your business"
          />
        </FormSection>
      </motion.div>
    );
  };

  const renderFormContent = () => {
    switch (currentStep) {
      case 1:
        return renderBusinessInfoForm();
      default:
        return (
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-center h-48"
          >
            <p className="text-gray-400">Step {currentStep + 1} content</p>
          </motion.div>
        );
    }
  };

  // Progress line animation variants
  const progressLineVariants = {
    initial: { height: '0%' },
    animate: (progress) => ({
      height: `${progress}%`,
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth motion
      }
    })
  };

  // Calculate progress percentage with precise positioning for all stages
  const calculateProgress = () => {
    // Define the positions where each step icon is located (in percentage)
    const stepPositions = [
      8,    // Step 0 position (Campaign Info)
      29,   // Step 1 position (Business Info)
      50,   // Step 2 position (Brand Assets)
      71,   // Step 3 position (Typography)
      92    // Step 4 position (System Setup)
    ];
    
    // If we're at step 0, show progress to the first icon
    if (currentStep === 0) return stepPositions[0];
    
    // For other steps, return the position of the current step
    return stepPositions[Math.min(currentStep, stepPositions.length - 1)];
  };

  // Check if form has any errors
  const hasFormErrors = () => {
    return Object.values(errors).some(error => error !== '');
  };

  return (
    <div className="min-h-screen bg-[#181c24] flex flex-col md:flex-row">
      {/* Side Navigation */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-800 p-6 flex flex-col bg-[#1a1f28]/50 backdrop-blur-sm">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Campaign Setup</h1>
        </div>
        <p className="text-sm text-gray-400 mb-10">Complete your onboarding</p>
        
        <div className="relative flex flex-col space-y-10">
          {/* Vertical Progress Line */}
          <div className="absolute left-8 top-0 h-full">
            {/* Background Line */}
            <div className="absolute w-1.5 h-full bg-gray-800 rounded-full" />
            
            {/* Animated Progress Line */}
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
            const stepStatus = getStepStatus(index);
            
            // Step icon container animation variants
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
            
            // Step text animation variants
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
                  {/* Icon Container */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
                      stepStatus === 'completed'
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'
                        : stepStatus === 'current'
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'
                        : 'bg-gradient-to-br from-gray-800 to-gray-900'
                    } transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                    onClick={() => handleStepClick(index)}
                  >
                    {/* Inner Square with Border */}
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center border ${
                      stepStatus === 'completed'
                        ? 'border-emerald-400/30'
                        : stepStatus === 'current'
                        ? 'border-emerald-400/30'
                        : 'border-gray-700'
                    } backdrop-blur-sm`}>
                      <AnimatePresence mode="wait">
                        {stepStatus === 'completed' ? (
                          <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              transition: { duration: 0.3 }
                            }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                          >
                            <Check className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={3} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="icon"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              transition: { duration: 0.3 }
                            }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                          >
                            <step.icon
                              className={`w-7 h-7 ${
                                stepStatus === 'upcoming' 
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

                {/* Text Content with Share Button */}
                <motion.div
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  className="ml-4 flex-1 flex items-center justify-between"
                >
                  <div 
                    className={`cursor-pointer ${stepStatus !== 'upcoming' ? 'hover:text-emerald-400' : ''}`}
                    onClick={() => handleStepClick(index)}
                  >
                    <p className={`font-semibold ${
                      stepStatus === 'upcoming' ? 'text-gray-500' : 
                      stepStatus === 'current' ? 'text-emerald-400' : 'text-white'
                    } text-lg tracking-wide mb-1 transition-colors duration-300`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-gray-500 font-medium tracking-wide">
                      {step.subtitle}
                    </p>
                  </div>
                  
                  {/* Share Button */}
                  {stepStatus !== 'upcoming' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        transition: { delay: index * 0.08 + 0.2, duration: 0.3 }
                      }}
                      onClick={(e) => handleShareSection(e, step.title)}
                      className="p-2 bg-gray-800/80 hover:bg-emerald-700/50 rounded-full text-gray-400 hover:text-white transition-all duration-200 ml-2 transform hover:scale-110"
                      title={`Share ${step.title}`}
                    >
                      <Share className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header with Share Button (Save button removed) */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Business Details</h2>
              <p className="text-gray-400 mt-1">Tell us about your business</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium flex items-center transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-emerald-700/20">
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>

          {/* Form Content */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              {renderFormContent()}
            </AnimatePresence>
          </div>
            
          {/* Form Actions */}
          <div className="flex justify-between items-center sticky bottom-0 bg-[#181c24]/90 backdrop-blur-sm py-4 border-t border-gray-800 mt-auto">
            <div className="text-sm text-gray-500">
              {hasFormErrors() && (
                <span className="text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Please fix the errors before continuing
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              {/* Previous button - only show for steps > 0 */}
              {currentStep > 0 && (
                <button 
                  onClick={handlePrevious}
                  className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-all duration-200 flex items-center transform hover:scale-105"
                  disabled={animatingNav || isSubmitting}
                  aria-label="Go to previous step"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
              )}
              <button 
                onClick={handleContinue}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-all duration-200 flex items-center transform hover:scale-105"
                disabled={animatingNav || hasFormErrors() || isSubmitting}
                aria-label="Continue to next step"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
              <button 
                onClick={handleComplete}
                className={`px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg text-white font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg hover:shadow-emerald-700/20 transform hover:scale-105 ${
                  (animatingNav || hasFormErrors() || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={animatingNav || hasFormErrors() || isSubmitting}
                aria-label="Complete form and continue"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Processing</span>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    Complete & Continue
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save toast notification */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Form progress saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 50% 0%; }
          50% { background-position: 50% 100%; }
          100% { background-position: 50% 0%; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default OnboardingForm; 