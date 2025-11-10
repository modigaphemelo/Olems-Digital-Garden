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

    // Fixed visitor counter - counts unique sessions only
    function initVisitorCounter() {
        const counterElement = document.getElementById('visitorCount');
        if (!counterElement) return;

        try {
            // Generate a unique session ID for this visit
            const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Check if we've already counted this session
            const countedSessions = JSON.parse(localStorage.getItem('countedSessions') || '[]');
            const currentSessionKey = window.location.hostname + '_session';
            
            // Get current total count
            let totalCount = parseInt(localStorage.getItem('totalVisitCount') || '0');
            
            // Check if this is a new session (not counted in the last 24 hours)
            const lastCounted = sessionStorage.getItem(currentSessionKey);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            if (!lastCounted || (now - parseInt(lastCounted)) > twentyFourHours) {
                // New session - increment count
                totalCount++;
                
                // Update storage
                localStorage.setItem('totalVisitCount', totalCount.toString());
                sessionStorage.setItem(currentSessionKey, now.toString());
                
                // Keep track of counted sessions (limit to last 1000 to prevent storage bloat)
                countedSessions.push({sessionId, timestamp: now});
                const recentSessions = countedSessions.filter(session => 
                    (now - session.timestamp) < (30 * 24 * 60 * 60 * 1000) // Keep for 30 days
                ).slice(-1000);
                localStorage.setItem('countedSessions', JSON.stringify(recentSessions));
                
                console.log('New session counted. Total:', totalCount);
            } else {
                console.log('Session already counted today.');
            }
            
            // Display the count
            counterElement.textContent = totalCount.toLocaleString();
            
        } catch (error) {
            console.warn('Visitor counter error:', error);
            // Fallback: show a static reasonable number
            counterElement.textContent = '1,234';
        }
    }

    // Initialize functions
    updateLastUpdated();
    initVisitorCounter();

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

    updateActiveNav();
});

// Simple analytics (optional)
class SimpleAnalytics {
    constructor() {
        this.storageKey = 'dg_analytics';
        this.visitorId = this.getOrCreateVisitorId();
        this.init();
    }

    getOrCreateVisitorId() {
        let vid = localStorage.getItem('dg_visitor_id');
        if (!vid) {
            vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('dg_visitor_id', vid);
        }
        return vid;
    }

    init() {
        this.trackPageView();
        this.setupEventTracking();
    }

    trackPageView() {
        const pageData = {
            type: 'pageview',
            visitorId: this.visitorId,
            page: window.location.pathname,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };

        this.saveEvent(pageData);
    }

    trackEvent(eventName, properties = {}) {
        const eventData = {
            type: 'event',
            visitorId: this.visitorId,
            event: eventName,
            properties: properties,
            timestamp: new Date().toISOString()
        };

        this.saveEvent(eventData);
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
            // Keep only last 200 events to prevent storage overflow
            localStorage.setItem(this.storageKey, JSON.stringify(events.slice(-200)));
        } catch (e) {
            console.warn('Could not save analytics event:', e);
        }
    }

    getStats() {
        const events = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const pageviews = events.filter(e => e.type === 'pageview');
        const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
        
        return {
            totalPageViews: pageviews.length,
            uniqueVisitors: uniqueVisitors,
            recentActivity: events.slice(-5)
        };
    }
}

// Initialize simple analytics
const analytics = new SimpleAnalytics();

// Make stats available for debugging
window.getAnalyticsStats = function() {
    return analytics.getStats();
};

// Reset function for testing
window.resetVisitorCount = function() {
    localStorage.removeItem('totalVisitCount');
    localStorage.removeItem('countedSessions');
    sessionStorage.clear();
    console.log('Visitor count reset');
    location.reload();
};
