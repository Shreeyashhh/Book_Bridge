import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      enum: ['Mathematics', 'Science', 'Literature & Languages', 'Social Sciences & History', 'Engineering & Tech', 'Business & Economics', 'Arts & Humanities', 'Other'],
      default: 'Other',
    },
    grade: {
      type: String,
      required: true,
      enum: ['Middle School', 'High School', 'Undergraduate', 'Postgraduate', 'Other'],
      default: 'Undergraduate',
    },
    language: {
      type: String,
      required: true,
      default: 'English',
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      default: 'Good',
    },
    price: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ['sell', 'donate'],
      default: 'sell',
    },
    coverImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'hidden'],
      default: 'available',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

const Book = mongoose.model('Book', bookSchema);
export default Book;
