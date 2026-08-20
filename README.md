# Aeroview 360

Aeroview 360 is a professional client dashboard for construction project management. It provides clients with isolated, secure access to view construction site progress updates via interactive 360° tour walkthroughs, flythrough videos, progress image galleries, and blueprints (elevations/aerial diagrams).

---

## 🎨 Design Specification
The application strictly follows the static professional monochrome theme:
- **Primary Accent Colors:** Dark slate blacks (`#1a1a1a`, `#2d2d2d`, `#404040`)
- **Light Surfaces:** Light grays and clean whites (`#f5f5f5`, `#ffffff`, `#fafafa`, `#e0e0e0`)
- **Font Face:** Inter (600 bold for headers, 400 normal for body)
- **Border Radius:** 12px rounded cards, 8px inputs and action buttons

---

## 📂 Project Architecture

```text
aeroview-360/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize (Neon DB) & Cloudinary
│   │   ├── models/          # Relational models (Client, User, Site, Updates, etc.)
│   │   ├── middleware/      # Auth (JWT roles checks) & Multer fallback uploads
│   │   ├── controllers/     # API Business logic
│   │   ├── routes/          # Express route bindings
│   │   └── server.js        # Express application entry
│   └── package.json
│
├── frontend/
│   ├── public/              # HTML layout & manifest
│   ├── src/
│   │   ├── components/      # Common components, cards, layouts (Sidebar, Header)
│   │   ├── pages/           # Module pages (Login, Profile, 360, Video, Image, Blueprints)
│   │   ├── context/         # AuthContext session hook
│   │   ├── services/        # Axios API handlers
│   │   ├── styles/          # Tailwind custom variables & theme rules
│   │   └── App.jsx          # Route paths mapping
│   └── package.json
```

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance (local or Neon DB)
- Cloudinary credentials (optional; falls back automatically to local folder upload if not provided)

---

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Setup environment variables:
   Copy or create the `.env` file containing database connections:
   ```env
   PORT=5001
   DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/aeroview
   JWT_SECRET=super_secret_aeroview_360_jwt_token_key_12345
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
3. Sync and Seed the Database with Sample Data:
   Run the seed script to compile default records and test credentials:
   ```bash
   npm run seed
   # (defined as: node src/scripts/seed.js)
   ```
4. Launch Backend Server in development mode:
   ```bash
   npm run dev
   ```

---

### Step 2: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Setup environment variables:
   Create a `.env` file:
   ```env
   PORT=3000
   REACT_APP_API_URL=http://localhost:5001/api
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

---

## 🔑 Demo Login Credentials
Run the seeding script to register these accounts automatically:

1. **Client Viewer Profile:**
   - **Email:** `client@aeroview.com`
   - **Password:** `client123`
   - **Role:** View-only client dashboard containing 360 tours, image category sliders, drone stream clips, and elevation blueprints.

2. **Admin Portal Manager:**
   - **Email:** `admin@aeroview.com`
   - **Password:** `admin123`
   - **Role:** Create new client organizations, insert construction sites, upload progress percentages, upload panoramas/videos/photo folders, and submit schematics.
