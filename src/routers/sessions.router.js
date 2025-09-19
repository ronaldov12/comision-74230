// routers/sessions.router.js
import { Router } from "express";
import passport from "passport";
import SessionsController from "../controllers/SessionsController.js";


const router = Router();
const controller = new SessionsController();

// POST /api/sessions/register
router.post("/register", (req, res) => controller.register(req, res));

// POST /api/sessions/login
router.post("/login", (req, res) => controller.login(req, res));

// GET /api/sessions/current
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => controller.current(req, res)
);

export default router;
