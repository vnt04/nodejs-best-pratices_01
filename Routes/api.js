import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import ProfileController from "../controllers/ProfileController.js";

const router = Router();

// auth routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

//profile routes
router.put("/profile/:id", AuthMiddleware, ProfileController.update);
router.get("/profile", AuthMiddleware, ProfileController.index);

export default router;
