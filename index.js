const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is alive 🔥");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from GitHub Render API 👋" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
