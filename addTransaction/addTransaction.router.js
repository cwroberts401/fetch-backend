const router = require('express');
const controller = require('./addTransaction.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');

router
    .route('/')
    .all(methodNotAllowed);

module.exports = router;