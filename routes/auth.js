const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const {JWT_SECRET} = require("../config/keys");

// ROUTE 1 :Create a User using : POST "/api/auth/createuser" . No login required
router.post(
  "/createuser",
  [
    body("email", "Enter a valid e-mail id ").isEmail(),
    body("name", "Enter a valid name with min 3 character").isLength({
      min: 3,
    }),
    body("password", "Password must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    success = false;
    //If there are errors , return Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    //Chech whether the user with this email exist already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success, error: "Sorry a user with this email already axists" });
      }

      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password, salt);
      //create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        passwordReal: req.body.password,
        password:secPass
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      success = true;
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({success, authtoken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  }
);

// ROUTE 2 : Authenticate a user using "/api/auth/login" no login required
router.post(
  "/login",
  [
    body("email", "Enter a valid e-mail id ").isEmail(),
    body("password", "Password can not be blank ").exists(),
  ],
  async (req, res) => {
    //If there are errors , return Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      success = false;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credential" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credential",
          });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever Error");
    }
  }
);

// ROUTE 3: Get loggedin User Details using: POST "api/auth/getuser".login required

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever Error");
  }
});

module.exports = router;
