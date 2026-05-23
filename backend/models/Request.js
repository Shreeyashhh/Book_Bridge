import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['sell', 'donate'],
      required: true,
    },
    proposedPrice: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model('Request', requestSchema);
export default Request;
