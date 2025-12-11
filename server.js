const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data Paths
const ROOSTERS_FILE = path.join(__dirname, "data", "roosters.json");
// const INVENTORY_FILE = path.join(__dirname, 'data', 'inventory.json');

// Routes

// API: Get all roosters
app.get("/api/roosters", (req, res) => {
  fs.readFile(ROOSTERS_FILE, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read data" });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error(parseErr);
      res.status(500).json({ error: "Failed to parse data" });
    }
  });
});

// API: Contact Form Submission (Mock)
app.post("/api/contact", (req, res) => {
  const { name, email, message, roosterId } = req.body;
  console.log("Contact Form Received:", { name, email, message, roosterId });
  // Here we would normally email the admin or save to DB
  res.json({ success: true, message: "Message received!" });
});

// Fallback for SPA or simple static serve (optional if just static)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
