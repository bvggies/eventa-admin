# Eventa Admin Dashboard

React-based admin dashboard for managing events in the Eventa platform.

## 🚀 Quick Start

### Development

```bash
npm install
npm start
```

The app will run on http://localhost:3000

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📦 Deployment

### Deploy to Vercel

1. **Push to GitHub**: Push your code to a GitHub repository
2. **Connect to Vercel**: 
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
3. **Configure**:
   - Framework: Create React App (auto-detected)
   - Root Directory: Leave blank or `admin-dashboard` if monorepo
4. **Add Environment Variable**:
   - `REACT_APP_API_URL`: Your production backend URL
5. **Deploy**: Click "Deploy"

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for detailed instructions.

## 🔧 Configuration

### API URL

The dashboard connects to the backend API. Set the URL via:

- **Development**: `.env` file
- **Production**: Vercel Environment Variables

### Authentication

Users must login with credentials that exist in the backend database.

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── App.tsx         # Main app component
├── public/             # Static files
└── package.json        # Dependencies
```

## 🛠️ Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Framer Motion

## 📝 Features

- ✅ Event Management (Create, Read, Update, Delete)
- ✅ Dashboard with Statistics
- ✅ Analytics (Coming Soon)
- ✅ Responsive Design
- ✅ Dark Mode UI

## 🔐 Security

- JWT-based authentication
- Secure API communication
- Environment variable protection

## 🔑 Login Credentials

Default credentials (development only):
- **Email**: `organizer@eventa.com`
- **Password**: `password123`

See [LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md) for more details.

## 📚 Documentation

- [Quick Deploy Guide](./QUICK_DEPLOY.md)
- [Full Deployment Guide](./DEPLOYMENT.md)
- [Main Project README](../README.md)
