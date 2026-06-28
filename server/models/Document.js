import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },
    geminiFileUri: {
      type: String,
      default: "",
    },

    geminiFileName: {
      type: String,
      default: "",
    },
    extractedText:{
        type:String,
        default:""
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Document", documentSchema);
