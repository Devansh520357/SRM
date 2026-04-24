require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bfhlRoutes = require('./routes/bfhl');

const app = express();
const PORT = process.env.PORT || 5000;

const cors = require('cors');


app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Working");
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use("/bfhl", bfhlRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});