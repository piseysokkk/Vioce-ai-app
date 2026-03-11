const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/ask-voice", (req, res) => {
  res.json({
    transcript: "Test transcript",
    answerText: "Test AI answer from backend",
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
