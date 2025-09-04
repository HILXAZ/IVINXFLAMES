// Analytics utilities for tracking user engagement and app performance
import { supabase } from '../lib/supabase';

class Analytics {
  constructor() {
    this.isEnabled = true;
    this.sessionId = this.generateSessionId();
    this.initTime = Date.now();
    
    // Initialize analytics on page load
    if (typeof window !== 'undefined') {
      this.setupPageTracking();
      this.setupPerformanceTracking();
    }
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track custom events
  async track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    try {
      const eventData = {
        event_name: eventName,
        event_data: {
          ...properties,
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page_url: window.location.href,
          page_title: document.title
        }
      };

      // Store in Supabase
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        eventData.user_id = user.user.id;
      }

      await supabase
        .from('analytics_events')
        .insert([eventData]);

      // Also send to Google Analytics if available
      if (window.gtag) {
        window.gtag('event', eventName, properties);
      }

    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Track page views
  async trackPageView(page, title) {
    await this.track('page_view', {
      page,
      title,
      referrer: document.referrer
    });
  }

  // Track user actions
  async trackAction(action, category, label, value) {
    await this.track('user_action', {
      action,
      category,
      label,
      value
    });
  }

  // Track habit-related events
  async trackHabit(action, habitId, habitName, category) {
    await this.track('habit_interaction', {
      action, // 'created', 'logged', 'updated', 'deleted'
      habit_id: habitId,
      habit_name: habitName,
      habit_category: category
    });
  }

  // Track streak achievements
  async trackStreak(streakLength, habitId) {
    await this.track('streak_achievement', {
      streak_length: streakLength,
      habit_id: habitId,
      milestone: this.getStreakMilestone(streakLength)
    });
  }

  // Track badge earned
  async trackBadgeEarned(badgeId, badgeName) {
    await this.track('badge_earned', {
      badge_id: badgeId,
      badge_name: badgeName
    });
  }

  // Track AI assistant usage
  async trackAssistant(action, messageLength, responseTime) {
    await this.track('ai_assistant', {
      action, // 'message_sent', 'voice_activated', 'response_received'
      message_length: messageLength,
      response_time: responseTime
    });
  }

  // Track emergency/SOS usage
  async trackEmergency(action, resourceUsed) {
    await this.track('emergency_help', {
      action, // 'sos_activated', 'resource_clicked', 'hotline_called'
      resource_used: resourceUsed,
      urgency: 'high'
    });
  }

  // Track community interaction
  async trackCommunity(action, messageLength, room) {
    await this.track('community_interaction', {
      action, // 'message_sent', 'room_joined', 'message_liked'
      message_length: messageLength,
      room
    });
  }

  // Track errors
  async trackError(errorType, errorMessage, context) {
    await this.track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      context,
      severity: 'medium'
    });
  }

  // Track performance metrics
  async trackPerformance(metric, value, context) {
    await this.track('performance_metric', {
      metric, // 'page_load_time', 'api_response_time', 'render_time'
      value,
      context
    });
  }

  // Setup automatic page tracking
  setupPageTracking() {
    // Track initial page load
    this.trackPageView(window.location.pathname, document.title);

    // Track navigation for SPA
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        this.trackPageView(window.location.pathname, document.title);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // Setup performance tracking
  setupPerformanceTracking() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, 'initial_load');
          this.trackPerformance('dom_ready_time', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'initial_load');
        }
      }, 0);
    });

    // Track core web vitals if available
    try {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => this.trackPerformance('CLS', metric.value, 'web_vital'));
        getFID((metric) => this.trackPerformance('FID', metric.value, 'web_vital'));
        getFCP((metric) => this.trackPerformance('FCP', metric.value, 'web_vital'));
        getLCP((metric) => this.trackPerformance('LCP', metric.value, 'web_vital'));
        getTTFB((metric) => this.trackPerformance('TTFB', metric.value, 'web_vital'));
      }).catch(() => {
        console.log('Web vitals not available');
      });
    } catch (error) {
      console.log('Web vitals not available');
    }
  }

  // Helper to determine streak milestones
  getStreakMilestone(streakLength) {
    if (streakLength === 1) return 'first_day';
    if (streakLength === 7) return 'one_week';
    if (streakLength === 30) return 'one_month';
    if (streakLength === 100) return 'one_hundred_days';
    if (streakLength === 365) return 'one_year';
    if (streakLength % 30 === 0) return 'monthly_milestone';
    if (streakLength % 7 === 0) return 'weekly_milestone';
    return 'daily_progress';
  }

  // Get session analytics
  getSessionDuration() {
    return Date.now() - this.initTime;
  }

  // Enable/disable analytics
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Track session end
  async trackSessionEnd() {
    await this.track('session_end', {
      session_duration: this.getSessionDuration(),
      session_id: this.sessionId
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

// Track session end on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.trackSessionEnd();
  });

  // Export to window for debugging
  window.analytics = analytics;
}

export default analytics;

// Convenience functions for common tracking
export const trackHabitLog = (habitId, habitName, success) => {
  analytics.trackHabit('logged', habitId, habitName, success ? 'success' : 'failure');
};

export const trackPageView = (page, title) => {
  analytics.trackPageView(page, title);
};

export const trackButtonClick = (buttonName, location) => {
  analytics.trackAction('button_click', 'ui_interaction', buttonName, location);
};

export const trackFeatureUsage = (feature, action) => {
  analytics.trackAction(action, 'feature_usage', feature);
};

export const trackError = (error, context) => {
  analytics.trackError(error.name || 'Unknown', error.message || 'Unknown error', context);
};
