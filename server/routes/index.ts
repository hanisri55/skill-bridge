import { Router } from "express";
import authRouter from "./auth";
import profileRouter from "./profile";
import resumeRouter from "./resume";
import skillsRouter from "./skills";
import assessmentsRouter from "./assessments";
import readinessRouter from "./readiness";
import jobsRouter from "./jobs";
import roadmapRouter from "./roadmap";
import analyticsRouter from "./analytics";
import notificationsRouter from "./notifications";
import assistantRouter from "./assistant";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/resume", resumeRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/assessments", assessmentsRouter);
apiRouter.use("/readiness", readinessRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/roadmap", roadmapRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/assistant", assistantRouter);

export default apiRouter;
