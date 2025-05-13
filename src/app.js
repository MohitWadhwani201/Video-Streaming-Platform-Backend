import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ limit: '16mb', extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(cors({ origin:true, credentials: true }));
export { app };

