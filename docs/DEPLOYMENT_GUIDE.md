# 🚀 Complete Deployment Guide: Making SmartRevise Live

This guide explains how to deploy your **Smart Exam Revision** application live on the web with **zero hosting cost** using modern cloud platforms:
1. **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Forever M0 Tier)
2. **Hosting**:
   - **Method A (Easiest - All-in-One)**: [Render](https://render.com) (Single Web Service hosting both Frontend & Backend)
   - **Method B (Recommended Best Practice)**: [Vercel](https://vercel.com) for Frontend (Fast Global CDN) + [Render](https://render.com) for Backend API

---

## 🗄️ Step 1: Set Up Free Cloud Database (MongoDB Atlas)

Since your current database is running locally on your laptop (`127.0.0.1:27017`), your live web app needs a cloud-hosted MongoDB database so it can be reached 24/7.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account (or log in with Google/GitHub).
2. Click **Create Deployment** → choose the **M0 Free** cluster (512MB free forever).
3. **Database Access / Security**:
   - Create a database user (e.g., username `admin_smart` and a secure password). *Save these credentials!*
4. **Network Access / IP Whitelist**:
   - Go to **Network Access** → Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) → Click **Confirm** (required so Render/Vercel can connect).
5. **Get Connection String**:
   - Go to **Database** → Click **Connect** → Choose **Drivers (Node.js)**.
   - Copy the URI, which looks like:
     ```text
     mongodb+srv://admin_smart:<password>@cluster0.abcde.mongodb.net/smart-exam-revision?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## ⚡ Method A: Deploy Everything on Render (Simplest - 1 Service)

Render can build the React frontend and run the Node.js Express server inside a single free web service.

### 1. Create a Free Account on Render
1. Visit [render.com](https://render.com) and sign up with your GitHub account.

### 2. Create Web Service
1. In your Render Dashboard, click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Choose your repository: `Abhiram4004/smart-exam-revision`.
4. Configure the settings:
   - **Name**: `smart-exam-revision` (or your choice)
   - **Region**: Choose the closest region (e.g., Singapore / Frankfurt / Oregon)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run render-build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`

### 3. Add Environment Variables
Under the **Environment Variables** section, add:
| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *Your MongoDB Atlas connection URI from Step 1* |
| `JWT_SECRET` | `smart-revision-prod-secret-key-2024` *(or any random secure string)* |
| `JWT_EXPIRES_IN` | `7d` |

### 4. Deploy & Seed Database
1. Click **Deploy Web Service**. Render will install dependencies, build Vite, and start Express.
2. Once deployed, Render gives you a live HTTPS URL (e.g. `https://smart-exam-revision.onrender.com`).
3. **Populate initial course data (60 flashcards + 60 MCQs)**:
   - In Render, click the **Shell** tab on your service dashboard and type:
     ```bash
     npm run seed
     ```
   - Press Enter. Your cloud database will be populated with subjects, decks, cards, and default accounts.

🎉 **Your app is now fully live on the internet!**

---

## 🌐 Method B: Frontend on Vercel + Backend on Render (High Performance)

This is the standard production architecture: Vercel serves the React PWA via global Edge CDN, and Render runs the Express API.

### 1. Deploy Backend on Render
1. In Render, click **New +** → **Web Service**.
2. Select your repository `Abhiram4004/smart-exam-revision`.
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: *Your Atlas URI from Step 1*
     - `JWT_SECRET`: `your-secure-jwt-secret`
     - `CLIENT_URL`: `https://your-vercel-app.vercel.app` *(update after step 2)*
4. Click **Deploy Web Service** and copy your backend URL (e.g., `https://smart-revision-api.onrender.com`).
5. Run seed in Shell tab: `node src/seed/seedData.js`.

### 2. Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project** → Import `Abhiram4004/smart-exam-revision`.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit → select `client`
4. Expand **Environment Variables**:
   - Name: `VITE_API_URL`
   - Value: `https://smart-revision-api.onrender.com/api` *(Your Render backend URL + `/api`)*
5. Click **Deploy**.
6. Vercel automatically compiles the PWA, configures SPAs via `vercel.json`, and gives you a custom domain (e.g. `https://smart-exam-revision.vercel.app`).

---

## 🔑 Default Live Login Accounts (Post-Seed)

- **Student Account**:
  - Email: `student@smartrevision.local`
  - Password: `Student@123`
- **Faculty / Admin Account**:
  - Email: `admin@smartrevision.local`
  - Password: `Admin@123`
