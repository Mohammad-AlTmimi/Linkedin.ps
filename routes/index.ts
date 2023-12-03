import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  console.log(req.cookies);
  let name = req.cookies['fullName'];
  console.log(name)
  res.status(200).send("Helllo world")
  //res.render('index', { title: 'Express' });
});

export default router;
