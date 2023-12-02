const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// User model
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

const app = express();
app.use(cors());
app.use(express.json());

// User routes
app.post('/users', async (req, res) => {
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      // If the email is already present, send an alert and return an error response
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // If the email is not present, create the new user
    const user = await User.create(req.body);
    res.status(201).json(user); // Use status 201 for resource creation
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch all users route
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch  (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email' });
  }

  if (password !== user.password) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  res.json({ success: true });
});

app.listen(5005, () => {
  console.log('Server is listening on port 5005');
});