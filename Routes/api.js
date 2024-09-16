import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";

const router = Router();

// auth routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

//profile routes
router.put("/profile/:id", AuthMiddleware, ProfileController.update);
router.get("/profile", AuthMiddleware, ProfileController.index);

//News routes
router.get("/news", NewsController.index);
router.post("/news", AuthMiddleware, NewsController.store);
router.put("/news/:id", AuthMiddleware, NewsController.update);
router.delete("/news/:id", AuthMiddleware, NewsController.destroy);
router.get("/news/:id", NewsController.show);

export default router;
