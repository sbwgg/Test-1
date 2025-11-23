
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
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// --- DATABASE HELPERS ---
const getDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const seed = {
      users: [],
      posts: [],
      movies: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  // Migration checks
  if (!db.posts) db.posts = [];
  return db;
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
    const role = db.users.length === 0 ? 'ADMIN' : 'USER';

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
    // Return sanitized user
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const db = getDb();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({message: "User not found"});
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
});

// Update Profile (Self)
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
    
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    db.users[index] = user;
    saveDb(db);

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    
    res.json({ user: safeUser, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Public Profile Fetch
app.get('/api/users/profile/:id', (req, res) => {
    const db = getDb();
    const user = db.users.find(u => u.id === req.params.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Identify requestor (optional, but needed to show private watchlist if it's 'me')
    const authHeader = req.headers['authorization'];
    let requestorId = null;
    if (authHeader) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            requestorId = decoded.id;
        } catch(e) {}
    }

    const isOwnProfile = requestorId === user.id;
    const showWatchlist = user.isWatchlistPublic || isOwnProfile;

    const userPosts = db.posts ? db.posts.filter(p => p.userId === user.id) : [];

    const profileData = {
        id: user.id,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        isWatchlistPublic: user.isWatchlistPublic,
        watchlist: showWatchlist ? user.watchlist || [] : [],
        stats: {
            postsCount: userPosts.length,
            commentsCount: 0 // Simplification
        },
        activity: userPosts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    };

    res.json(profileData);
});

// Watchlist Toggle
app.put('/api/user/watchlist/:movieId', authenticateToken, (req, res) => {
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) return res.sendStatus(404);

    const user = db.users[userIndex];
    if (!user.watchlist) user.watchlist = [];

    const movieId = req.params.movieId;
    if (user.watchlist.includes(movieId)) {
        user.watchlist = user.watchlist.filter(id => id !== movieId);
    } else {
        user.watchlist.push(movieId);
    }

    db.users[userIndex] = user;
    saveDb(db);
    res.json(user.watchlist);
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
  newMovie.id = Date.now().toString();
  newMovie.views = 0;
  db.movies.unshift(newMovie);
  saveDb(db);
  res.json(newMovie);
});

app.put('/api/movies/:id', authenticateToken, requireAdmin, (req, res) => {
    const db = getDb();
    const index = db.movies.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Movie not found" });
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

// 3. User Mgmt
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
    const db = getDb();
    const safeUsers = db.users.map(({ password, ...user }) => user);
    res.json(safeUsers);
});

app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const index = db.users.findIndex(u => u.id === req.params.id);
        if (index === -1) return res.status(404).json({ message: "User not found" });
        const { name, email, role, avatarUrl, password } = req.body;
        db.users[index].name = name || db.users[index].name;
        db.users[index].email = email || db.users[index].email;
        db.users[index].role = role || db.users[index].role;
        db.users[index].avatarUrl = avatarUrl !== undefined ? avatarUrl : db.users[index].avatarUrl;
        if (password && password.trim() !== "") {
            db.users[index].password = await bcrypt.hash(password, 10);
        }
        saveDb(db);
        const { password: _, ...safeUser } = db.users[index];
        res.json(safeUser);
    } catch (e) {
        res.status(500).json({ message: "Failed to update user" });
    }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const db = getDb();
    if (req.params.id === req.user.id) return res.status(400).json({ message: "Cannot delete your own admin account" });
    db.users = db.users.filter(u => u.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
});

// 4. Community Posts & Comments

app.get('/api/posts', (req, res) => {
    const db = getDb();
    const posts = db.posts || [];
    posts.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.isPinned ? -1 : 1;
    });
    res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
    const db = getDb();
    const post = db.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
});

app.post('/api/posts', authenticateToken, (req, res) => {
    const db = getDb();
    const { title, content, category } = req.body;
    const user = db.users.find(u => u.id === req.user.id);

    const newPost = {
        id: Date.now().toString(),
        userId: req.user.id,
        authorName: user ? user.name : 'Unknown',
        authorAvatar: user ? user.avatarUrl : '',
        authorRole: user ? user.role : 'USER',
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
        isPinned: false,
        likes: [],
        dislikes: [],
        comments: []
    };

    if (!db.posts) db.posts = [];
    db.posts.push(newPost);
    saveDb(db);
    res.json(newPost);
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    const db = getDb();
    const index = db.posts.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Post not found" });
    const post = db.posts[index];
    if (req.user.role !== 'ADMIN' && post.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    db.posts.splice(index, 1);
    saveDb(db);
    res.json({ success: true });
});

app.put('/api/posts/:id/pin', authenticateToken, requireAdmin, (req, res) => {
    const db = getDb();
    const index = db.posts.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Post not found" });
    db.posts[index].isPinned = !db.posts[index].isPinned;
    saveDb(db);
    res.json(db.posts[index]);
});

// Voting Logic
app.post('/api/vote', authenticateToken, (req, res) => {
    const { targetId, targetType, voteType } = req.body; // targetType: 'post' | 'comment', voteType: 'like' | 'dislike'
    const db = getDb();
    const userId = req.user.id;
    
    // Helper to process vote on an object (post or comment)
    const processVote = (obj) => {
        if (!obj.likes) obj.likes = [];
        if (!obj.dislikes) obj.dislikes = [];

        // Remove existing votes
        obj.likes = obj.likes.filter(id => id !== userId);
        obj.dislikes = obj.dislikes.filter(id => id !== userId);

        if (voteType === 'like') obj.likes.push(userId);
        if (voteType === 'dislike') obj.dislikes.push(userId);
    };

    if (targetType === 'post') {
        const post = db.posts.find(p => p.id === targetId);
        if (post) {
            processVote(post);
            saveDb(db);
            return res.json(post);
        }
    } else if (targetType === 'comment') {
        // Find comment recursively
        const findComment = (comments) => {
            for (let c of comments) {
                if (c.id === targetId) return c;
                if (c.replies) {
                    const found = findComment(c.replies);
                    if (found) return found;
                }
            }
            return null;
        };

        // We need to iterate all posts to find the comment (or pass postId)
        // For simplicity, let's assume postId is passed or we search all
        for (let post of db.posts) {
             const comment = findComment(post.comments || []);
             if (comment) {
                 processVote(comment);
                 saveDb(db);
                 // Return the post to update whole view, or just comment
                 return res.json(post); 
             }
        }
    }
    
    res.status(404).json({ message: "Target not found" });
});

// Commenting Logic
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const db = getDb();
    const postIndex = db.posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) return res.status(404).json({ message: "Post not found" });

    const { content, parentCommentId } = req.body;
    const user = db.users.find(u => u.id === req.user.id);

    const newComment = {
        id: Date.now().toString(),
        postId: req.params.id,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
        likes: [],
        dislikes: [],
        replies: []
    };

    if (!parentCommentId) {
        // Top level comment
        if (!db.posts[postIndex].comments) db.posts[postIndex].comments = [];
        db.posts[postIndex].comments.push(newComment);
    } else {
        // Nested reply
        const findAndReply = (comments) => {
            for (let c of comments) {
                if (c.id === parentCommentId) {
                    if (!c.replies) c.replies = [];
                    c.replies.push(newComment);
                    return true;
                }
                if (c.replies && findAndReply(c.replies)) return true;
            }
            return false;
        };
        findAndReply(db.posts[postIndex].comments || []);
    }

    saveDb(db);
    res.json(db.posts[postIndex]);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is busy. Trying port ${port + 1}...`);
      startServer(port + 1);
    }
  });
};

const INITIAL_PORT = parseInt(process.env.PORT || '3000', 10);
startServer(INITIAL_PORT);
