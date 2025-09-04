# Feedback System Setup Guide

## Overview
The feedback system allows users to submit feedback directly from the landing page, which is stored in your Supabase database. This guide will help you set up and configure the system.

## 🗄️ Database Setup

### 1. Run the SQL Schema
Execute the following SQL in your Supabase SQL editor:

```sql
-- Run the feedback table schema
-- File: supabase/feedback_table.sql
```

This creates:
- ✅ `feedback` table with all necessary fields
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for updated_at timestamp
- ✅ Proper constraints and validations

### 2. Table Structure
```sql
feedback (
  id UUID PRIMARY KEY,
  user_id UUID (references auth.users),
  name TEXT,
  email TEXT,
  type TEXT (feature-request, bug-report, etc.),
  rating INTEGER (1-5),
  message TEXT NOT NULL,
  status TEXT (pending, reviewed, resolved, closed),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## 🔧 Frontend Integration

### 1. Feedback Form (Landing Page)
The landing page now includes a comprehensive feedback form with:

- **Name & Email fields** (optional)
- **Feedback type dropdown** (feature-request, bug-report, etc.)
- **5-star rating system** (interactive)
- **Message textarea** (required)
- **Quick feedback buttons** (one-click options)

### 2. Real-time Statistics
The feedback section displays live statistics:
- Total feedback received
- Feature requests count
- Average rating
- Response rate

### 3. Form Validation & UX
- ✅ Real-time form validation
- ✅ Loading states during submission
- ✅ Success/error messaging
- ✅ Automatic form reset
- ✅ Anonymous or authenticated submissions

## 📊 Admin Dashboard

### Access the Admin Feedback Page
Navigate to `/admin/feedback` to view the admin dashboard featuring:

- **Overview Statistics** - Total feedback, ratings, response rates
- **Filter Options** - By type, rating, date
- **Detailed Feedback List** - All submissions with metadata
- **User Information** - Name, email (when provided)
- **Timestamps** - Creation and update dates

### Features:
- 🔍 **Advanced Filtering** - Filter by feedback type and rating
- 📈 **Live Statistics** - Real-time feedback metrics
- 🎨 **Beautiful UI** - Glassmorphism design with animations
- 📱 **Responsive Design** - Works on all devices

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Anonymous users can insert feedback
- ✅ Authenticated users can insert feedback
- ✅ Users can only view their own feedback
- ✅ Admin users can view all feedback (configurable)

### Data Validation
- ✅ Type constraints on feedback categories
- ✅ Rating validation (1-5 stars only)
- ✅ Required message field
- ✅ Email format validation (when provided)

## 🚀 Usage Examples

### Submit Feedback (Frontend)
```javascript
import { db } from '../lib/supabase'

const feedbackData = {
  user_id: user?.id || null,
  name: 'John Doe',
  email: 'john@example.com',
  type: 'feature-request',
  rating: 5,
  message: 'Would love to see a meditation timer!'
}

await db.submitFeedback(feedbackData)
```

### Get Feedback Statistics
```javascript
const stats = await db.getFeedbackStats()
// Returns: { total, featureRequests, averageRating, responseRate }
```

### Admin: Get All Feedback
```javascript
const allFeedback = await db.getAllFeedback()
```

## 📈 Analytics & Insights

The system automatically tracks:
- **Submission trends** - Feedback volume over time
- **User satisfaction** - Average ratings and sentiment
- **Feature priorities** - Most requested features
- **Issue identification** - Bug reports and problems

## 🛠️ Customization Options

### 1. Feedback Types
Modify the feedback types in:
- `supabase/feedback_table.sql` (database constraint)
- `src/pages/Landing.jsx` (form options)

### 2. Rating System
- Currently 1-5 stars
- Can be modified to different scales
- Visual feedback with interactive stars

### 3. Email Notifications
Add email notifications for new feedback:
```javascript
// In your feedback submission handler
await sendEmailNotification({
  to: 'admin@yourapp.com',
  subject: 'New Feedback Received',
  feedback: feedbackData
})
```

## 🔗 Integration Points

### 1. User Authentication
- Works with anonymous users
- Enhanced with authenticated user data
- Links feedback to user profiles

### 2. Admin Dashboard
- Accessible via `/admin/feedback`
- Requires admin role (configurable)
- Real-time data updates

### 3. API Endpoints
All feedback operations use Supabase client:
- `db.submitFeedback(data)`
- `db.getFeedback(userId)`
- `db.getAllFeedback()`
- `db.getFeedbackStats()`

## 🎯 Next Steps

1. **Run the SQL schema** in your Supabase dashboard
2. **Test the feedback form** on your landing page
3. **Check the admin dashboard** for submissions
4. **Customize feedback types** as needed
5. **Set up email notifications** (optional)

## 🐛 Troubleshooting

### Common Issues:
1. **RLS Policy Errors** - Check Supabase RLS settings
2. **Form Submission Fails** - Verify environment variables
3. **Stats Not Loading** - Check database permissions
4. **Admin Access Denied** - Verify admin role setup

### Environment Variables Required:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📞 Support
For additional help:
- Check Supabase documentation
- Review console errors
- Test with different user roles
- Verify database constraints

Your feedback system is now ready to collect valuable user input and help improve your addiction control platform! 🚀
