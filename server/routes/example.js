const express = require('express');
const router = express.Router();
const Example = require('../models/Question.js');

// Get all examples
router.get('/', async (req, res) => {
    try {
      const questions = await Example.find();
      res.json(questions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

module.exports = router;
