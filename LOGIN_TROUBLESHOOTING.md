# Admin Dashboard Login Troubleshooting Guide

## Issue: Login Failed on Vercel

If you're getting "Login failed. Please check your credentials and try again" when trying to log in to the admin dashboard on Vercel, follow these steps:

## 1. Verify Environment Variables

### In Vercel Dashboard:
1. Go to your admin dashboard project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Verify `REACT_APP_API_URL` is set to: `https://eventa-backend-iota.vercel.app/api`
   - **Important**: Make sure it includes `/api` at the end
   - Make sure there are no trailing spaces
   - Make sure it's set for **Production**, **Preview**, and **Development** environments

### Verify in Browser Console:
1. Open your admin dashboard in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Type: `console.log(process.env.REACT_APP_API_URL)`
5. It should show: `https://eventa-backend-iota.vercel.app/api`

## 2. Check Backend API Health

Test if the backend is accessible:

```bash
curl https://eventa-backend-iota.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","message":"Eventa API is running"}
```

## 3. Test Login Endpoint Directly

Test the login endpoint:

```bash
curl -X POST https://eventa-backend-iota.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventa.com","password":"admin123"}'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "name": "Super Admin",
    "email": "admin@eventa.com",
    "isAdmin": true
  },
  "token": "..."
}
```

## 4. Verify Admin Account Exists

The admin account should be automatically seeded when the backend initializes. If login still fails:

### Option A: Check Database Directly
Connect to your Neon PostgreSQL database and verify:

```sql
SELECT email, is_admin, is_organizer FROM users WHERE email = 'admin@eventa.com';
```

Expected result:
- `email`: `admin@eventa.com`
- `is_admin`: `true`
- `is_organizer`: `true`

### Option B: Manually Seed Admin Account

If the admin account doesn't exist, you can create it manually:

1. Connect to your Neon PostgreSQL database
2. Run this SQL (replace the password hash with a bcrypt hash of 'admin123'):

```sql
-- Generate a bcrypt hash for 'admin123' first (use an online bcrypt generator)
-- Then insert:
INSERT INTO users (name, email, password, phone, is_organizer, is_admin)
VALUES (
  'Super Admin',
  'admin@eventa.com',
  '$2a$10$YourBcryptHashHere', -- Replace with actual bcrypt hash
  '+233241234500',
  true,
  true
)
ON CONFLICT (email) 
DO UPDATE SET 
  is_admin = true,
  is_organizer = true,
  password = EXCLUDED.password;
```

## 5. Check CORS Configuration

The backend should allow requests from your admin dashboard. The backend is configured to:
- Allow all `.vercel.app` subdomains
- Allow requests from `https://eventa-admin.vercel.app`

If you're using a different Vercel URL, you may need to:
1. Add your admin dashboard URL to `ALLOWED_ORIGINS` environment variable in the backend Vercel project
2. Or update the CORS configuration in `backend/src/index.ts`

## 6. Check Browser Console for Errors

1. Open your admin dashboard
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Try to log in
5. Look for any error messages

Common errors:
- **CORS Error**: "Access to XMLHttpRequest has been blocked by CORS policy"
  - Solution: Check CORS configuration (step 5)
- **Network Error**: "Network Error" or "ERR_NETWORK"
  - Solution: Check if backend URL is correct (step 1)
- **401 Unauthorized**: "Invalid credentials"
  - Solution: Verify admin account exists (step 4)

## 7. Verify Backend Environment Variables

In your backend Vercel project, verify these environment variables are set:

- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: A secret key for JWT tokens
- `NODE_ENV`: `production`
- `VERCEL`: `1`

## 8. Rebuild and Redeploy

After making changes:

1. **Backend**: Push changes to GitHub, Vercel will auto-deploy
2. **Admin Dashboard**: 
   - Update environment variables in Vercel if needed
   - Trigger a new deployment (Settings → Deployments → Redeploy)

## 9. Default Admin Credentials

- **Email**: `admin@eventa.com`
- **Password**: `admin123`

**⚠️ Security Note**: Change this password immediately after first login in production!

## 10. Still Not Working?

If none of the above works:

1. Check Vercel logs for both backend and admin dashboard:
   - Backend: Vercel Dashboard → Your Backend Project → Logs
   - Admin Dashboard: Vercel Dashboard → Your Admin Project → Logs

2. Verify the backend is actually deployed and running:
   - Visit: `https://eventa-backend-iota.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"Eventa API is running"}`

3. Check if the database connection is working:
   - Look for database connection errors in backend logs

4. Try logging in with a different browser or incognito mode to rule out browser cache issues

## Quick Checklist

- [ ] `REACT_APP_API_URL` is set correctly in Vercel (includes `/api`)
- [ ] Backend health check returns OK
- [ ] Login endpoint responds correctly
- [ ] Admin account exists in database
- [ ] CORS is configured correctly
- [ ] No errors in browser console
- [ ] Backend environment variables are set
- [ ] Both projects are deployed on Vercel

