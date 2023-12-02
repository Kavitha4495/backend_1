const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

const PORT = 5000;

// Use the 'cors' middleware to enable CORS for all routes
app.use(cors());
app.use(express.json());

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// MongoDB setup using Mongoose
mongoose.connect('mongodb://localhost:27017/admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a Mongoose schema for your product data
const productSchema = new mongoose.Schema({
  productName: String,
  productImages: [String],// or empty array
  productDescription: String,
  specificInformation: String,
  mrp: Number,
  sp: Number,
});

const Product = mongoose.model('Product', productSchema);

app.post('/insert', upload.array('productImages'), async (req, res) => {
  const { productName, productDescription, specificInformation, mrp, sp } = req.body;
  const productImages = req.files.map(file => file.filename);

  try {
    const product = new Product({
      productName,
      productImages,
      productDescription,
      specificInformation,
      mrp: parseFloat(mrp),
      sp: parseFloat(sp),
    });

    await product.save();
    console.log('Product inserted:', product._id);

    res.status(201).json({ message: 'Product added successfully.' });
  } catch (error) {  
    console.error('Error inserting product:', error);
    res.status(500).json({ error: 'Failed to add product.' });
  }
});
// API endpoint to fetch product data from MongoDB
app.get('/products', async (req, res) => {
  try {
    const data = await Product.find();
    res.json(data);
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).json({ error: 'Failed to fetch product data.' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
