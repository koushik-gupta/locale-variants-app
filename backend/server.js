const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Add the new line for variants
app.use("/api/locales", require("./routes/locales"));
app.use("/api/variants", require("./routes/variants")); // This is the new line [cite: 98]
app.use("/api/translations", require("./routes/translations"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));