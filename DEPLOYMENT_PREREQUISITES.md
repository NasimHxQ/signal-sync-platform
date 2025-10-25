# SignalSync Deployment Prerequisites

## Overview
This document outlines all prerequisites and requirements for deploying SignalSync to your Hostinger server and launching the waitlist landing page.

---

## 1. Server Requirements

### Minimum Server Specifications
- **Node.js**: Version 18.0.0 or higher (recommended: 20.x LTS)
- **Memory**: Minimum 512MB RAM (recommended: 1GB+)
- **Disk Space**: Minimum 500MB free space
- **Operating System**: Linux-based (Ubuntu 20.04+ or similar)

### Hostinger-Specific Requirements
- **Hosting Type**: VPS or Cloud hosting (shared hosting may not support Node.js applications)
- **SSH Access**: Required for deployment and server management
- **Domain**: Custom domain configured and pointed to your server
- **SSL Certificate**: Let's Encrypt or Hostinger-provided SSL for HTTPS

---

## 2. Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database Configuration
DATABASE_URL="file:./prisma/prod.db"

# Node Environment
NODE_ENV="production"

# Application URL (your domain)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Optional: Analytics (if using Vercel Analytics)
# NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
```

### Note on Environment Variables
- Currently, the application **does NOT require** external API keys
- No third-party services are integrated yet (Discord/Telegram/Twitter are Phase 3)
- Database uses SQLite (file-based, no connection strings needed beyond file path)

---

## 3. Database Setup

### SQLite Database Initialization

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Create production database (this will create/update schema)
npx prisma db push --accept-data-loss

# 3. Seed the database with initial data
npm run db:seed
```

### Database File Location
- Development: `prisma/dev.db`
- Production: `prisma/prod.db` (or path specified in DATABASE_URL)
- **Important**: Ensure the database file has proper read/write permissions (chmod 644)

### Database Backup Strategy
- SQLite database is a single file
- Set up automated backups of the database file
- Recommended: Daily backups with 7-day retention

---

## 4. Build and Compilation

### Pre-Build Checklist
```bash
# 1. Install all dependencies
npm install --production=false

# 2. Generate Prisma client
npx prisma generate

# 3. Build the Next.js application
npm run build

# 4. Test the production build locally
npm start
```

### Build Output
- Next.js creates a `.next` folder with optimized production assets
- Prisma generates client in `lib/generated/prisma`
- Both directories must be deployed to the server

---

## 5. Hostinger Deployment Preparation

### Option A: Manual Deployment via SSH
```bash
# 1. Connect to your server
ssh user@your-server-ip

# 2. Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 for process management
sudo npm install -g pm2

# 4. Create application directory
mkdir -p /var/www/signal-sync
cd /var/www/signal-sync

# 5. Upload your built application (using SCP, SFTP, or Git)
# Example using SCP:
# scp -r .next lib prisma public package*.json user@server:/var/www/signal-sync/
```

### Option B: Git-Based Deployment
```bash
# 1. Initialize Git repository (if not already done)
git init
git add .
git commit -m "Initial commit for deployment"

# 2. Add remote repository (GitHub/GitLab/Bitbucket)
git remote add origin your-repo-url
git push -u origin main

# 3. On server, clone and build
cd /var/www/signal-sync
git clone your-repo-url .
npm install
npx prisma generate
npm run build
```

---

## 6. Process Management

### Using PM2 (Recommended)
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'signal-sync',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
```

---

## 7. Web Server Configuration (Nginx)

### Nginx Reverse Proxy Setup
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logs
    access_log /var/log/nginx/signal-sync-access.log;
    error_log /var/log/nginx/signal-sync-error.log;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Public assets
    location /public {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public";
    }
}
```

Save this as `/etc/nginx/sites-available/signal-sync` and enable:
```bash
sudo ln -s /etc/nginx/sites-available/signal-sync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Security Considerations

### File Permissions
```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/signal-sync

# Database file permissions
chmod 644 /var/www/signal-sync/prisma/prod.db
chmod 755 /var/www/signal-sync/prisma
```

### Firewall Configuration
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH (be careful!)
sudo ufw enable
```

### Security Headers (add to Nginx config)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

---

## 9. Pre-Launch Waitlist Modifications

### Current State
The marketing page (`app/(marketing)/page.tsx`) currently links to `/dashboard` which is the **full application**. For a waitlist launch, you should modify this.

### Recommended Changes for Waitlist Launch

**Option A: Convert Dashboard to Waitlist Form**
1. Create a new waitlist component with email capture
2. Disable dashboard access temporarily
3. Store waitlist emails in database

**Option B: Add Separate Waitlist Page**
1. Create `/app/(marketing)/waitlist/page.tsx`
2. Update CTA buttons to link to `/waitlist` instead of `/dashboard`
3. Collect emails and notify users when ready

### Example Waitlist Schema Addition
```prisma
model WaitlistEntry {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  notified  Boolean  @default(false)
  
  @@map("waitlist_entries")
}
```

---

## 10. Monitoring and Maintenance

### Essential Monitoring
- **Application Logs**: `pm2 logs signal-sync`
- **Application Status**: `pm2 status`
- **Database Logs**: Check `logs/signal-sync.log`
- **Server Resources**: `htop` or monitoring dashboard

### Health Check Endpoint
Consider adding a health check endpoint:
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  })
}
```

### Uptime Monitoring
- Use services like UptimeRobot, Pingdom, or StatusCake
- Monitor: `https://yourdomain.com/api/health`
- Alert on downtime

---

## 11. DNS Configuration

### Required DNS Records
```
A Record:
  Host: @ (or yourdomain.com)
  Points to: Your-Server-IP
  TTL: 3600

A Record:
  Host: www
  Points to: Your-Server-IP
  TTL: 3600

(Optional) CNAME Record:
  Host: www
  Points to: yourdomain.com
  TTL: 3600
```

### SSL Certificate Setup
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (Certbot sets this up automatically)
sudo certbot renew --dry-run
```

---

## 12. Testing Checklist

### Pre-Deployment Testing
- [ ] Application builds successfully (`npm run build`)
- [ ] Production build runs locally (`npm start`)
- [ ] Database migrations applied (`npx prisma db push`)
- [ ] Database seeded with initial data
- [ ] All environment variables configured
- [ ] SSL certificate obtained and configured
- [ ] DNS records propagated (use `dig yourdomain.com`)

### Post-Deployment Testing
- [ ] Website loads over HTTPS
- [ ] Marketing page displays correctly
- [ ] CTA buttons work
- [ ] Forms submit successfully (if waitlist implemented)
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Page load speed acceptable (<3 seconds)
- [ ] Console errors checked (browser DevTools)

---

## 13. Performance Optimization

### Image Optimization
- Images are set to `unoptimized: true` in `next.config.mjs`
- For production, consider enabling Next.js image optimization
- Or use a CDN like CloudFlare for static assets

### Caching Strategy
- Static assets: Browser caching (60 minutes)
- API responses: Consider implementing caching headers
- Database queries: Optimize with proper indexing

---

## 14. Deployment Checklist Summary

### Pre-Deployment
- [ ] Node.js 18+ installed on server
- [ ] Database initialized and seeded
- [ ] Environment variables configured
- [ ] Application built and tested locally
- [ ] PM2 process manager installed
- [ ] Nginx configured with SSL
- [ ] DNS records configured
- [ ] Firewall rules set

### Deployment
- [ ] Code uploaded to server (via Git or SCP)
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated
- [ ] Application built on server
- [ ] PM2 started and configured
- [ ] Nginx reloaded
- [ ] SSL certificate verified

### Post-Deployment
- [ ] Website accessible via HTTPS
- [ ] All pages load correctly
- [ ] Forms functional (if applicable)
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Analytics configured (if desired)

---

## 15. Known Limitations & Phase 3 Considerations

### Current Limitations (Phase 2)
- **No real authentication**: Currently uses a demo user stub
- **No external integrations**: Discord/Telegram/Twitter connectors not implemented
- **No real-time signal ingestion**: Signals are currently seeded data
- **No email sending**: Alert system UI exists but doesn't send real emails

### What Works for Waitlist Launch
✅ Marketing landing page  
✅ Feature showcase  
✅ Modern, responsive UI  
✅ Full frontend dashboard (can be converted to waitlist)  
✅ Database persistence  
✅ API infrastructure  

### Phase 3 (Future)
- Implement proper authentication (NextAuth.js or similar)
- Connect to Discord/Telegram/Twitter APIs
- Real-time signal processing
- Email notification system
- Payment integration for premium features

---

## 16. Support and Troubleshooting

### Common Issues

**Issue: Application won't start**
```bash
# Check PM2 logs
pm2 logs signal-sync

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart application
pm2 restart signal-sync
```

**Issue: Database errors**
```bash
# Regenerate Prisma client
npx prisma generate

# Re-push database schema
npx prisma db push --accept-data-loss

# Check database file permissions
ls -la prisma/prod.db
```

**Issue: Nginx 502 Bad Gateway**
```bash
# Check if Next.js is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t
```

---

## 17. Estimated Deployment Time

- **Server setup**: 30-60 minutes (first time)
- **Application deployment**: 15-30 minutes
- **DNS propagation**: 1-48 hours
- **SSL certificate**: 5-10 minutes
- **Testing and verification**: 30-60 minutes

**Total**: 2-4 hours for first deployment

---

## 18. Quick Start Commands

```bash
# On your local machine
npm install
npx prisma generate
npm run build
npm run test  # Optional: run tests

# On your server
cd /var/www/signal-sync
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## Additional Resources

- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Configuration: https://nginx.org/en/docs/

---

**Last Updated**: October 25, 2025  
**Application Version**: 0.1.0  
**Current Phase**: Phase 2 (Database Integration Complete)

