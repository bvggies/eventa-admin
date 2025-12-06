# Deploy Admin Dashboard to Vercel

## 🚀 Quick Deployment Steps

### 1. Ensure Code is Pushed to GitHub

Your code should already be at: https://github.com/bvggies/eventa-admin

If you have uncommitted changes:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import Repository**:
   - Select `bvggies/eventa-admin` from the list
   - Click "Import"

5. **Configure Project**:
   - **Framework Preset**: Create React App (should auto-detect)
   - **Root Directory**: Leave blank (or `admin-dashboard` if in monorepo)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `build` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

6. **Add Environment Variables**:
   Click "Environment Variables" and add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your backend API URL
     - For local testing: `http://localhost:5000/api`
     - For production: `https://your-backend.vercel.app/api` or your backend URL
   - **Environments**: Select all (Production, Preview, Development)

7. **Click "Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from admin-dashboard directory)
cd admin-dashboard
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time) or Yes (if redeploying)
# - Project name: eventa-admin (or your choice)
# - Directory: ./
# - Override settings? No

# Add environment variable
vercel env add REACT_APP_API_URL
# Enter your API URL when prompted
# Select environments: Production, Preview, Development

# Deploy to production
vercel --prod
```

### 3. Verify Deployment

After deployment completes:

1. **Check the deployment URL** (provided by Vercel)
2. **Test the login page**:
   - Should load without errors
   - Should show development credentials (if in preview)
3. **Test login**:
   - Email: `organizer@eventa.com`
   - Password: `password123`
4. **Check browser console** for any errors

### 4. Configure Automatic Deployments

Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Handles SSL certificates automatically
- ✅ Provides CDN distribution

### 5. Environment Variables

**Required Environment Variable:**
- `REACT_APP_API_URL` - Your backend API URL

**To update environment variables:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Edit variables
5. **Redeploy** the project for changes to take effect

### 6. Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, usually < 1 minute)

## 🔧 Vercel Configuration

The project includes `vercel.json` with:
- Build command: `npm run build`
- Output directory: `build`
- Framework: Create React App
- Rewrites for React Router (SPA routing)

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Tailwind CSS"**
- Already fixed! Using Tailwind v3.4.0 with proper PostCSS config

**Error: "TypeScript errors"**
- Check build logs in Vercel dashboard
- Fix any TypeScript errors locally first

### Runtime Errors

**"Login failed" or API errors**
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check backend CORS settings allow your Vercel domain
- Ensure backend is accessible from the internet

**"localStorage access denied"**
- This is a browser-side issue, not deployment
- Users need to allow cookies/localStorage in their browser
- The app now shows helpful error messages

**404 on page refresh**
- The `vercel.json` rewrites should handle this
- If not, check that rewrites are configured correctly

### Check Build Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click on a deployment
4. View "Build Logs" tab

## 📊 Deployment Status

After deployment, you can:
- View deployment history
- See build logs
- Rollback to previous deployments
- View analytics (if enabled)

## 🔐 Security Notes

- Never commit `.env` files
- Use Vercel Environment Variables for secrets
- Backend API should have CORS configured for your Vercel domain
- Use HTTPS (automatic with Vercel)

## 📝 Next Steps

After successful deployment:
1. Test all features
2. Set up monitoring (optional)
3. Configure custom domain (optional)
4. Set up staging environment (optional)

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check deployment logs in Vercel dashboard

