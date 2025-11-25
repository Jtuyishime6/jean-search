// Configuration file for JobFinder Application
// Created by Jean De Dieu (j.tuyishime6@alustudent.com)

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://jsearch.p.rapidapi.com',
    API_HOST: 'jsearch.p.rapidapi.com',
    
    // API Endpoints
    ENDPOINTS: {
        SEARCH: '/search',              // Main job search endpoint
        JOB_DETAILS: '/job-details',    // Get detailed job information
        SALARY: '/estimated-salary'     // Get salary estimates
    },
    
    // Application Settings
    DEFAULT_LIMIT: 10,                // Number of jobs per page
    MAX_DESCRIPTION_LENGTH: 200,      // Maximum characters for job description preview
    
    // Cache Settings (for performance optimization)
    CACHE_DURATION: 5 * 60 * 1000,   // 5 minutes in milliseconds
    
    // Rate Limiting
    RATE_LIMIT_WARNING: 'You have made too many requests. Please wait a moment before searching again.',
    
    // Default Search Parameters
    DEFAULT_LOCATION: 'United States',
    DEFAULT_TITLE: '',
    DEFAULT_TIME_FILTER: 'all',
    DEFAULT_COUNTRY: 'us',
    
    // Error Messages
    ERROR_MESSAGES: {
        NO_API_KEY: 'Please configure your API key in settings first',
        INVALID_API_KEY: 'Invalid API key. Please check your settings.',
        RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
        NO_RESULTS: 'No jobs found. Try adjusting your search criteria.',
        NETWORK_ERROR: 'Failed to fetch jobs. Please check your internet connection.',
        GENERIC_ERROR: 'An error occurred. Please try again.'
    }
};
