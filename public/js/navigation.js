// Navigation handler for MindBalance application
// This script manages routing between the static landing page and React app

class MindBalanceRouter {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is on landing page
        if (this.isLandingPage()) {
            this.setupLandingPageNavigation();
        }
        
        // Setup global navigation handlers
        this.setupGlobalHandlers();
    }

    isLandingPage() {
        return window.location.pathname.includes('landing.html') || 
               window.location.pathname === '/landing.html';
    }

    setupLandingPageNavigation() {
        // Override any existing redirectToApp functions
        window.redirectToApp = () => {
            this.navigateToApp();
        };

        // Setup sign-in redirection
        window.handleSignInSuccess = () => {
            this.navigateToApp('/dashboard');
        };
    }

    navigateToApp(path = '/login') {
        // Add loading indicator
        this.showNavigationLoading();
        
        // Navigate to React app
        setTimeout(() => {
            window.location.href = path;
        }, 500);
    }

    showNavigationLoading() {
        // Create and show loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'navigation-loading';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(59, 130, 246, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: 'Inter', sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <div style="font-size: 1.2rem; font-weight: 600;">Loading MindBalance App...</div>
                <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">Preparing your recovery dashboard</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    setupGlobalHandlers() {
        // Handle authentication state changes
        this.checkAuthenticationState();
        
        // Setup error handling
        window.addEventListener('error', this.handleNavigationError.bind(this));
    }

    checkAuthenticationState() {
        // Check if user has valid session
        const hasSession = this.hasValidSession();
        
        if (hasSession && this.isLandingPage()) {
            // User is logged in but on landing page, redirect to dashboard
            this.navigateToApp('/dashboard');
        }
    }

    hasValidSession() {
        // Check for session indicators (adjust based on your auth implementation)
        const sessionData = localStorage.getItem('sb-otnuqynwyzcgonzfppwm-auth-token') ||
                           sessionStorage.getItem('supabase.auth.token') ||
                           document.cookie.includes('supabase-auth-token');
        
        return !!sessionData;
    }

    handleNavigationError(error) {
        console.error('Navigation error:', error);
        
        // Remove loading overlay if it exists
        const overlay = document.getElementById('navigation-loading');
        if (overlay) {
            overlay.remove();
        }
        
        // Show user-friendly error message
        this.showErrorMessage('Navigation failed. Please try again.');
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10001;
            font-family: 'Inter', sans-serif;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// Initialize router when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MindBalanceRouter();
    });
} else {
    new MindBalanceRouter();
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
