# JobFinder - Professional Job Search Application

- **DEMO:**

A simple and modern job search web application that uses the LinkedIn Job Search API to help users find their next career opportunity.

## Project Information

- **Developer:** Jean De Dieu
- **Email:** j.tuyishime6@alustudent.com
- **Repository:** https://github.com/Jtuyishime6/jean-search.git
- **Domain:** tuyishime.tech

## Features

- Real-time job search using LinkedIn Job Search API
- Advanced filtering options (location, job type, remote/on-site)
- Sort jobs by date or company name
- Responsive and modern user interface
- Secure API key management
- Pagination for browsing multiple results
- Error handling for API failures and invalid requests
- Performance optimized with caching mechanisms

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- LinkedIn Job Search API via RapidAPI

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A RapidAPI account with access to the LinkedIn Job Search API
- Basic understanding of web servers for deployment

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Jtuyishime6/jean-search.git
cd jean-search
```

2. Open the project in your preferred code editor (VS Code recommended)

3. Open `index.html` in your web browser or use a local development server:
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000
```

4. Navigate to `http://localhost:8000` in your browser

5. Click the Settings button and enter your RapidAPI key

6. Start searching for jobs!

### Getting Your API Key

1. Go to https://rapidapi.com
2. Sign up or log in to your account
3. Search for "JSearch API"
4. Subscribe to the API (free tier available)
5. Copy your API key from the dashboard
6. Paste it in the Settings modal in the application

## API Integration

This application uses the JSearch API with the following endpoints:

1. **Job Search** (`/search`) - Search for jobs with various filters
2. **Job Details** (`/job-details`) - Get detailed information about specific jobs
3. **Salary Estimates** (`/estimated-salary`) - Get salary information for job titles

### Supported Search Parameters

- Query: Search by job title and/or location (e.g., "software engineer in New York")
- Date Posted: Filter by all, today, 3days, week, or month
- Work From Home: Filter for remote jobs only
- Employment Types: Filter by FULLTIME, PARTTIME, CONTRACTOR, INTERN
- Job Requirements: Filter by experience level (under_3_years_experience, more_than_3_years_experience, no_experience, no_degree)
- Page: Navigate through multiple pages of results (up to 50 pages)

## File Structure

```
jean-search/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet with modern UI design
├── main.js             # Application logic and API integration
├── config.js           # Configuration and constants
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Deployment

### Server Details

- **Web Server 01:** 98.93.161.111 (ubuntu@6852-web-01)
- **Web Server 02:** 44.210.142.182 (ubuntu@6852-web-02)
- **Load Balancer:** 44.201.85.9 (ubuntu@6852-lb-01)

### Deployment Steps

#### Step 1: Prepare Your Files

1. Zip your project files:
```bash
zip -r jean-search.zip index.html styles.css main.js config.js
```

#### Step 2: Deploy to Web Servers

Deploy to both web servers (repeat for both IPs):

```bash
# Web Server 01
scp jean-search.zip ubuntu@98.93.161.111:~/
ssh ubuntu@98.93.161.111

# On the server
sudo apt update
sudo apt install -y nginx unzip
unzip jean-search.zip -d /var/www/html/jean-search
sudo chown -R www-data:www-data /var/www/html/jean-search
```

```bash
# Web Server 02
scp jean-search.zip ubuntu@44.210.142.182:~/
ssh ubuntu@44.210.142.182

# On the server
sudo apt update
sudo apt install -y nginx unzip
unzip jean-search.zip -d /var/www/html/jean-search
sudo chown -R www-data:www-data /var/www/html/jean-search
```

#### Step 3: Configure Nginx on Web Servers

Create Nginx configuration on both servers:

```bash
sudo nano /etc/nginx/sites-available/jean-search
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name _;
    
    root /var/www/html/jean-search;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/jean-search /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: Configure Load Balancer

SSH into the load balancer:

```bash
ssh ubuntu@44.201.85.9
```

Install and configure HAProxy:

```bash
sudo apt update
sudo apt install -y haproxy
sudo nano /etc/haproxy/haproxy.cfg
```

Add this configuration:

```
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend http_front
    bind *:80
    stats uri /haproxy?stats
    default_backend http_back

backend http_back
    balance roundrobin
    server web01 98.93.161.111:80 check
    server web02 44.210.142.182:80 check
```

Restart HAProxy:

```bash
sudo systemctl restart haproxy
sudo systemctl enable haproxy
```

#### Step 5: Test Your Deployment

1. Test individual web servers:
   - http://98.93.161.111/jean-search
   - http://44.210.142.182/jean-search

2. Test load balancer:
   - http://44.201.85.9/jean-search

3. Check HAProxy stats:
   - http://44.201.85.9/haproxy?stats

## Usage Guide

1. Open the application in your browser
2. Click the Settings button in the header
3. Enter your RapidAPI key and save
4. Enter search criteria:
   - Job title and/or location (e.g., "software engineer in Chicago")
   - Select time range (all time, today, last 3 days, this week, this month)
   - Choose remote preference
   - Optional: Add job type filter (Full Time, Part Time, Contract, Internship)
   - Optional: Add experience level filter
5. Click "Search Jobs"
6. Browse results and click "Apply Now" or "View on Google" on any listing
7. Use pagination to see more results (up to 50 pages)
8. Sort results by date or company name

## Error Handling

The application includes comprehensive error handling:

- Invalid API key detection
- Rate limit warnings
- Network error messages
- No results found notifications
- Graceful fallbacks for missing data

## Performance Optimization

- Cached API responses (5-minute duration)
- Efficient DOM manipulation
- Lazy loading of job descriptions
- Optimized CSS with minimal repaints
- Compressed responses via Nginx gzip

## Challenges and Solutions

### Challenge 1: API Rate Limiting
The LinkedIn Job Search API has rate limits. I implemented proper error handling to detect rate limit responses and display user-friendly messages.

### Challenge 2: Data Consistency
Job postings from various sources have different data structures. I implemented comprehensive null checks and conditional rendering to handle missing fields like salary information, location details, and company data gracefully.

### Challenge 3: Load Balancer Configuration
Setting up HAProxy to properly distribute traffic required understanding of backend health checks and connection timeouts. The configuration file includes proper monitoring endpoints.

### Challenge 4: Cross-Origin Requests
Modern browsers block certain cross-origin requests. The application properly handles CORS by using the official API endpoints and headers.

## Credits and Resources

- **API Provider:** RapidAPI - JSearch API
  - Documentation: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
  - This API provides comprehensive job data from multiple sources including Google Jobs

- **Design Inspiration:** Modern web design principles with focus on usability

- **Icons:** Text-based icons for maximum compatibility

## Security Notes

- API keys are stored in localStorage (client-side only)
- Never commit API keys to the repository
- The application uses HTTPS-only API calls
- Input sanitization prevents XSS attacks
- No sensitive data is logged

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential features for future versions:
- Save favorite jobs
- Email job alerts
- Advanced salary filtering
- Company ratings integration
- Resume upload and matching

## License

This project is created for educational purposes as part of a web development assignment.

## Support

For issues or questions:
- Email: j.tuyishime6@alustudent.com
- Repository Issues: https://github.com/Jtuyishime6/jean-search/issues

## Acknowledgments

Special thanks to:
- RapidAPI for providing the LinkedIn Job Search API
- The open-source community for web development resources
- My instructors for guidance on web server deployment

---

Built with dedication by Jean De Dieu | 2025
