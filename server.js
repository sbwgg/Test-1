import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
const DB_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// --- DATABASE HELPERS ---
const getDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const seed = {
      users: [],
      movies: [
        {
          id: '1',
          title: 'Cosmic Frontiers',
          description: 'In the year 2150, humanity stands on the brink of interstellar expansion. A lone pilot discovers a wormhole that leads to a galaxy governed by ancient machines.',
          thumbnailUrl: 'https://picsum.photos/seed/space1/300/450',
          coverUrl: 'https://picsum.photos/seed/space1/1920/800',
          videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          genre: ['Sci-Fi', 'Adventure'],
          year: 2024,
          duration: '2h 14m',
          rating: 'PG-13',
          isFeatured: true,
          views: 1200
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const saveDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') return res.sendStatus(403);
  next();
};

// --- API ROUTES ---

// 1. Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const db = getDb();

    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password || 'password', 10);
    
    // First user is always ADMIN, others are USER
    const role = db.users.length === 0 ? 'ADMIN' : 'USER';

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      role
    };

    db.users.push(newUser);
    saveDb(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.users.find(u => u.email === email);

    if (!user) return res.status(400).json({ message: "User not found" });

    const validPass = await bcrypt.compare(password || 'password', user.password);
    if (!validPass) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// 2. Movies
app.get('/api/movies', (req, res) => {
  const db = getDb();
  res.json(db.movies);
});

app.get('/api/movies/:id', (req, res) => {
  const db = getDb();
  const movie = db.movies.find(m => m.id === req.params.id);
  if (movie) res.json(movie);
  else res.status(404).json({ message: "Movie not found" });
});

app.post('/api/movies', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const newMovie = req.body;
  
  // Ensure ID is unique
  newMovie.id = Date.now().toString();
  newMovie.views = 0;
  
  db.movies.unshift(newMovie);
  saveDb(db);
  res.json(newMovie);
});

app.delete('/api/movies/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  db.movies = db.movies.filter(m => m.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Handle SPA routing - Send all unhandled requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- SERVER STARTUP WITH PORT RETRY ---
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is busy. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

const INITIAL_PORT = parseInt(process.env.PORT || '3000', 10);
startServer(INITIAL_PORT);
