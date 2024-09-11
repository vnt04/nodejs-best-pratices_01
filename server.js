import express from "express";
import "dotenv/config";

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello world! Try best practice nodejs.");
});

// Routes api

import apiRoutes from "./Routes/api.js";
app.use("/api", apiRoutes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
