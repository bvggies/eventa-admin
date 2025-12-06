# Quick Deploy Guide - Admin Dashboard to Vercel

## 🚀 Fastest Way to Deploy

### Step 1: Push to GitHub

```bash
cd admin-dashboard
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: Leave blank (or `admin-dashboard` if monorepo)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `build` (auto-filled)

6. **Add Environment Variable**:
   - Key: `REACT_APP_API_URL`
   - Value: Your backend API URL (e.g., `https://your-api.com/api`)

7. Click **"Deploy"**

That's it! Your admin dashboard will be live in ~2 minutes.

## 🔄 Automatic Deployments

Once connected, Vercel automatically:
- ✅ Deploys on every push to `main`
- ✅ Creates preview URLs for pull requests
- ✅ Handles SSL certificates
- ✅ Provides CDN distribution

## 📝 Environment Variables

Set these in Vercel Dashboard > Project Settings > Environment Variables:

- `REACT_APP_API_URL` - Your production backend URL

**Important**: After adding/changing environment variables, redeploy the project.

## 🌐 Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## ✅ Verify Deployment

After deployment, check:
- [ ] Site loads without errors
- [ ] Login page appears
- [ ] API connection works (check browser console)
- [ ] All routes work (try navigating)

## 🐛 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (18+)

**API not connecting?**
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is accessible publicly

**404 on refresh?**
- The `_redirects` file should handle this
- If not, Vercel's rewrites in `vercel.json` will

## 📚 More Info

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

