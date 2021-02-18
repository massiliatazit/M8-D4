const express = require("express");
const AuthorModel = require("./schema");
const AuthorSchema = require("./schema");
const { authenticate, authorize } = require("../authTools");
const passport = require("passport");
require("../authTools/googleAuth");

const authorRouter = express.Router();

authorRouter.get("/", authorize, async (req, res, next) => {
  try {
    if (req.query.name) {
      const author = await AuthorSchema.findOne({ name: req.query.name });
      if (author) {
        res.status(200).send(author);
      } else {
        res.status(404).send("no author with that name");
      }
    } else {
      const allAuthors = await AuthorSchema.find();
      res.status(200).send(allAuthors);
    }
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

authorRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorModel.findByCrendor(email, password);
    if (!author) {
      res.status(404).send("NO USER FOUND");
    } else {
      const tokens = await authenticate(author);
      res.cookie("accessToken", tokens.access, {
        httpOnly: true,
      });
      res.cookie("refreshToken", tokens.refresh, {
        httpOnly: true,
        path: "/authors/refreshToken",
      });
      res.send("okie dokie artichockie");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
authorRouter.post("/sign/register", async (req, res) => {
  try {
    const newAuthor = new AuthorSchema(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

authorRouter.get("/:id", authorize, async (req, res) => {
  try {
    const selectedAuthor = await AuthorSchema.findById(req.params.id).populate(
      "articles"
    );
    if (selectedAuthor) {
      res.status(200).send(selectedAuthor);
    } else {
      res.status(404).send("We couldn't find an author with that id");
    }
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

authorRouter.delete("/:id", authorize, async (req, res) => {
  try {
    const author = await AuthorSchema.findByIdAndDelete(req.params.id);
    if (author) {
      res.send("AUTHOR DELETED");
    } else {
      res.status(404).send("AUTHOR NOT FOUND");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

authorRouter.put("/:id", authorize, async (req, res) => {
  try {
    const author = await AuthorSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    if (author) {
      res.send(author);
    } else {
      res.status(404).send("ARTICLE NOT FOUND");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

authorRouter.post("/refresh/Token/token", async (req, res, next) => {
  const oldRefresh = req.body.refreshToken;
  if (!oldRefresh) {
    const err = new Error("MISSING REFRESH TOKEN");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const newTokens = await refreshToken(oldRefresh);
      res.cookie("accessToken", newTokens.access, {
        httpOnly: true,
      });
      res.cookie("refreshToken", newTokens.refresh, {
        httpOnly: true,
        path: "/authors/refreshToken",
      });
      res.send("okie dokie artichockie");
    } catch (error) {
      console.log(error);
      const err = new Error(error);
      err.httpStatusCode = 403;
      next(err);
    }
  }
});

authorRouter.get(
  "/3rdParty/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) //AUTHENTICATES WITH PASSPORT, USES "google" ROUTE, RETURNS PROFILE INFO AND EMAIL DATA
);

authorRouter.get(
  "/3rdParty/google/Redirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res.cookie("accessToken", req.user.tokens.access, {
        httpOnly: true,
      });
      res.cookie("refreshToken", req.user.tokens.refresh, {
        httpOnly: true,
        path: "/authors/refreshToken",
      });

      res.status(200).redirect("http://localhost:3000/");
    } catch (error) {
      next(error);
    }
  }
);

module.exports = authorRouter;
