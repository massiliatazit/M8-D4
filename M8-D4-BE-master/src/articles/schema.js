const { Schema, model } = require("mongoose");

const ArticleSchema = new Schema(
  {
    headLine: {
      type: String,
      required: true,
    },
    subHead: String,
    content: {
      type: String,
      required: true,
    },
    category: {
      name: String,
      img: String,
    },
    author: { type: Schema.Types.ObjectId, ref: "Author" },
    reviews: Array,
    cover: String,
  },
  { timestamps: true }
);

const ArticleModel = model("Articles", ArticleSchema);

module.exports = ArticleModel;
