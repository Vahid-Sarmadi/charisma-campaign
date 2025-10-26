const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: { type: String },
    birthMonth: { type: String },
    fullname: { type: String },
    shareLink: { type: String },
    nextHeal: { type: Date },
    friendList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    inviteList: [{ type: String }],
    profile: {
      heal: { type: Number, default: 2 },
      score: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      instagramHeal: { type: Boolean, default: false },
      telegramHeal: { type: Boolean, default: false },
      twitterHeal: { type: Boolean, default: false },
      linkedinHeal: { type: Boolean, default: false },
      tarhHeal: { type: Boolean, default: false },
      sandooghHeal: { type: Boolean, default: false },
      vamHeal: { type: Boolean, default: false },
      tabdilHeal: { type: Boolean, default: false },
      registerHeal: { type: Boolean, default: false },
      hasNightVision: { type: Boolean, default: false },
      giftLevel: { type: Number, default: 0 },
      sms1Sent: { type: Boolean, default: false },
      sms2Sent: { type: Boolean, default: false },
      sms3Sent: { type: Boolean, default: false },
      sms4Sent: { type: Boolean, default: false },
      reminderSms: { type: Number, default: 0 },
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    deleted: { type: Boolean, default: false },
  },
  {
    /**
     * Schema-level options
     */

    // 1) Automatically manage `createdAt` and `updatedAt` fields
    timestamps: true,

    // 2) Customize collection name if needed. Otherwise, Mongoose uses the pluralized model name by default.
    // collection: 'users',

    // 3) Minimizing output removes empty objects ({})
    minimize: true,

    // 4) If you want to store virtuals (e.g., derived properties) in JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    // 5) Use strict: 'throw' or strict: true for stricter schema compliance
    // strict: true,
  }
);

// OPTIONAL: Example of an index if phone needs to be unique
// userSchema.index({ phone: 1 }, { unique: true });

// Export model
module.exports = mongoose.model("User", userSchema);
