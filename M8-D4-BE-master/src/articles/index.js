const express = require("express");
const mongoose = require("mongoose");
const ArticleSchema = require("./schema");
const ReviewSchema = require("../reviews/schema");
const AuthorSchema = require("../authors/schema");
const { authorize } = require("../authTools");

const articleRouter = express.Router();

articleRouter.post("/", authorize, async (req, res) => {
  try {
    console.log(req.body);
    const newArticle = new ArticleSchema(req.body);
    const { _id } = await newArticle.save();
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

articleRouter.post(
  "/:id/add-to-author/:authorID",
  authorize,
  async (req, res) => {
    try {
      await AuthorSchema.addArticleIdToAuthor(
        req.params.id,
        req.params.authorID
      );
      res.send("added");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

articleRouter.get("/", authorize, async (req, res) => {
  try {
    const allArticles = await ArticleSchema.find().populate("author");
    res.send(allArticles);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

articleRouter.get("/:id", authorize, async (req, res) => {
  try {
    const article = await ArticleSchema.findById(req.params.id).populate(
      "author"
    );
    res.send(article);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

articleRouter.put("/:id", authorize, async (req, res) => {
  try {
    const article = await ArticleSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    if (article) {
      res.send(article);
    } else {
      res.status(404).send("ARTICLE NOT FOUND");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

articleRouter.delete("/:id", authorize, async (req, res) => {
  try {
    const article = await ArticleSchema.findByIdAndDelete(req.params.id);
    if (article) {
      res.send("ARTICLE DELETED");
    } else {
      res.status(404).send("ARTICLE NOT FOUND");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

articleRouter.post("/:id", authorize, async (req, res) => {
  try {
    const newReview = new ReviewSchema(req.body);
    const review = await newReview.save();
    const article = await ArticleSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviews: review,
        },
      },
      { runValidators: true, new: true }
    );
    res.status(201).send(article);
  } catch (error) {
    console.log(error);
  }
});

articleRouter.get("/:id/reviews", authorize, async (req, res) => {
  try {
    const reviews = await ArticleSchema.findById(req.params.id, { reviews: 1 });
    res.status(200).send(reviews.reviews);
  } catch (error) {
    console.log(error);
  }
});

articleRouter.get("/:id/reviews/:reviewID", authorize, async (req, res) => {
  try {
    const selectedReview = await ArticleSchema.findOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      {
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewID) },
        },
      }
    );
    if (selectedReview) {
      res.status(200).send(selectedReview.reviews[0]);
    } else {
      res
        .status(404)
        .send(`We couldn't find a review with the id ${req.params.reviewID}`);
    }
  } catch (error) {
    console.log(error);
  }
});

articleRouter.put("/:id/reviews/:reviewID", authorize, async (req, res) => {
  try {
    const selectedReview = await ArticleSchema.findOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      {
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewID) },
        },
      }
    );
    if (selectedReview) {
      const newReview = { ...selectedReview.reviews[0], ...req.body };
      const alteredReview = await ArticleSchema.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "reviews._id": mongoose.Types.ObjectId(req.params.reviewID),
        },
        {
          $set: { "reviews.$": newReview },
        },
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(200).send(alteredReview);
    } else {
      res
        .status(404)
        .send(`We couldn't find a review with the id ${req.params.reviewID}`);
    }
  } catch (error) {
    console.log(error);
  }
});

articleRouter.delete("/:id/reviews/:reviewID", authorize, async (req, res) => {
  try {
    const alteredReview = await ArticleSchema.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          reviews: { _id: mongoose.Types.ObjectId(req.params.reviewID) },
        },
      },
      { runValidators: true, new: true }
    );
    res.send(alteredReview);
  } catch (error) {
    console.log(error);
  }
});

module.exports = articleRouter;
