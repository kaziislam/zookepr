const { response } = require('express');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { animals } = require('./data/animals.json');
const PORT = process.env.PORT || 3001

const app = express();

// following are all Express Middleware
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
app.use(express.static('public'));


function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array
        // if personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // loop through each trait in the personalityTraits array;
        personalityTraitsArray.forEach(trait => {
            // check the trait against each animal in the filteredResults array
            // Remember, it is initially a copy of the animalsArray
            // but here we're updating it for each trait in the .forEach() loop
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait
            // so at the end we'll have an array of animals that have every one
            // of the traits when the .forEach() loop is finished. 
            filteredResults = filteredResults.filter(
                animals => animals.personalityTraits.indexOf(trait) != -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
};

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
};

function createNewAnimals(body, animalsArray) {
    console.log(body);
    // our function's main code will go here!
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    // return finished code to post route for response
    return animal;
};

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name != 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species != 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet != 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
};

app.get('/api/animals', (req, res) => {
    let results = animals;
    // console.log(req.query);
    // console.log(req.originalUrl);
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(404);
    }
});

app.post('/api/animals', (req, res) => {

    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();
    // req.body is where our incoming content will be
    // console.log(req.body);

    // if any data in the req.body is incorrect, send 400 error block
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted!.');
    } else {
        // add animal to json file and animals array in the function
        const animal = createNewAnimals(req.body, animals);
        // res.json(req.body);
        res.json(animal);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log('API server is now running on port 3001!');
});