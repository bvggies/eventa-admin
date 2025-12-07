# Vercel Environment Variables Setup

## Important: API URL Configuration

The admin dashboard on Vercel requires the `REACT_APP_API_URL` environment variable to be set correctly.

### Steps to Fix Login Issue on Vercel:

1. **Go to your Vercel Dashboard**
   - Navigate to your project
   - Click on "Settings" → "Environment Variables"

2. **Add/Update the Environment Variable:**
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your production backend API URL (e.g., `https://your-backend.vercel.app/api` or `https://api.yourdomain.com/api`)
   - **Environment**: Select "Production", "Preview", and "Development" (or all)

3. **Redeploy:**
   - After adding the environment variable, you need to redeploy your application
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Select "Redeploy"

### Verify the Configuration:

1. Check that `REACT_APP_API_URL` is set in Vercel environment variables
2. Make sure the backend API is accessible at the URL you specified
3. Ensure CORS is configured on your backend to allow requests from your Vercel domain

### Common Issues:

- **"Network Error"**: Backend API URL is incorrect or backend is not running
- **"CORS Error"**: Backend needs to allow your Vercel domain in CORS settings
- **"401 Unauthorized"**: Backend is running but authentication is failing

### Testing:

After redeploying, test the login functionality. The admin dashboard should now connect to your production backend API instead of localhost.

