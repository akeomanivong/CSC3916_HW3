var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: { unique: true }},
    releaseYear: { type: String, required: true},
    genre: { type: String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller',
            'Western'], required: true},
    actors: { type: [{actorName: String, characterName: String}], required: true }
},
{ id: false}
);



// return the Movies model
module.exports = mongoose.model('Movies', MovieSchema);