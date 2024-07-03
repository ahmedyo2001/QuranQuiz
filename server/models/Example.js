const mongoose = require('mongoose');

const ExampleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // Add more fields as needed
});

module.exports = mongoose.model('Example', ExampleSchema);
