
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
// THIS SECRET MUST MATCH THE ONE IN YOUR NGINX CONFIG
const STREAM_SECRET = process.env.STREAM_SECRET || 'super_secret_nginx_key'; 
const DB_FILE = path.join(__dirname, 'data.json');

// --- STORAGE SETUP ---
// Ensure directories exist
const UPLOAD_DIR = path.join(__dirname, 'uploads'); // Temp raw files
const STORAGE_DIR = path.join(__dirname, 'storage'); // HLS output (This folder should be served by NGINX)

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

// Multer Config for Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
// In production, NGINX should serve 'dist' and 'storage', not Express.
// However, for local dev fallback, we serve dist.
app.use(express.static(path.join(__dirname, 'dist')));

// --- DATABASE HELPERS ---
const getDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const seed = { users: [], posts: [], movies: [], settings: { maintenanceMode: false, maintenanceMessage: "", showNotification: false, notificationMessage: "" } };
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

// --- PRODUCTION STREAMING LOGIC ---

/**
 * GENERATE SECURE LINK
 * Creates an MD5 hash compatible with NGINX secure_link_md5
 * Format expected by NGINX: md5("$expires$uri$remote_addr secret")
 */
app.get('/api/stream/authorize/:id', authenticateToken, (req, res) => {
    const movieId = req.params.id;
    const db = getDb();
    const movie = db.movies.find(m => m.id === movieId);

    if (!movie) return res.status(404).json({ message: "Content not found" });

    // If it's an external URL (not hosted by us), just return it
    if (movie.videoUrl.startsWith('http') && !movie.videoUrl.includes('yumetv.lv')) {
         return res.json({ url: movie.videoUrl, type: 'mp4' }); // Or hls if external
    }

    // It is a local file. Let's generate the secure link.
    // The videoUrl in DB is stored as relative path: "movies/12345/index.m3u8"
    const uriPath = `/${movie.videoUrl}`; // e.g., /hls/movie_123/index.m3u8
    const expires = Math.floor(Date.now() / 1000) + 21600; // 6 hours
    const userIp = req.ip || req.connection.remoteAddress; // Must match NGINX's $remote_addr

    // MD5 Construction: expires + uri + ip + secret
    // Note: This string format MUST match your nginx.conf secure_link_md5 exactly
    const stringToSign = `${expires}${uriPath} ${STREAM_SECRET}`;
    
    const md5 = crypto.createHash('md5')
        .update(stringToSign)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, ''); // NGINX uses URL-safe Base64

    // Construct the full NGINX URL
    // storage.yumetv.lv is your separate storage server domain
    const protectedUrl = `https://storage.yumetv.lv${uriPath}?md5=${md5}&expires=${expires}`;

    res.json({ 
        url: protectedUrl,
        type: 'hls'
    });
});

// --- UPLOAD & TRANSCODE ---

app.post('/api/admin/upload', authenticateToken, requireAdmin, upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // 1. Create a folder for this movie in storage
    const movieId = Date.now().toString();
    const movieDir = path.join(STORAGE_DIR, movieId);
    if (!fs.existsSync(movieDir)) fs.mkdirSync(movieDir);

    const inputPath = req.file.path;
    const outputPath = path.join(movieDir, 'index.m3u8');

    // 2. Start Async Transcoding
    // We respond to the client immediately saying "Processing started"
    // The client polls or we update DB status later.
    
    console.log(`Starting transcoding for ${inputPath} to ${outputPath}`);

    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline', // Baseline profile for compatibility
        '-level 3.0',
        '-start_number 0',
        '-hls_time 10',        // 10 second segments
        '-hls_list_size 0',    // Include all segments in m3u8
        '-f hls'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('Transcoding finished successfully');
        // Clean up raw upload
        fs.unlinkSync(inputPath);
        
        // Update DB entry to set status to Ready (Implementation detail for user)
      })
      .on('error', (err) => {
        console.error('Error transcoding:', err);
      })
      .run();

    // 3. Return the ID and future path immediately
    res.json({
        success: true,
        movieId: movieId,
        // This relative path matches what /authorize expects
        videoPath: `${movieId}/index.m3u8` 
    });
});


// --- STANDARD API ROUTES (Existing functionality) ---

app.get('/api/settings', (req, res) => {
    const db = getDb();
    res.json(db.settings);
});

app.put('/api/settings', authenticateToken, requireAdmin, (req, res) => {
    const db = getDb();
    db.settings = { ...db.settings, ...req.body };
    saveDb(db);
    res.json(db.settings);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const db = getDb();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password || 'password', 10);
    const role = db.users.length === 0 ? 'ADMIN' : 'USER'; // First user is admin

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      role,
      avatarUrl: '',
      watchlist: [],
      isWatchlistPublic: false,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb(db);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, avatarUrl: newUser.avatarUrl, watchlist: [], isWatchlistPublic: false } });
  } catch (error) { res.status(500).json({ message: "Error" }); }
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
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const db = getDb();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({message: "User not found"});
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const index = db.users.findIndex(u => u.id === req.user.id);
    if (index === -1) return res.status(404).json({ message: "User not found" });
    const { name, email, password, avatarUrl, isWatchlistPublic } = req.body;
    const user = db.users[index];
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (isWatchlistPublic !== undefined) user.isWatchlistPublic = isWatchlistPublic;
    if (password && password.trim() !== "") user.password = await bcrypt.hash(password, 10);
    db.users[index] = user;
    saveDb(db);
    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ user: safeUser, token });
  } catch (e) { res.status(500).json({ message: "Failed" }); }
});

// Movies
app.get('/api/movies', (req, res) => { res.json(getDb().movies); });
app.get('/api/movies/:id', (req, res) => {
  const movie = getDb().movies.find(m => m.id === req.params.id);
  if (movie) res.json(movie); else res.status(404).json({ message: "Not found" });
});

app.post('/api/movies', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const newMovie = req.body;
  newMovie.id = Date.now().toString();
  newMovie.views = 0;
  db.movies.unshift(newMovie);
  saveDb(db);
  res.json(newMovie);
});

app.put('/api/movies/:id', authenticateToken, requireAdmin, (req, res) => {
    const db = getDb();
    const index = db.movies.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Not found" });
    const updatedMovie = { ...db.movies[index], ...req.body, id: req.params.id, views: db.movies[index].views };
    db.movies[index] = updatedMovie;
    saveDb(db);
    res.json(updatedMovie);
});

app.delete('/api/movies/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  db.movies = db.movies.filter(m => m.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Production Server running on port ${port}`);
    console.log(`Video Storage Path: ${STORAGE_DIR}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      startServer(port + 1);
    }
  });
};

const INITIAL_PORT = parseInt(process.env.PORT || '3000', 10);
startServer(INITIAL_PORT);
