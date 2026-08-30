# Deployment Guide: Render + Vercel

This project has:
- Backend: Node.js + Express + MongoDB Atlas
- Frontend: React + Vite

## 1) Prepare Git repository

From the project root:

```bash
git init
git status
git add .
git commit -m "Initial project setup"
```

If you do not have a repo yet, create one on GitHub and connect it:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

> Make sure [.gitignore](.gitignore) is present before committing, so secrets and dependencies are not pushed.

---

## 2) Backend deployment on Render

### Step A: Push code to GitHub
Make sure all changes are committed and pushed before deploying.

### Step B: Create backend service on Render
1. Go to https://render.com
2. Click New > Web Service
3. Connect your GitHub repo
4. Select the repository
5. Configure the service:
   - Name: `ccms-backend`
   - Runtime: Node
   - Root Directory: leave empty or set to project root if backend is in same repo
   - Build Command:
     ```bash
     npm install --prefix server
     ```
   - Start Command:
     ```bash
     npm start --prefix server
     ```

### Step C: Add environment variables in Render
Go to Environment > Add Environment Variable and add:

```env
PORT=10000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret
CLIENT_URL=https://your-frontend-domain.vercel.app
```

Important:
- `MONGO_URI` must be the MongoDB Atlas connection string
- `CLIENT_URL` should be your Vercel frontend URL
- `PORT` is set by Render automatically, but adding it is safe if needed

### Step D: Deploy
Click Create Web Service or Deploy.

After deployment, note the backend URL, for example:

```text
https://ccms-backend.onrender.com
```

---

## 3) Frontend deployment on Vercel

### Step A: Create Vercel project
1. Go to https://vercel.com
2. Import the GitHub repository
3. Set the project root to the repository root
4. Build settings:
   - Framework: Vite
   - Build Command:
     ```bash
     npm install --prefix client
     npm run build:client
     ```
   - Output Directory:
     ```bash
     client/dist
     ```

### Step B: Add environment variables
Go to Project Settings > Environment Variables and add:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

Example:

```env
VITE_API_URL=https://ccms-backend.onrender.com/api
```

### Step C: Deploy
Click Deploy.

After deployment, Vercel gives you a frontend URL like:

```text
https://ccms-frontend.vercel.app
```

---

## 4) Backend CORS and production config

The backend currently allows CORS using:

```js
origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173']
```

For production, set `CLIENT_URL` to your deployed Vercel app URL in Render.

---

## 5) Final check after deployment

### Test backend health
Visit:

```text
https://your-backend-url.onrender.com/api/health
```

You should get a JSON response like:

```json
{
  "status": "OK"
}
```

### Test frontend login flow
1. Open deployed Vercel URL
2. Register or login
3. Test admin login using default seeded admin credentials if database was seeded

Default admin credentials in the app seed file:

```text
Email: admin@college.com
Password: Admin@123
```

---

## 6) Useful Git commands

```bash
git status
git add .
git commit -m "Deploy config updates"
git push origin main
```

---

## 7) Recommended production setup

- Keep `.env` files only local
- Never push `.env` files to Git
- Use Render environment variables for backend secrets
- Use Vercel environment variables for frontend config
- Keep MongoDB Atlas whitelisted for Render and your local machine

---

## 8) Common issues

### Frontend cannot connect to backend
Check:
- `VITE_API_URL` is correct
- backend service is running
- CORS includes the frontend URL

### Backend cannot connect to MongoDB
Check:
- MongoDB Atlas cluster is active
- database user is correct
- IP access list includes Render IPs (or use `0.0.0.0/0` for testing if needed)
- `MONGO_URI` is correct

### Login fails after deployment
Check:
- `JWT_SECRET` is set properly
- database has seeded admin user or a valid user account

---

If you want, I can also create:
1. a production-ready `.env.example` for backend and frontend
2. a Render build config file
3. a Vercel config file
4. a quick GitHub push checklist for you
