# Deployment Configuration for Addiction Control Web App

## Production Environment Variables

### Required Variables (Set in your hosting platform):
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_HF_API_TOKEN=your_huggingface_api_token
```

### Optional Variables:
```
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn_for_error_tracking
VITE_APP_VERSION=1.0.0
```

## Vercel Deployment

### 1. Install Vercel CLI:
```bash
npm install -g vercel
```

### 2. Deploy:
```bash
vercel --prod
```

### 3. Environment Variables:
Set in Vercel dashboard under Settings → Environment Variables

### 4. Build Command:
```bash
npm run build
```

### 5. Output Directory:
```
dist
```

## Netlify Deployment

### 1. Build Settings:
- Build command: `npm run build`
- Publish directory: `dist`

### 2. Environment Variables:
Set in Netlify dashboard under Site settings → Environment variables

### 3. Redirects (create `public/_redirects`):
```
/*    /index.html   200
```

## GitHub Pages (Alternative)

### 1. Build and Deploy Action:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Performance Optimization

### 1. Bundle Analysis:
```bash
npm run analyze
```

### 2. Lighthouse Audit:
- Run in Chrome DevTools
- Check Performance, Accessibility, Best Practices, SEO
- Aim for 90+ scores in all categories

### 3. PWA Checklist:
- [ ] HTTPS enabled
- [ ] Service Worker registered
- [ ] Manifest.json valid
- [ ] Icons generated (multiple sizes)
- [ ] Offline functionality working
- [ ] Install prompt working

## Security Checklist

### Before Going Live:
- [ ] Environment variables set correctly
- [ ] No sensitive data in client code
- [ ] Supabase RLS policies active
- [ ] HTTPS enforced
- [ ] Content Security Policy configured
- [ ] Rate limiting on API endpoints

### Supabase Security:
- [ ] Row Level Security enabled
- [ ] API keys properly scoped
- [ ] Database backups enabled
- [ ] Auth providers configured
- [ ] CORS settings verified

## Monitoring

### Error Tracking:
- Sentry integration for error monitoring
- Supabase error logging
- Browser console error tracking

### Analytics:
- Google Analytics for user behavior
- Custom analytics in Supabase
- Performance monitoring
- User engagement metrics

### Health Checks:
- API endpoint monitoring
- Database connection checks
- Service worker status
- PWA installation rates

## Post-Deployment

### 1. Test PWA Installation:
- Mobile browsers (Chrome, Safari, Firefox)
- Desktop browsers (Chrome, Edge)
- Add to home screen functionality

### 2. Test Core Features:
- User registration and login
- Habit tracking functionality
- AI assistant (voice and text)
- Community chat
- Emergency features
- Offline functionality

### 3. Performance Testing:
- Page load speeds
- API response times
- Database query performance
- Image loading optimization

### 4. SEO Verification:
- Google Search Console setup
- Meta tags verification
- Structured data validation
- Sitemap submission

## Maintenance

### Regular Tasks:
- Dependency updates
- Security patches
- Database maintenance
- Performance monitoring
- User feedback review

### Backup Strategy:
- Automated Supabase backups
- Code repository backups
- Environment variable documentation
- Deployment configuration backup

## Support Resources

### Documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)

### Community:
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- Discord/Slack for community support

## Rollback Plan

### If Issues Occur:
1. Revert to previous deployment
2. Check error logs and monitoring
3. Fix issues in development
4. Test thoroughly before redeployment
5. Communicate with users if needed

### Emergency Contacts:
- Hosting platform support
- Database provider support
- DNS provider support
- SSL certificate provider
