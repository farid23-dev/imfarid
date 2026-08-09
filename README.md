# imfarid.com

Personal portfolio website for Farid Ismayilov - IT Specialist & Full-Stack Developer.

## Tech Stack

- **Frontend:** React 19, Vite 8, Framer Motion, React Router
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (frontend), Railway/Render (backend)

## Setup

### 1. Clone and Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `backend/supabase-schema.sql`
3. Create a **public** Storage bucket named `uploads` (Storage → New bucket)
4. Get your project URL and keys from Settings → API

### 3. Environment Variables

**Backend (.env):**
```
PORT=5000
SITE_URL=https://imfarid.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_UPLOADS_BUCKET=uploads
ADMIN_PASSWORD=your_secure_password
RESEND_API_KEY=your_resend_key
CONTACT_EMAIL=you@example.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
VITE_SITE_URL=https://imfarid.com
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
# Optional — omit until you create a Plausible site:
# VITE_PLAUSIBLE_DOMAIN=imfarid.com
```

Comments, likes, and image uploads use Supabase when configured, and fall back to local files/disk otherwise. Sitemap is available at `GET /sitemap.xml` (and `/api/sitemap.xml`) on the backend.
### 4. Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` to your backend URL
4. Deploy

### Backend (Railway/Render)

1. Push to GitHub
2. Create new service
3. Set environment variables
4. Deploy

## API Endpoints

- `GET /api/experiences` - List all experiences
- `GET /api/experiences/:id` - Get single experience
- `POST /api/experiences` - Create experience (admin)
- `PUT /api/experiences/:id` - Update experience (admin)
- `DELETE /api/experiences/:id` - Delete experience (admin)

## License

MIT
