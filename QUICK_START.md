# Quick Start: Deploy to Vercel

## 🎯 Best Platform: **Vercel**

**Why Vercel?**
- ✅ Perfect Astro support
- ✅ All your features work (API routes, file uploads, Firebase Admin)
- ✅ Free tier covers your needs
- ✅ 5-minute setup

## 🚀 Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your repository
5. Click "Deploy"

### 3. Add Environment Variables

In Vercel project settings → Environment Variables, add:

**Firebase Client (Public):**
```
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
PUBLIC_FIREBASE_APP_ID=...
```

**Firebase Admin (Server-side):**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

**For FIREBASE_SERVICE_ACCOUNT_KEY:**
- Copy entire contents of `firebase/firebase-admin-key.json`
- Paste as a single line (remove all line breaks)
- Or use Vercel's secret variables feature

### 4. Redeploy

After adding environment variables, Vercel will automatically redeploy.

## ✅ That's It!

Your site is now live with:
- ✅ All pages working
- ✅ Admin panel functional
- ✅ Sermon management working
- ✅ File uploads working
- ✅ All CRUD operations working

## 📚 More Details

- Full deployment guide: `DEPLOYMENT_GUIDE.md`
- Platform comparison: `HOSTING_COMPARISON.md`

## 🆘 Troubleshooting

**Firebase Admin not working?**
- Check `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
- Verify JSON is valid (no line breaks)

**File uploads failing?**
- Ensure Firebase Storage is enabled in Firebase Console
- Check Storage bucket name matches environment variable

**API routes 404?**
- Verify `output: 'server'` in `astro.config.mjs`
- Check build logs in Vercel dashboard

**Build error: "NoAdapterInstalled"?**
- ✅ Already fixed! The `@astrojs/vercel` adapter is installed and configured
- If you see this error, make sure you've pulled the latest changes from GitHub

---

**Need help?** Check the detailed guides or Vercel documentation.

