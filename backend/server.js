const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Database Connection
mongoose.connect('mongodb://localhost:27017/taskManager', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Database connection error:', err));

// Routes
app.use('/tasks', taskRoutes);

// Start Server 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
