import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dbConnection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";


dotenv.config({ path: "./config.env" });
const app = express();

const corsOptions = {
  origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL, process.env.WEBSITE ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use("/api/v1/user", userRouter);

dbConnection();
app.use(errorMiddleware);

export default app;
