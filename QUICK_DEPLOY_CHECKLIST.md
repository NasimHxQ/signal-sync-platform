# Quick Deployment Checklist

A condensed, actionable checklist for deploying SignalSync to Hostinger.

---

## Pre-Deployment (On Your Local Machine)

### 1. Code Preparation
```bash
☐ npm install
☐ npx prisma generate
☐ npm run test              # Verify all tests pass
☐ npm run build             # Verify build succeeds
☐ npm start                 # Test production build locally
```

### 2. Environment Configuration
```bash
☐ Copy .env.production.example to .env.production
☐ Update DATABASE_URL with production path
☐ Update NEXT_PUBLIC_APP_URL with your domain
☐ Verify no sensitive data in .env files
```

### 3. Version Control
```bash
☐ git add .
☐ git commit -m "Ready for deployment"
☐ git push origin main
☐ Verify all changes pushed to repository
```

---

## Server Setup (First Time Only)

### 1. SSH into Your Server
```bash
☐ ssh user@your-server-ip
☐ Verify connection successful
```

### 2. Install Node.js
```bash
☐ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
☐ sudo apt-get install -y nodejs
☐ node --version    # Verify v20.x or higher
☐ npm --version
```

### 3. Install PM2
```bash
☐ sudo npm install -g pm2
☐ pm2 --version     # Verify installation
```

### 4. Install Nginx (if not already installed)
```bash
☐ sudo apt-get update
☐ sudo apt-get install -y nginx
☐ sudo systemctl status nginx    # Verify running
```

### 5. Create Application Directory
```bash
☐ sudo mkdir -p /var/www/signal-sync
☐ sudo chown -R $USER:$USER /var/www/signal-sync
☐ cd /var/www/signal-sync
```

---

## Application Deployment

### 1. Upload/Clone Your Code

**Option A: Git Clone (Recommended)**
```bash
☐ cd /var/www/signal-sync
☐ git clone https://github.com/yourusername/signal-sync.git .
☐ ls -la    # Verify files present
```

**Option B: SCP Upload**
```bash
# On your local machine
☐ scp -r /Users/nasimhaque/Code/signal-sync/* user@server:/var/www/signal-sync/
```

### 2. Install Dependencies
```bash
☐ cd /var/www/signal-sync
☐ npm install --production
☐ ls node_modules    # Verify dependencies installed
```

### 3. Setup Database
```bash
☐ npx prisma generate
☐ npx prisma db push --accept-data-loss
☐ npm run db:seed
☐ ls -la prisma/     # Verify prod.db created
```

### 4. Build Application
```bash
☐ npm run build
☐ ls -la .next/      # Verify build directory exists
```

### 5. Configure PM2
```bash
☐ Create ecosystem.config.js (see below)
☐ pm2 start ecosystem.config.js
☐ pm2 status         # Verify app running
☐ pm2 logs signal-sync    # Check for errors
☐ pm2 save
☐ pm2 startup        # Follow instructions to enable startup
```

**ecosystem.config.js**
```javascript
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
```

---

## Web Server Configuration

### 1. Configure Nginx
```bash
☐ sudo nano /etc/nginx/sites-available/signal-sync
☐ Paste configuration (see below)
☐ sudo ln -s /etc/nginx/sites-available/signal-sync /etc/nginx/sites-enabled/
☐ sudo nginx -t      # Test configuration
☐ sudo systemctl reload nginx
```

**Minimal Nginx Configuration (HTTP only - for initial setup)**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Configure DNS
```bash
☐ Login to your domain registrar
☐ Add A record: @ → Your-Server-IP
☐ Add A record: www → Your-Server-IP
☐ Wait for DNS propagation (check with: dig yourdomain.com)
```

### 3. Setup SSL Certificate
```bash
☐ sudo apt-get install -y certbot python3-certbot-nginx
☐ sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
☐ Follow prompts to configure SSL
☐ Test auto-renewal: sudo certbot renew --dry-run
```

---

## Post-Deployment Testing

### 1. Verify Application
```bash
☐ curl http://localhost:3000     # Test locally on server
☐ Open https://yourdomain.com    # Test from browser
☐ Check console for errors (F12 → Console)
☐ Test navigation between pages
☐ Verify CTA buttons work
```

### 2. Test API Endpoints
```bash
☐ curl https://yourdomain.com/api/signals
☐ curl https://yourdomain.com/api/me
☐ Verify JSON responses
```

### 3. Mobile Testing
```bash
☐ Test on mobile device
☐ Check responsive design
☐ Verify forms work on mobile
```

### 4. Performance Testing
```bash
☐ Check page load speed (<3 seconds)
☐ Run Lighthouse audit
☐ Check GTmetrix score
```

---

## Security Configuration

### 1. Firewall Setup
```bash
☐ sudo ufw allow 22/tcp      # SSH
☐ sudo ufw allow 80/tcp      # HTTP
☐ sudo ufw allow 443/tcp     # HTTPS
☐ sudo ufw enable
☐ sudo ufw status            # Verify rules
```

### 2. File Permissions
```bash
☐ sudo chown -R www-data:www-data /var/www/signal-sync
☐ chmod 755 /var/www/signal-sync
☐ chmod 644 /var/www/signal-sync/prisma/prod.db
```

### 3. Secure SSH (Recommended)
```bash
☐ Disable root login
☐ Use SSH keys instead of passwords
☐ Change default SSH port (optional)
```

---

## Monitoring Setup

### 1. Application Monitoring
```bash
☐ pm2 logs signal-sync       # View logs
☐ pm2 monit                  # Monitor resources
☐ Setup log rotation (PM2 handles this automatically)
```

### 2. Uptime Monitoring
```bash
☐ Sign up for UptimeRobot (free)
☐ Add monitor for https://yourdomain.com
☐ Configure email alerts
```

### 3. Error Tracking
```bash
☐ Check application logs: tail -f /var/www/signal-sync/logs/signal-sync.log
☐ Check Nginx logs: sudo tail -f /var/log/nginx/error.log
☐ Check PM2 logs: pm2 logs signal-sync
```

---

## Backup Strategy

### 1. Database Backup
```bash
☐ Create backup directory: mkdir -p /var/backups/signal-sync
☐ Manual backup: cp /var/www/signal-sync/prisma/prod.db /var/backups/signal-sync/prod-$(date +%Y%m%d).db
☐ Setup automated backups (cron job)
```

**Automated Daily Backup (Cron)**
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cp /var/www/signal-sync/prisma/prod.db /var/backups/signal-sync/prod-$(date +\%Y\%m\%d).db

# Verify cron job
crontab -l
```

### 2. Code Backup
```bash
☐ Ensure all code is in Git repository
☐ Push regularly to remote repository
☐ Tag releases: git tag -a v1.0.0 -m "Initial release"
```

---

## Troubleshooting Common Issues

### Application Won't Start
```bash
☐ Check PM2 status: pm2 status
☐ Check PM2 logs: pm2 logs signal-sync
☐ Restart application: pm2 restart signal-sync
☐ Check if port 3000 is in use: sudo lsof -i :3000
```

### Nginx 502 Bad Gateway
```bash
☐ Verify Next.js is running: pm2 status
☐ Check Nginx error logs: sudo tail -f /var/log/nginx/error.log
☐ Test Nginx config: sudo nginx -t
☐ Restart Nginx: sudo systemctl restart nginx
```

### Database Errors
```bash
☐ Check database exists: ls -la /var/www/signal-sync/prisma/prod.db
☐ Check permissions: ls -la /var/www/signal-sync/prisma/
☐ Regenerate Prisma client: npx prisma generate
☐ Re-push schema: npx prisma db push
```

### SSL Certificate Issues
```bash
☐ Check certificate: sudo certbot certificates
☐ Renew certificate: sudo certbot renew
☐ Restart Nginx: sudo systemctl restart nginx
```

---

## Maintenance Commands

### Update Application
```bash
☐ cd /var/www/signal-sync
☐ git pull origin main
☐ npm install
☐ npx prisma generate
☐ npx prisma db push
☐ npm run build
☐ pm2 restart signal-sync
```

### View Logs
```bash
☐ Application logs: pm2 logs signal-sync
☐ Nginx access logs: sudo tail -f /var/log/nginx/access.log
☐ Nginx error logs: sudo tail -f /var/log/nginx/error.log
☐ System logs: sudo journalctl -xe
```

### Monitor Resources
```bash
☐ CPU/Memory: htop
☐ Disk usage: df -h
☐ PM2 monitoring: pm2 monit
```

### Restart Services
```bash
☐ Restart application: pm2 restart signal-sync
☐ Restart Nginx: sudo systemctl restart nginx
☐ Restart server: sudo reboot (use sparingly!)
```

---

## Optional: Waitlist Implementation

If you want to launch with a waitlist instead of the full dashboard:

```bash
☐ Review WAITLIST_SETUP.md
☐ Choose Option 1 (Quick Waitlist) for fastest implementation
☐ Update Prisma schema with WaitlistEntry model
☐ Create /app/api/waitlist/route.ts
☐ Modify marketing page CTAs
☐ Test waitlist signup locally
☐ Deploy updates
```

---

## Launch Checklist

### Final Pre-Launch Checks
```bash
☐ All pages load correctly
☐ SSL certificate valid and working
☐ Forms submit successfully
☐ API endpoints responding
☐ Mobile responsive
☐ Page load speed acceptable
☐ No console errors
☐ Analytics configured (if using)
☐ Uptime monitoring active
☐ Backup strategy in place
```

### Go Live!
```bash
☐ Share URL on social media
☐ Send to beta testers
☐ Monitor error logs
☐ Watch uptime monitoring
☐ Respond to user feedback
```

---

## Quick Reference Commands

### Application Management
```bash
pm2 start signal-sync          # Start app
pm2 stop signal-sync           # Stop app
pm2 restart signal-sync        # Restart app
pm2 logs signal-sync           # View logs
pm2 status                     # Check status
```

### Server Management
```bash
sudo systemctl restart nginx   # Restart Nginx
sudo systemctl status nginx    # Check Nginx status
sudo nginx -t                  # Test Nginx config
```

### Database Management
```bash
npx prisma studio              # Open database GUI
npx prisma db push             # Update database schema
npx prisma generate            # Regenerate client
npm run db:seed                # Seed database
```

---

## Emergency Rollback

If something goes wrong:

```bash
☐ Stop current version: pm2 stop signal-sync
☐ Checkout previous version: git checkout <previous-commit-hash>
☐ Rebuild: npm run build
☐ Restart: pm2 restart signal-sync
☐ Verify site working
☐ Investigate issue in separate branch
```

---

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **PM2 Docs**: https://pm2.keymetrics.io/docs
- **Nginx Docs**: https://nginx.org/en/docs
- **Let's Encrypt**: https://letsencrypt.org/getting-started

---

## Estimated Timeline

- **Server Setup**: 30-60 minutes (first time)
- **Application Deployment**: 15-30 minutes
- **DNS + SSL**: 1-2 hours (includes propagation wait)
- **Testing**: 30 minutes
- **Total**: 2-4 hours

---

**Ready to deploy? Start from the top and check off each item!** 🚀

