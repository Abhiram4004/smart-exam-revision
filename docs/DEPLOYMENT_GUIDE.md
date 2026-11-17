# 🚀 Complete Deployment Guide: Making SmartRevise Live

This guide explains how to deploy your **Smart Exam Revision** application live on the web with **zero hosting cost**:
1. **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Forever M0 Tier)
2. **Hosting**:
   - **Method A (Deploy directly on Vercel)**: Single Vercel project serving both the Vite React PWA and the Serverless Express API.
   - **Method B (All-in-One on Render)**: Single long-running container service on Render.
   - **Method C (Vercel Frontend + Render Backend API)**: Split frontend on Vercel CDN and API on Render.

---

## 🗄️ Step 1: Set Up Free Cloud Database (MongoDB Atlas)

Since your database is currently local (`127.0.0.1:27017`), your live web app needs a cloud-hosted MongoDB database so it can be reached 24/7 on the internet.

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** and sign up (or log in with Google/GitHub).
2. Click **Create Deployment** → choose the **M0 Free** cluster (512MB free forever).
3. **Database Access / Security**:
   - Create a database user (e.g., username `admin_smart` and a secure password). *Save these credentials!*
4. **Network Access / IP Whitelist**:
   - Go to **Network Access** → Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) → Click **Confirm** (required so cloud servers can connect).
5. **Get Connection String**:
   - Go to **Database** → Click **Connect** → Choose **Drivers (Node.js)**.
   - Copy the URI, which looks like:
     ```text
     mongodb+srv://admin_smart:<password>@cluster0.abcde.mongodb.net/smart-exam-revision?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## ▲ Method A: Deploy Directly on Vercel (1-Click Full-Stack)

With the configured root `vercel.json` and `api/index.js`, **Vercel hosts both the React Vite frontend and the Express backend API automatically!**

### 1. Import Project to Vercel
1. Go to **[vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. In your Vercel Dashboard, click **Add New...** → **Project**.
3. Locate and click **Import** next to your repository: **`Abhiram4004/smart-exam-revision`**.

### 2. Configure Settings & Environment Variables
1. **Project Name**: `smart-exam-revision` (or your choice)
2. **Framework Preset**: Keep as **Other** (Vercel reads our root `vercel.json` automatically).
3. **Root Directory**: `./` (leave default root).
4. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | *Paste your MongoDB Atlas URI from Step 1* |
   | `JWT_SECRET` | `smart-revision-prod-secret-2024` *(or any random secure string)* |
   | `JWT_EXPIRES_IN` | `7d` |
5. Click **Deploy**.

### 3. Vercel Builds & Deploys
- Vercel automatically builds the client bundle (`client/dist`) and configures the Express API as a high-speed Serverless Function (`api/index.js`).
- Once finished, Vercel gives you your live production domain:
  ```text
  https://smart-exam-revision.vercel.app
  ```

### 4. Seed Database Content
To populate your cloud database with the 60 flashcards, 60 MCQs, and default demo accounts:
From your local terminal, run the seed script pointing to your Atlas connection string:
```powershell
$env:MONGODB_URI="your-mongodb-atlas-connection-string"
cd "server"
node src/seed/seedData.js
```
*(All 4 course subjects, decks, flashcards, MCQs, and accounts will be uploaded to your cloud database in 5 seconds!)*

---

## ⚡ Method B: Deploy on Render (All-in-One Alternative)

If you prefer a persistent Node.js daemon service rather than serverless functions:
1. Go to **[render.com](https://render.com)** and click **New +** → **Web Service**.
2. Select your repository: `Abhiram4004/smart-exam-revision`.
3. Set:
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = *Your MongoDB Atlas URI*
   - `JWT_SECRET` = `smart-revision-prod-secret-2024`
5. Click **Deploy Web Service**.
6. Open the **Shell** tab on Render and run `npm run seed`.

---

## 🔑 Default Login Credentials

- **Faculty / Admin Account**:
  - Email: `admin@smartrevision.local`
  - Password: `Admin@123`
- **Student Account**:
  - Email: `student@smartrevision.local`
  - Password: `Student@123`
