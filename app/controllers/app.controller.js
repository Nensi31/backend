const App = require("../model/app.model.js");
const express = require("express");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// Create and Save a new Message
exports.create = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    console.log(req.body);



    const oldUser = await App.findOne({ email });
    console.log(oldUser);

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    const hashedPwd = bcrypt.hashSync(password, salt);

    const UserSchema = await new App({
      name,
      email: email.toLowerCase(),
      password: hashedPwd,
      role,
      department,
    });

    const token = jwt.sign(
      { UserSchema_id: UserSchema._id, email },
      "secretkey",
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    );
    UserSchema.token = token;
    UserSchema.save().then((data) => {
      // res.status(201).json(data);
      res.send(data);
    });
  } catch (error) {
    console.log(error);
    // res.status(500).send({
    //         UserSchema:
    //           err.UserSchema || "Some error occurred while creating the Message.",

    //       });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await App.findOne({ email });
    console.log(user, email, password);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        "secretkey",
        process.env.TOKEN_KEY,
        {
          expiresIn: "5h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid  Credentials");
    } // const user = await App.findOne({email: req.body.email});
    // console.log(user);
    // if(user){
    //   const cmp = bcrypt.compare(req.body.password, user.password);
    //   if(cmp){
    //     res.send("Auth Successful");

    //   } else {
    //     res.send("Wrong username or password.");
    //   }
    // } else {
    //   res.send("Wrong username or password.");
    //   }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error Occured");
  }
};
const config = process.env;
exports.auth = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    console.log("========dasd=========", token);
    const decoded = await jwt_decode(token, "secretKey", config.TOKEN_KEY);
    console.log("=======decoded", decoded);
    // var decoded =await jwt_decode(token ,"secretkey",process.env.TOKEN_KEY );
    // console.log(decoded);
    req.user = decoded;
    res.status(200).send("Welcome");
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};
// Retrieve all messages from the database.
exports.findAll = (req, ress) => {

  // console.log(req?.query);
  App.find()
    .then((data) => {

      const { order} = req.params;
App.find({}).sort({'name':order})
    .then((res) => ress.send(res));

      // const response ={
      // users,
      //   page:page + 1,
      //   error:false,
      // }
      // res.status(200).json(response);
      // ress.send(data)
      // console.log("data",data.sort(-1))

    })
    .catch((err) => {
      res.status(500).send({
        UserSchema:
          err.UserSchema || "Some error occurred while retrieving messages.",
      });
    });
};

// Find a single message with a messageId
exports.findOne = (req, res) => {
  App.findById(req.params.messageId)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      return res.status(500).send({
        UserSchema: "Error retrieving message with id " + req.params.messageId,
      });
    });
};

// Update a message identified by the messageId in the request
exports.update = (req, res) => {
  const hashedPwd = bcrypt.hashSync(req.body.password, salt);

  App.findByIdAndUpdate(
    req.params.messageId,
    {
      name: req.body.name,
      email: req.body.email,
      department:req.body.department,
      password: hashedPwd,
      // passwordConfirm:hashedPwd1,
      role: req.body.role,
    }
    // { new: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      return res.status(500).send({
        UserSchema: "Error updating message with id " + req.params.messageId,
      });
    });
};

// Delete a message with the specified messageId in the request
exports.delete = (req, res) => {
  console.log(req.params.messageId);
  App.findByIdAndRemove(req.params.messageId)

    .then((data) => {
      token = token.filter((c) => c != req.body.token);

      if (!data) {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      res.send({ UserSchema: "Message deleted successfully!" });
      res.status(204).send("Logged out!");
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      return res.status(500).send({
        UserSchema: "Could not delete message with id " + req.params.messageId,
      });
    });
};
