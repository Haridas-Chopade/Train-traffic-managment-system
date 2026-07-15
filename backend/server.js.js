const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');

dotenv.config();

connectDB();

const trainRoutes = require('./routes/trainRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/trains', trainRoutes);

app.get('/', (req, res) => {
  res.send('Train Traffic Backend Running');
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});