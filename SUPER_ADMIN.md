# Super Admin Account

## 🔑 Super Admin Credentials

The super admin account has full access to the admin dashboard and all administrative features.

### Default Super Admin Account

- **Email**: `admin@eventa.com`
- **Password**: `admin123`
- **Role**: Super Admin (Full Access)

## 🚀 Quick Setup

### 1. Start the Backend

```bash
cd backend
npm run dev
```

The backend will automatically:
- Create the database tables
- Add the `is_admin` column to the users table
- Seed the super admin account if it doesn't exist

### 2. Login to Admin Dashboard

1. Navigate to the admin dashboard login page
2. Enter the super admin credentials:
   - Email: `admin@eventa.com`
   - Password: `admin123`
3. Click "Sign In"

## 🔐 Admin Features

The super admin account has access to:

- ✅ Full dashboard access
- ✅ All event management features
- ✅ Analytics and reporting
- ✅ User management (future)
- ✅ System settings (future)

## 📝 Creating Additional Admin Accounts

### Via Database (Direct)

```sql
-- Create a new super admin user
INSERT INTO users (name, email, password, is_organizer, is_admin)
VALUES (
  'Admin Name',
  'newadmin@eventa.com',
  '$2a$10$hashed_password_here', -- Use bcrypt to hash password
  true,
  true
);
```

### Via Backend API (Recommended)

You can create a script or use the registration endpoint with admin privileges:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@eventa.com",
    "password": "securepassword",
    "phone": "+233241234567",
    "is_organizer": true,
    "is_admin": true
  }'
```

**Note**: The registration endpoint may need to be updated to allow setting `is_admin` directly, or you may need to update it via database after registration.

## 🔒 Security Best Practices

1. **Change Default Password**: Immediately change the default password after first login
2. **Use Strong Passwords**: Use complex passwords with mixed case, numbers, and symbols
3. **Limit Admin Accounts**: Only create admin accounts for trusted users
4. **Regular Audits**: Periodically review admin accounts and remove unused ones
5. **Two-Factor Authentication**: Consider implementing 2FA for admin accounts (future feature)

## 🛠️ Troubleshooting

### Admin Account Not Working

1. **Check Database**: Verify the user exists and `is_admin` is set to `true`:
   ```sql
   SELECT email, is_organizer, is_admin FROM users WHERE email = 'admin@eventa.com';
   ```

2. **Re-seed Database**: If the account doesn't exist, restart the backend to trigger seeding:
   ```bash
   cd backend
   npm run dev
   ```

3. **Manual Creation**: Create the admin account manually:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'admin@eventa.com';
   ```

### Password Reset

To reset the super admin password:

```sql
-- Generate a new bcrypt hash for your password
-- Then update:
UPDATE users 
SET password = '$2a$10$your_new_hashed_password_here'
WHERE email = 'admin@eventa.com';
```

Or use a password reset script/endpoint if available.

## 📚 Related Documentation

- [Login Credentials](./LOGIN_CREDENTIALS.md) - General login information
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [README](./README.md) - General project documentation

