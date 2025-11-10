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

    // Simple visitor counter (GitHub Pages compatible)
    function initVisitorCounter() {
        const counterElement = document.getElementById('visitorCount');
        if (!counterElement) return;

        let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
        let uniqueVisit = !localStorage.getItem('hasVisited');
        
        if (uniqueVisit) {
            visitCount++;
            localStorage.setItem('visitCount', visitCount.toString());
            localStorage.setItem('hasVisited', 'true');
            
            // Log new visit (for debugging)
            console.log('New visitor! Total visits:', visitCount);
        }
        
        counterElement.textContent = visitCount.toLocaleString();
        
        // Optional: Log current stats
        console.log('Current visitor count:', visitCount);
    }

    // Initialize all functions
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

    // Call this when navigating between pages
    updateActiveNav();
});

// Optional: Simple analytics for tracking page views (localStorage only)
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

// Initialize simple analytics (optional)
const analytics = new SimpleAnalytics();

// Make stats available for debugging
window.getAnalyticsStats = function() {
    return analytics.getStats();
};

// Utility function to clear analytics (for testing)
window.clearAnalytics = function() {
    localStorage.removeItem('dg_analytics');
    localStorage.removeItem('dg_visitor_id');
    console.log('Analytics cleared');
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimpleAnalytics };
}