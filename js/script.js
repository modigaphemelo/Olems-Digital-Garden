// Simple JavaScript for mobile sidebar toggle, date update, and visitor counter
document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Update last updated date
    function updateLastUpdated() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        };
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    // Improved visitor counter for GitHub Pages
    function initVisitorCounter() {
        const counterElement = document.getElementById('visitorCount');
        if (!counterElement) return;

        try {
            // Use sessionStorage for current session and localStorage for persistence
            let sessionCount = sessionStorage.getItem('sessionVisitCount') || '0';
            let totalCount = localStorage.getItem('totalVisitCount') || '0';
            
            // Check if this is a new session
            if (!sessionStorage.getItem('sessionStarted')) {
                sessionCount = '0';
                sessionStorage.setItem('sessionStarted', 'true');
            }
            
            // Increment counts
            sessionCount = parseInt(sessionCount) + 1;
            totalCount = parseInt(totalCount) + 1;
            
            // Store updated counts
            sessionStorage.setItem('sessionVisitCount', sessionCount.toString());
            localStorage.setItem('totalVisitCount', totalCount.toString());
            
            // Display total count (you can change this to sessionCount if preferred)
            counterElement.textContent = totalCount.toLocaleString();
            
            console.log('Visitor count updated - Session:', sessionCount, 'Total:', totalCount);
            
        } catch (error) {
            console.warn('Visitor counter error:', error);
            counterElement.textContent = '∞'; // Fallback display
        }
    }

    // Alternative simpler counter (uncomment if above doesn't work)
    function initSimpleCounter() {
        const counterElement = document.getElementById('visitorCount');
        if (!counterElement) return;

        try {
            let count = localStorage.getItem('simpleVisitCount') || '0';
            count = parseInt(count) + 1;
            localStorage.setItem('simpleVisitCount', count.toString());
            counterElement.textContent = count.toLocaleString();
        } catch (error) {
            counterElement.textContent = '1000+'; // Generic fallback
        }
    }

    // Cookie-based counter as backup
    function initCookieCounter() {
        const counterElement = document.getElementById('visitorCount');
        if (!counterElement) return;

        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }

        function setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
        }

        try {
            let count = getCookie('cookieVisitCount');
            if (!count) {
                count = '0';
            }
            count = parseInt(count) + 1;
            setCookie('cookieVisitCount', count.toString(), 365); // Store for 1 year
            counterElement.textContent = count.toLocaleString();
        } catch (error) {
            console.warn('Cookie counter failed:', error);
        }
    }

    // Initialize all functions
    updateLastUpdated();
    
    // Try multiple counter methods
    initVisitorCounter(); // Primary method
    
    // Fallback: If counter still shows 0 after 2 seconds, try alternative
    setTimeout(() => {
        const currentCount = document.getElementById('visitorCount')?.textContent;
        if (currentCount === '0' || !currentCount) {
            console.log('Primary counter failed, trying fallback...');
            initSimpleCounter();
        }
    }, 2000);

    // Close sidebar when clicking on main content on mobile
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.addEventListener('click', function() {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading state management
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Add fade-in animation to all content sections
        const contentSections = document.querySelectorAll('.content-section');
        contentSections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
        });
    });

    // Handle navigation active states
    function updateActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPage || 
                (currentPage === 'index.html' && linkHref === 'index.html') ||
                (currentPage === '' && linkHref === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Call this when navigating between pages
    updateActiveNav();
});

// Enhanced analytics for GitHub Pages
class SimpleAnalytics {
    constructor() {
        this.storageKey = 'dg_analytics';
        this.visitorId = this.getOrCreateVisitorId();
        this.sessionId = this.generateSessionId();
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getOrCreateVisitorId() {
        try {
            let vid = localStorage.getItem('dg_visitor_id');
            if (!vid) {
                vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('dg_visitor_id', vid);
            }
            return vid;
        } catch (error) {
            return 'anonymous_visitor';
        }
    }

    init() {
        this.trackPageView();
        this.setupEventTracking();
    }

    trackPageView() {
        try {
            const pageData = {
                type: 'pageview',
                visitorId: this.visitorId,
                sessionId: this.sessionId,
                page: window.location.pathname,
                title: document.title,
                timestamp: new Date().toISOString(),
                referrer: document.referrer,
                userAgent: navigator.userAgent
            };

            this.saveEvent(pageData);
            console.log('Pageview tracked:', pageData);
        } catch (error) {
            console.warn('Failed to track pageview:', error);
        }
    }

    trackEvent(eventName, properties = {}) {
        try {
            const eventData = {
                type: 'event',
                visitorId: this.visitorId,
                sessionId: this.sessionId,
                event: eventName,
                properties: properties,
                timestamp: new Date().toISOString()
            };

            this.saveEvent(eventData);
        } catch (error) {
            console.warn('Failed to track event:', error);
        }
    }

    setupEventTracking() {
        // Track external link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && (link.hostname !== window.location.hostname)) {
                this.trackEvent('external_link_click', {
                    href: link.href,
                    text: link.textContent?.trim()
                });
            }
        });

        // Track social link clicks
        document.addEventListener('click', (e) => {
            const socialLink = e.target.closest('.social-link, .sidebar-social-link, .footer-social-link');
            if (socialLink) {
                this.trackEvent('social_link_click', {
                    platform: socialLink.classList.contains('github') ? 'github' : 'twitter',
                    href: socialLink.href
                });
            }
        });
    }

    saveEvent(eventData) {
        try {
            const events = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            events.push(eventData);
            // Keep only last 500 events to prevent storage overflow
            localStorage.setItem(this.storageKey, JSON.stringify(events.slice(-500)));
        } catch (e) {
            console.warn('Could not save analytics event:', e);
        }
    }

    getStats() {
        try {
            const events = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            const pageviews = events.filter(e => e.type === 'pageview');
            const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
            
            return {
                totalPageViews: pageviews.length,
                uniqueVisitors: uniqueVisitors,
                recentActivity: events.slice(-5)
            };
        } catch (error) {
            return {
                totalPageViews: 0,
                uniqueVisitors: 0,
                recentActivity: []
            };
        }
    }
}

// Initialize enhanced analytics
const analytics = new SimpleAnalytics();

// Make stats available for debugging
window.getAnalyticsStats = function() {
    return analytics.getStats();
};

// Enhanced clear function
window.clearAnalytics = function() {
    try {
        localStorage.removeItem('dg_analytics');
        localStorage.removeItem('dg_visitor_id');
        localStorage.removeItem('totalVisitCount');
        localStorage.removeItem('simpleVisitCount');
        sessionStorage.clear();
        console.log('All analytics and counters cleared');
    } catch (error) {
        console.error('Error clearing analytics:', error);
    }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimpleAnalytics };
}
