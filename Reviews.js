var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

// Reviews schema
var ReviewSchema = new Schema({
    reviewer: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    movieid: { type: mongoose.Types.ObjectId, required: true }
});

ReviewSchema.index({reviewer : 1, movieid :1},{unique: true});
// return the model
module.exports = mongoose.model('Review', ReviewSchema);