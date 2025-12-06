# Admin Dashboard Deployment Guide

This guide will help you deploy the Eventa Admin Dashboard to Vercel using GitHub.

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Node.js 18+ installed locally

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
cd admin-dashboard
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push to GitHub:
```bash
git remote add origin https://github.com/bvggies/eventa-admin.git
git branch -M main
git push -u origin main
```

## Step 2: Connect to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `admin-dashboard` (if monorepo) or leave blank
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-api.vercel.app/api`)

6. Click "Deploy"

### Option B: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd admin-dashboard
vercel
```

4. Follow the prompts and add environment variables when asked

## Step 3: Configure GitHub Secrets (For CI/CD)

If you want automatic deployments on push:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: Get from Vercel dashboard > Settings > General
   - `VERCEL_PROJECT_ID`: Get from Vercel project settings
   - `REACT_APP_API_URL`: Your backend API URL

## Step 4: Environment Variables

Make sure to set these in Vercel:

- `REACT_APP_API_URL`: Your production backend API URL

To set environment variables in Vercel:
1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the variables for Production, Preview, and Development

## Step 5: Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Domains
3. Add your custom domain
4. Follow the DNS configuration instructions

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Rebuild on environment variable changes

## Manual Deployment

If you need to deploy manually:

```bash
cd admin-dashboard
vercel --prod
```

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (should be 18+)
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure variables start with `REACT_APP_`
- Redeploy after adding new variables
- Check variable names match exactly

### API Connection Issues
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on your backend
- Ensure backend is accessible from Vercel's servers

## Production Checklist

- [ ] Environment variables configured
- [ ] API URL points to production backend
- [ ] Build completes successfully
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics enabled (optional)

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

