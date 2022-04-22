const router = require('express').Router();
const controller = require('./addTransaction.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');

router.route('/').get(controller.list).post(controller.add).put(controller.subtract).all(methodNotAllowed);
router.route('/all').get(controller.allData).all(methodNotAllowed);

module.exports = router;