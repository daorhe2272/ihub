const mongoose = require('mongoose');
const uri = 'mongodb://localhost/ehub';

const sharesSchema = new mongoose.Schema({
  publisher: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  linkTitle: {
    type: String,
    'default': ""
  },
  linkDescription: {
    type: String,
    'default':""
  },
  linkImage: {
    type: String,
    'default':""
  },
  likes: {
    type: Number,
    'default': 0,
    min: 0
  },
  comments: {
    type: Number,
    'default': 0,
    min: 0
  },
  shares: {
    type: Number,
    'default': 0,
    min: 0
  },
  timeRank: {
    type: Number,
    'default': Date.now(),
    min: 0
  }
});

mongoose.model('Share', sharesSchema);
