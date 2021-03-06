const router = require('express').Router();
const controller = require('./points.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');

router.route('/').get(controller.list).post(controller.add).put(controller.subtract).all(methodNotAllowed);

module.exports = router;
