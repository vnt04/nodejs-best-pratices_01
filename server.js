import express from "express";
import fileUpload from "express-fileupload";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/ratelimiter.js";

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors());
app.use(limiter);

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
