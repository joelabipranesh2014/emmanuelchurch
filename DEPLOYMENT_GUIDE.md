# Deployment Guide - Vercel

This guide will help you deploy your EmmanEzk Church website to Vercel with all dynamic functionality working.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Firebase project set up
- ✅ Firebase service account key file

## Step 1: Prepare Your Code

1. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```
   The project already includes `@astrojs/vercel` adapter which is required for Vercel deployment.

2. **Ensure your code is pushed to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## Step 2: Set Up Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New Project"**
3. **Import your GitHub repository**
   - Select your repository from the list
   - Vercel will auto-detect it's an Astro project

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

### Firebase Client Configuration (Public)
These are safe to expose in the browser:

```
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id (optional)
```

### Firebase Admin Configuration (Server-side)
These are used by API routes:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
GOOGLE_APPLICATION_CREDENTIALS=/var/task/firebase/firebase-admin-key.json
```

### Service Account Key (Important!)

For Firebase Admin SDK to work on Vercel, you need to:

**Option A: Use Environment Variable (Recommended)**
1. Copy the contents of your `firebase/firebase-admin-key.json` file
2. In Vercel, add a new environment variable:
   - Name: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Value: Paste the entire JSON content (as a single line)
3. Update `src/lib/firebase-admin.ts` to read from this variable

**Option B: Use Vercel Secrets**
1. Go to Vercel project settings → Environment Variables
2. Add your service account JSON as a secret variable

## Step 4: Deploy

1. **Click "Deploy"** in Vercel
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be live at `your-project.vercel.app`

## Step 5: Test Your Deployment

After deployment, test these features:

- ✅ Home page loads
- ✅ Sermons page displays sermons
- ✅ Admin page loads
- ✅ Add sermon works
- ✅ Edit sermon works
- ✅ Delete sermon works
- ✅ Upload song PDF works
- ✅ Delete song PDF works

## Troubleshooting

### Issue: Firebase Admin SDK not working

**Solution:** Make sure you've set up the service account key correctly:
1. Check environment variables in Vercel dashboard
2. Verify `FIREBASE_PROJECT_ID` is set
3. Ensure service account key is properly formatted

### Issue: File uploads not working

**Solution:** 
1. Verify Firebase Storage is enabled in Firebase Console
2. Check Storage bucket name matches `FIREBASE_STORAGE_BUCKET`
3. Ensure Storage rules allow uploads

### Issue: API routes return 404

**Solution:**
1. Verify `output: 'server'` in `astro.config.mjs`
2. Check that API routes have `export const prerender = false`
3. Ensure Vercel detected Astro framework correctly

### Issue: Build fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (Vercel uses Node 18+ by default)

## Custom Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

## Continuous Deployment

Once set up, Vercel will automatically:
- ✅ Deploy on every push to main branch
- ✅ Create preview deployments for pull requests
- ✅ Rollback to previous versions if needed

## Monitoring

Vercel provides:
- ✅ Real-time logs
- ✅ Analytics
- ✅ Performance monitoring
- ✅ Error tracking

## Support

If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Astro documentation: https://docs.astro.build
3. Review build logs in Vercel dashboard

---

**Need help?** Check the `HOSTING_COMPARISON.md` file for platform alternatives.

