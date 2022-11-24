const router = require('express').Router();
const { filterByQuery, findById, createNewAnimals, validateAnimal } = require('../../lib/animals');
const { animals } = require('../../data/animals.json');

router.get('/animals', (req, res) => {
    let results = animals;
    // console.log(req.query);
    // console.log(req.originalUrl);
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

router.get('/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(404);
    }
});

router.post('/animals', (req, res) => {

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

module.exports = router;