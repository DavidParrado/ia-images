const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize the app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Allow large image data in requests
// static resources
app.use(express.static('public'));

// Send index.html file to the client
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// MongoDB Connection
const MONGO_URI = "mongodb+srv://juandparrado04:U7duWYi2zQSdenP9@cluster0.thg9a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Update with your MongoDB URI
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a Mongoose schema and model for storing predictions
const PredictionSchema = new mongoose.Schema({
  label: String,
  confidence: Number,
  image: String, // Base64-encoded image data
  timestamp: { type: Date, default: Date.now },
});

const Prediction = mongoose.model("Prediction", PredictionSchema);

// Route to handle saving predictions
app.post("/predict", async (req, res) => {
  const { label, confidence, image } = req.body;

  if (!label || !confidence || !image) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const prediction = new Prediction({ label, confidence, image });
    await prediction.save();
    res.status(201).json({ message: "Prediction saved successfully!" });
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ error: "Failed to save prediction" });
  }
});

// Route to fetch all predictions
app.get("/predictions", async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ timestamp: -1 });
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
