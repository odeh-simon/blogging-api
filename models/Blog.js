const mongoose = require('mongoose');
const ReadingTime = require('../utils/ReadingTime');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A blog must have a title'],
  },
  description: {
    type: String,
  },
  tags: {
    type: [String],
  },
  author: {
    type: String, 
    required: [true, 'A blog must have an author name'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'A blog must have an owner'],
  },
  state: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  body: {
    type: String,
    required: [true, 'A blog must have content'],
  },
  read_count: {
    type: Number,
    default: 0,
  },
  reading_time: {
    type: Number,
    default: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

blogSchema.pre('save', function (next) {
  this.reading_time = ReadingTime(this.body);
  next();
});


blogSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Blog', blogSchema);