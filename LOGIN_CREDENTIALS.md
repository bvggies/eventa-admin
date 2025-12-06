# Admin Dashboard Login Credentials

## Default Login Credentials

After seeding the database, you can login with any of these accounts:

### 🔑 Super Admin Account (Full Access)
- **Email**: `admin@eventa.com`
- **Password**: `admin123`
- **Role**: Super Admin
- **Access**: Full administrative access to all features

### Primary Organizer Account
- **Email**: `organizer@eventa.com`
- **Password**: `password123`
- **Role**: Organizer

### Alternative Organizer Account
- **Email**: `sarah@example.com`
- **Password**: `password123`
- **Role**: Organizer

> **Note**: For detailed information about the super admin account, see [SUPER_ADMIN.md](./SUPER_ADMIN.md)

## Setup Instructions

### 1. Ensure Backend is Running
Make sure your backend server is running and accessible:
```bash
cd backend
npm run dev
```

The backend should be running on `http://localhost:5000` (or your configured port).

### 2. Seed the Database (if not already done)
The database will automatically seed on backend startup if no users exist. If you need to manually seed:

```bash
cd backend
npm run seed
```

### 3. Configure API URL

#### For Local Development:
Create a `.env` file in the `admin-dashboard` directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

#### For Production (Vercel):
Set the environment variable in Vercel:
- Key: `REACT_APP_API_URL`
- Value: Your production backend URL (e.g., `https://your-backend.vercel.app/api`)

### 4. Start the Admin Dashboard
```bash
cd admin-dashboard
npm install
npm start
```

The dashboard will open at `http://localhost:3000`

### 5. Login
1. Navigate to the login page (you'll be redirected automatically if not logged in)
2. Enter one of the credentials above
3. Click "Sign In"

## Creating New Admin Users

To create a new admin/organizer user, you can:

1. **Via Backend API** (if you have a registration endpoint):
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@example.com",
       "password": "yourpassword",
       "phone": "+233241234567",
       "is_organizer": true
     }'
   ```

2. **Directly in Database**:
   ```sql
   INSERT INTO users (name, email, password, phone, is_organizer)
   VALUES (
     'Admin Name',
     'admin@example.com',
     '$2a$10$hashedpassword', -- Use bcrypt to hash password
     '+233241234567',
     true
   );
   ```

## Troubleshooting

### "Login failed" Error
- Check that the backend is running
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure the user exists in the database with `is_organizer: true`

### "Network Error"
- Backend might not be running
- API URL might be incorrect
- Check CORS settings on backend

### Token Not Saving
- Check browser localStorage is enabled
- Clear browser cache and try again

## Security Notes

⚠️ **Important**: These are default credentials for development only!

For production:
1. Change all default passwords
2. Use strong, unique passwords
3. Implement proper authentication (JWT refresh tokens)
4. Add role-based access control (RBAC)
5. Enable 2FA for admin accounts
6. Regularly audit admin access

