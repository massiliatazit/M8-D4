const { Schema, model } = require("mongoose");

const ReviewsSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "Author" },
  },
  { timestamps: true }
);

module.exports = model("Reviews", ReviewsSchema);
