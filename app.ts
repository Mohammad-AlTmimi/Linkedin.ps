import './config.js';
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import cookieParser from 'cookie-parser';

import dataSource, { initDB } from './db/dataSource.js';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import jobsRouter from './routes/jobs.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from './middlewares/auth/authenticate.js';
import baseLogger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var app = express();

if(process.env.NODE_ENV !== 'production'){
  app.get('/only_developer' , (req , res) =>{
    res.send("Only Developer can see me")
  })
}

const PORT = 5000;
const errorHandler = (
  error: any , 
  req: express.Request , 
  res: express.Response , 
  next: express.NextFunction) =>{
    baseLogger.error("Error Message from Handler [Middle  Ware]");
    baseLogger.error(error);
    res.status(500).send("SomeThing Went Wrong !!??")
  }
app.use(cors({
  origin: "http://localhost:3000", 
  credentials:true
}));

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/jobs', authenticate, jobsRouter);
app.use(errorHandler);
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(500).send("Failed Upload File!");
    return;
  }
  const fileURL = req.file.destination + req.file.filename;
  res.send({
    message: 'File Uploaded Successfully!',
    file: fileURL
  });
});



app.get('/file', (req, res) => {
  const fileName = req.query.name?.toString() || '';
  try {
    const data = fs.readFileSync('uploads/' + fileName, 'utf-8');
    const JSONData = JSON.parse(data) as any[];
    res.send(JSONData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err: any, req: any, res: any, next: any) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : err     ;

  // render the error page
  res.status(err.status || 500).send(err);
});


app.listen(PORT, () => {
  logger(`App is listening on port ${PORT}`);
  console.log(`App is listening on port ${PORT}`);
  initDB();
});

export default app;
