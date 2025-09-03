# Tea Stall App Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Clerk account for authentication

## Setup Instructions

### 1. Environment Variables
Update `.env.local` with your actual values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

MONGODB_URI=mongodb://localhost:27017/tea-stall
WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Clerk Configuration
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable phone number authentication:
   - Go to User & Authentication > Email, Phone, Username
   - Enable "Phone number" as an identifier
   - Disable email if you want phone-only auth
4. Set up webhook:
   - Go to Webhooks
   - Add endpoint: `http://localhost:3000/api/webhooks`
   - Subscribe to `user.created` event
   - Copy the webhook secret

### 3. MongoDB Setup
- Local: Install MongoDB and start the service
- Cloud: Use MongoDB Atlas and get connection string

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```

## Features Implemented

### Authentication
- Phone number-based authentication via Clerk
- Role-based access control (admin/user)
- Protected routes with middleware

### Role-Based Routing
- **Admin users**: See "Admin Dashboard" button
- **Regular users**: See "My Space" button
- Automatic redirection based on role

### Pages Created
- `/` - Home page with role-based content
- `/sign-in` - Phone authentication
- `/sign-up` - User registration
- `/admin` - Admin dashboard (admin only)
- `/my-space` - User dashboard (users only)

### Database Integration
- MongoDB connection setup
- User model with role management
- Webhook integration for user creation

## Default User Roles
- New users are assigned "user" role by default
- To make someone admin, update their role in MongoDB:
```javascript
db.users.updateOne(
  { clerkId: "user_clerk_id" },
  { $set: { role: "admin" } }
)
```

## Next Steps
- Build admin dashboard functionality
- Build my-space dashboard features
- Add tea stall specific features (orders, inventory, etc.)