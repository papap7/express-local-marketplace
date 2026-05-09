const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      unique: true,
      trim: true,
    },
    productSlug: String,
    price: {
      type: Number,
      required: [true, "A product must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          console.log("Discount entered:", val);
          console.log("Regular price seen by Mongoose:", this.price);

          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    category: {
      type: String,
      required: [true, "A product must have a category"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [50, "Description should not exceed 50 characters"],
    },
    seller: {
      type: String,
      required: [true, "A product must have a seller"],
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    premiumProduct: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual("daysPosted").get(function () {
  if (!this.postedDate) return 0;
  const diffTime = Math.abs(Date.now() - this.postedDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

productSchema.pre("save", function () {
  this.productSlug = slugify(this.name, { lower: false }).toUpperCase();
});

productSchema.pre(/^find/, function () {
  this.find({ premiumProduct: { $ne: true } });
});

productSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { premiumProduct: { $ne: true } } });
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
