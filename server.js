const express = require('express');
const dotenv = require('dotenv');
const { connectToMongoDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

dotenv.config();
connectToMongoDB();

const app = express();
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);

app.get('/', (req, res) => {
  res.status(200).json({"message": "Welcome to the Blogging API"});
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;