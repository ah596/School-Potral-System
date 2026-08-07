@echo off
echo ========================================
echo School Portal - Vercel Deployment Setup
echo ========================================
echo.

REM Configure Git (replace with your information)
echo Step 1: Configuring Git...
git config user.name "Your Name"
git config user.email "your.email@example.com"

echo.
echo Step 2: Committing files...
git commit -m "Initial commit - School Portal ready for Vercel deployment"

echo.
echo ========================================
echo Git repository initialized successfully!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Create a GitHub repository at https://github.com/new
echo 2. Run this command (replace with your repo URL):
echo    git remote add origin https://github.com/YOUR_USERNAME/school-portal.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Go to https://vercel.com and import your GitHub repository
echo.
echo 4. Deploy! Vercel will automatically detect your Vite project
echo.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
pause
