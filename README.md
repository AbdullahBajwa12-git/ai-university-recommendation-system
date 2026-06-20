# 🎓 EduHelper — AI-Powered University Advisor

EduHelper is a full-stack AI-powered web application that recommends universities to students based on their academic profile using OpenAI's GPT-4o model.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **Database** | MongoDB (via Docker) |
| **AI** | OpenAI GPT-4o (direct HTTP API) |
| **ODM** | Beanie (MongoDB async ODM) |
| **Auth** | JWT (JSON Web Tokens) |
| **Containerisation** | Docker & Docker Compose |

---

## ✅ Prerequisites — Install These First

### 1. Docker & Docker Compose
Docker is the **only** tool you need to install. It will handle Python, Node.js, MongoDB — everything.

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to the docker group (so you don't need sudo every time)
sudo usermod -aG docker $USER

# Log out and back in for the group change to take effect
```

**Verify installation:**
```bash
docker --version          # Should show Docker version
docker-compose --version  # Should show docker-compose version
```

### 2. Git
```bash
sudo apt install -y git
git --version
```

### 3. OpenAI API Key
- Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Create a new secret key
- Copy it — you will need it in the `.env` file

---

## 🚀 Setup & Run — Step by Step

### Step 1: Clone the Repository
```bash
git clone https://github.com/bilalqaisar1/edu-helper.git
cd edu-helper
```

### Step 2: Create Your Environment File
```bash
# Copy the template
cp .env.example .env

# Open and edit it
nano .env
```

Fill in your values:
```env
MONGODB_URL=mongodb://db:27017
DATABASE_NAME=ai_university_advisor
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
JWT_SECRET_KEY=any_random_long_string_here
VITE_API_URL=http://localhost:8000/api/v1
```

> ⚠️ **Important:** Never share or commit your `.env` file. It is already in `.gitignore`.

### Step 3: Stop Local MongoDB (if running)
If you have MongoDB installed locally, it will conflict with Docker on port 27017. Stop it first:
```bash
sudo systemctl stop mongod
sudo systemctl disable mongod
```

### Step 4: Build and Run with Docker
```bash
# Build all containers and start the project
docker-compose up --build
```

Wait for this message in the terminal:
```
backend_fyp | INFO: Application startup complete.
```

### Step 5: Open the App
| Service | URL |
|---|---|
| **Frontend (App)** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |

---

## 🔄 Daily Usage Commands

```bash
# Start the project (after first build)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Stop the project
docker-compose down

# Rebuild after code changes
docker-compose down
docker-compose build --no-cache
docker-compose up

# View backend logs
docker-compose logs -f backend

# View all logs
docker-compose logs -f
```

---

## 📁 Project Structure

```
edu-helper/
├── backend/                # FastAPI Python backend
│   ├── main.py             # API routes & OpenAI integration
│   ├── models.py           # MongoDB document models (Beanie)
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT authentication
│   ├── database.py         # MongoDB connection
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable UI components
│   │   └── hooks/          # Custom React hooks
│   └── Dockerfile
├── docker-compose.yml      # Orchestrates all services
├── .env.example            # Template for environment variables
└── README.md
```

---

## 🌟 Key Features

- **AI University Recommendations** — GPT-4o analyzes your profile and recommends 10+ universities (Safe, Target, and Reach)
- **6-Step Wizard** — Guided form collecting academic, financial, and preference data
- **Save & Compare** — Bookmark universities and compare side-by-side
- **Export** — Download recommendations as PDF or CSV
- **Search History** — View previous recommendation sessions
- **JWT Auth** — Secure registration and login

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| `address already in use: 27017` | Run `sudo systemctl stop mongod` |
| `401 Incorrect API key` | Check your `OPENAI_API_KEY` in `.env` |
| Frontend shows blank page | Run `docker-compose logs frontend` to check for build errors |
| Backend 422 error | Clear the form and try again — some fields may have invalid types |
| Changes not reflected | Run `docker-compose down && docker-compose build --no-cache && docker-compose up` |

---

## 📄 License

MIT License — feel free to use and modify.
