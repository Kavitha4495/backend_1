const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/labServicesDB';

mongoose.connect(mongoURI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
}) 
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const labServiceSchema = new mongoose.Schema({
    serviceId: Number,
    testName: String,
    testPrice: Number,
    serviceTax: Number,
    testCode: String,
    selectedVendor: String,
});

const LabService = mongoose.model('LabService', labServiceSchema);

// Create routes for CRUD operations

app.get('/api/lab-services', async (req, res) => {
    try {
        const labServices = await LabService.find();
        res.json(labServices);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching lab services' });
    }
}); 

app.post('/api/lab-services', async (req, res) => {
    const labServiceData = req.body;

    try {
        const newLabService = new LabService(labServiceData);
        await newLabService.save();
        res.status(201).json(newLabService);
    } catch (error) {
        res.status(400).json({ error: 'Error adding lab service' });
    }
});

app.put('/api/lab-services/:id', async (req, res) => {
    const labServiceId = req.params.id;
    const labServiceData = req.body;

    try {
        const updatedLabService = await LabService.findByIdAndUpdate(
            labServiceId,
            labServiceData,
            { new: true }
        );
        res.json(updatedLabService);
    } catch (error) {
        res.status(400).json({ error: 'Error updating lab service' });
    }
});

app.delete('/api/lab-services/:id', async (req, res) => {
    const labServiceId = req.params.id;

    try {
        await LabService.findByIdAndDelete(labServiceId);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ error: 'Error deleting lab service' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});