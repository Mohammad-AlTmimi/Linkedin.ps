import express from 'express';
import { validateUser } from '../middlewares/validation/user.js';
import { insertUser, login, insertRole, insertPermission, getRoles } from '../controllers/user.js';
import { authenticate } from '../middlewares/auth/authenticate.js';
import { authorize } from '../middlewares/auth/authorize.js';

var router = express.Router();

router.post('/', validateUser, (req, res, next) => {
  insertUser(req.body).then(() => {
    res.status(201).send()
  }).catch(err => {
    next(err);
  });
});

router.post('/role', authorize('POST_users/role'), authenticate, (req, res, next) => {
  insertRole(req.body).then((data) => {
    res.status(201).send(data)
  }).catch(err => {
    console.error(err);
    res.status(500).send(err);
  });
});

router.post('/permission', authenticate, (req, res, next) => {
  insertPermission(req.body).then((data) => {
    res.status(201).send(data)
  }).catch(err => {
    console.error(err);
    res.status(500).send(err);
  });
});

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  login(email, password)
    .then(data => {
      res.cookie('fullName' , data.fullName , {
        maxAge:  2 * 60 * 60 * 1000
      })
      res.cookie('loginTime' , Date.now() , {
        maxAge:  2 * 60 * 60 * 1000
      })
      res.send(data);
    })
    .catch(err => {
      res.status(401).send(err);
    })
});

router.post('/logout' , (req , res) =>{
  res.cookie('token' , {maxAge: -1 , expire: Date.now() - 1})
  res.cookie('loginTime' , {maxAge: -1 , expire: Date.now() - 1})
  res.status(200).send("Go To Hell")
  
})

router.get('/roles', authorize('GET_users/role'), authenticate, async (req, res, next) => {
  try {
    const roles = await getRoles();
    res.send(roles);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

export default router;
