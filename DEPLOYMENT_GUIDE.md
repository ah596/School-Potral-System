# School Portal - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
1. **GitHub Account** - You need a GitHub account to deploy on Vercel
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **Git** - Make sure Git is installed on your computer

---

## Step 1: Initialize Git Repository

Open your terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit - School Portal"
```

---

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `school-portal` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/school-portal.git`)

---

## Step 3: Push to GitHub

In your terminal, run:

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

Replace `YOUR_GITHUB_REPO_URL` with your actual GitHub repository URL.

---

## Step 4: Deploy on Vercel

### Option A: Using Vercel Website (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"** (use your GitHub account)
3. Click **"Add New Project"**
4. Import your `school-portal` repository from GitHub
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts and select your project settings.

---

## ⚠️ IMPORTANT: Database Considerations

### SQLite Limitation on Vercel

**Vercel's serverless functions are stateless**, which means:
- SQLite database changes **won't persist** between requests
- The `school.db` file will reset after each deployment
- **This setup works for DEMO purposes only**

### Recommended Solutions for Production

For a production-ready application, you need to migrate to a cloud database:

#### Option 1: **Vercel Postgres** (Recommended)
- Free tier available
- Fully managed by Vercel
- Easy integration

**Setup:**
```bash
# Install Vercel Postgres
npm install @vercel/postgres
```

Then update your `backend/database.js` to use Postgres instead of SQLite.

#### Option 2: **Supabase** (Free PostgreSQL)
- Free tier: 500MB database
- Includes authentication
- Real-time features

**Setup:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database connection string
4. Update your backend to use PostgreSQL

#### Option 3: **PlanetScale** (MySQL)
- Free tier available
- Serverless MySQL
- Good performance

#### Option 4: **MongoDB Atlas**
- Free tier: 512MB storage
- NoSQL database
- Easy to use

---

## 🔧 Environment Variables

If you add a production database, you'll need to set environment variables:

1. In your Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add your database credentials:
   - `DATABASE_URL` - Your database connection string
   - Any other API keys or secrets

---

## 📝 Post-Deployment Checklist

After deployment:

- [ ] Test the login functionality
- [ ] Verify all pages load correctly
- [ ] Check API endpoints are working
- [ ] Test student/teacher/admin features
- [ ] Verify mobile responsiveness

---

## 🌐 Accessing Your Live Site

Once deployed, Vercel will give you:
- **Production URL**: `https://your-project-name.vercel.app`
- **Custom Domain** (optional): You can add your own domain in Vercel settings

---

## 🔄 Updating Your Site

To update your live site:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push
```

Vercel will **automatically redeploy** when you push to GitHub!

---

## 🆘 Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify build command is correct

### API Not Working
- Check that `/api/*` routes are properly configured
- Verify CORS settings in `backend/server.js`
- Check environment variables are set

### Database Issues
- Remember: SQLite won't work in production on Vercel
- Migrate to a cloud database (see above)

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Review the [Vercel Documentation](https://vercel.com/docs)
3. Check your browser console for errors

---

## 🎉 Success!

Your school portal is now live and accessible to anyone with the URL!

**Share your link**: `https://your-project-name.vercel.app`
