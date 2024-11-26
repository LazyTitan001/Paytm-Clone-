const express = require("express");

const app = express();

app.use(cors());
app.use(express.json());

app.use(authmiddleware);

app.use("/api/v1", require("./routes/index.js"));
app.listen(3000);
