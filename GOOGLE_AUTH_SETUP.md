# Tea Stall App - Google Authentication Setup

## Quick Setup (5 minutes)

### 1. Enable Google OAuth in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your project
3. Navigate to **User & Authentication** → **Social Connections**
4. Click **Add connection** → **Google**
5. Toggle **Enable for sign-up and sign-in**
6. Save changes

### 2. Test Authentication
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Click **Continue with Google**
4. Sign in with any Google account
5. You're logged in!

## Features
- ✅ **One-click Google sign-in**
- ✅ **Works globally** (including India)
- ✅ **Automatic user creation**
- ✅ **Role-based access** (admin/user)
- ✅ **Secure OAuth 2.0**
- ✅ **No setup required** (Clerk handles everything)

## User Roles
- **Default**: All new users get 'user' role
- **Admin**: Manually set in MongoDB:
  ```javascript
  db.users.updateOne(
    { email: "admin@example.com" },
    { $set: { role: "admin" } }
  )
  ```

## App Structure
- **Home**: Public landing page
- **Admin Dashboard**: `/admin` (admin role only)
- **My Space**: `/my-space` (user role only)
- **Auto-redirect**: Based on user role

That's it! Your Tea Stall app now has professional Google authentication. 🚀