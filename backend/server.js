const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- NEW DEBUG MIDDLEWARE ---
// This will run for EVERY request and log its method and URL
app.use((req, res, next) => {
  console.log(`[Logger]: Received request: ${req.method} ${req.originalUrl}`);
  next(); // Continue to the next route
});
// --------------------------

app.use("/api/locales", require("./routes/locales"));
app.use("/api/variants", require("./routes/variants"));
app.use("/api/translations", require("./routes/translations"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));