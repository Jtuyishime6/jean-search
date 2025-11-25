// State Management
let state = {
    apiKey: '',
    jobs: [],
    currentPage: 1,
    totalPages: 1,
    sortBy: 'date-desc'
};

// DOM Elements
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeModal = document.querySelector('.close');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const searchBtn = document.getElementById('searchBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const jobsContainer = document.getElementById('jobsContainer');
const resultsInfo = document.getElementById('resultsInfo');
const sortBar = document.getElementById('sortBar');
const sortSelect = document.getElementById('sortSelect');
const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

// Initialize Application
function init() {
    loadApiKey();
    attachEventListeners();
    
    // Show settings modal if no API key
    if (!state.apiKey) {
        settingsModal.style.display = 'block';
    }
}

// Load API key from localStorage
function loadApiKey() {
    const savedKey = localStorage.getItem('rapidapi_key');
    if (savedKey) {
        state.apiKey = savedKey;
        apiKeyInput.value = savedKey;
    }
}

// Save API key to localStorage
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showError('Please enter a valid API key');
        return;
    }
    
    state.apiKey = apiKey;
    localStorage.setItem('rapidapi_key', apiKey);
    settingsModal.style.display = 'none';
    showSuccess('API key saved successfully!');
}

// Event Listeners
function attachEventListeners() {
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    searchBtn.addEventListener('click', performSearch);
    sortSelect.addEventListener('change', handleSort);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    
    // Enter key support
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && settingsModal.style.display === 'block') {
            saveApiKey();
        } else if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Perform Job Search
async function performSearch() {
    // Validate API key
    if (!state.apiKey) {
        showError('Please configure your API key in settings first');
        settingsModal.style.display = 'block';
        return;
    }
    
    // Get search parameters
    const title = document.getElementById('titleInput').value.trim();
    const location = document.getElementById('locationInput').value.trim();
    const timeFilter = document.getElementById('timeFilter').value;
    const remoteFilter = document.getElementById('remoteFilter').value;
    const jobType = document.getElementById('jobTypeFilter').value;
    const experience = document.getElementById('experienceFilter').value;
    
    // Build query string
    let query = '';
    if (title) {
        query += title;
    }
    if (location) {
        query += (query ? ' in ' : '') + location;
    }
    if (!query) {
        query = 'jobs'; // Default query
    }
    
    // Build API URL
    let url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SEARCH}?query=${encodeURIComponent(query)}`;
    url += `&page=${state.currentPage}`;
    url += `&num_pages=1`;
    url += `&date_posted=${timeFilter}`;
    
    // Add optional filters
    if (remoteFilter === 'true') {
        url += '&work_from_home=true';
    }
    
    if (jobType) {
        url += `&employment_types=${jobType}`;
    }
    
    if (experience) {
        url += `&job_requirements=${experience}`;
    }
    
    // Show loading
    showLoading();
    hideError();
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': state.apiKey,
                'x-rapidapi-host': CONFIG.API_HOST
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid API key. Please check your settings.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`API error: ${response.status}`);
            }
        }
        
        const data = await response.json();
        
        if (!data || !data.data || data.data.length === 0) {
            showError('No jobs found. Try adjusting your search criteria.');
            state.jobs = [];
        } else {
            state.jobs = data.data;
            displayJobs();
            updateResultsInfo();
            sortBar.style.display = 'flex';
            pagination.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'Failed to fetch jobs. Please try again.');
        state.jobs = [];
    } finally {
        hideLoading();
    }
}

// Get API endpoint based on time filter
function getEndpointForTimeFilter(timeFilter) {
    // Not needed for JSearch API - time filter is a query parameter
    return CONFIG.ENDPOINTS.SEARCH;
}

// Display Jobs
function displayJobs() {
    jobsContainer.innerHTML = '';
    
    if (state.jobs.length === 0) {
        jobsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs to display</p>';
        return;
    }
    
    state.jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsContainer.appendChild(jobCard);
    });
}

// Create Job Card Element
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    // Icons - Inline SVG for modern look (Map Pin, Calendar, Dollar Sign)
    const icons = {
        location: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
        calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
        money: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
    };

    // Format posted date
    const postedDate = job.job_posted_at_datetime_utc 
        ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() 
        : 'Recently';
    
    // Job tags
    const tags = [];
    if (job.job_employment_type) tags.push({ text: job.job_employment_type, className: '' });
    if (job.job_is_remote) tags.push({ text: 'Remote', className: 'remote' });
    if (job.job_required_experience && job.job_required_experience.no_experience_required === false) {
        tags.push({ text: 'Experience Required', className: '' });
    }
    
    // Format salary if available
    let salaryText = '';
    if (job.job_min_salary && job.job_max_salary) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        });
        // Replaced 💰 with SVG
        salaryText = `<span class="job-meta-item">${icons.money}${formatter.format(job.job_min_salary)} - ${formatter.format(job.job_max_salary)}</span>`;
    }
    
    // Truncate description
    const description = job.job_description 
        ? (job.job_description.length > 200 ? job.job_description.substring(0, 200) + '...' : job.job_description)
        : 'No description available';
    
    card.innerHTML = `
        <div class="job-header">
            <h3 class="job-title">${escapeHtml(job.job_title || 'Untitled Position')}</h3>
            <p class="job-company">${escapeHtml(job.employer_name || 'Unknown Company')}</p>
        </div>
        
        <div class="job-meta">
            ${/* Replaced 📍 with SVG */ ''}
            ${job.job_city && job.job_state ? `<span class="job-meta-item">${icons.location}${escapeHtml(job.job_city)}, ${escapeHtml(job.job_state)}</span>` : 
              job.job_country ? `<span class="job-meta-item">${icons.location}${escapeHtml(job.job_country)}</span>` : ''}
            
            ${/* Replaced 📅 with SVG */ ''}
            <span class="job-meta-item">${icons.calendar}${postedDate}</span>
            ${salaryText}
        </div>
        
        ${tags.length > 0 ? `
            <div class="job-tags">
                ${tags.map(tag => `<span class="job-tag ${tag.className}">${escapeHtml(tag.text)}</span>`).join('')}
            </div>
        ` : ''}
        
        <div class="job-description">
            ${escapeHtml(description)}
        </div>
        
        <div class="job-actions">
            ${job.job_apply_link ? `<a href="${job.job_apply_link}" target="_blank" rel="noopener noreferrer" class="btn-apply">Apply Now</a>` : ''}
            ${job.job_google_link ? `<a href="${job.job_google_link}" target="_blank" rel="noopener noreferrer" class="btn-apply">View on Google</a>` : ''}
        </div>
    `;
    
    return card;
}

// Handle Sorting
function handleSort() {
    state.sortBy = sortSelect.value;
    sortJobs();
    displayJobs();
}

// Sort Jobs
function sortJobs() {
    switch (state.sortBy) {
        case 'date-asc':
            state.jobs.sort((a, b) => new Date(a.job_posted_at_datetime_utc) - new Date(b.job_posted_at_datetime_utc));
            break;
        case 'date-desc':
            state.jobs.sort((a, b) => new Date(b.job_posted_at_datetime_utc) - new Date(a.job_posted_at_datetime_utc));
            break;
        case 'company':
            state.jobs.sort((a, b) => (a.employer_name || '').localeCompare(b.employer_name || ''));
            break;
    }
}

// Pagination
function changePage(direction) {
    state.currentPage += direction;
    if (state.currentPage < 1) state.currentPage = 1;
    if (state.currentPage > 50) state.currentPage = 50; // API limit
    performSearch();
}

// Update Results Info
function updateResultsInfo() {
    const count = state.jobs.length;
    resultsInfo.textContent = `Found ${count} job${count !== 1 ? 's' : ''} on page ${state.currentPage}`;
    resultsInfo.style.display = 'block';
    
    // Update pagination
    pageInfo.textContent = `Page ${state.currentPage}`;
    prevBtn.disabled = state.currentPage === 1;
    nextBtn.disabled = state.jobs.length < 10; // Assuming 10 jobs per page
}

// Utility Functions
function showLoading() {
    loadingIndicator.style.display = 'block';
    jobsContainer.innerHTML = '';
    sortBar.style.display = 'none';
    pagination.style.display = 'none';
    resultsInfo.style.display = 'none';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    jobsContainer.innerHTML = '';
    sortBar.style.display = 'none';
    pagination.style.display = 'none';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: var(--shadow-lg);
        z-index: 1001;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
