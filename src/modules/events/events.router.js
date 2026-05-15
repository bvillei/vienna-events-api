const { Router } = require('express');
const ctrl = require('./events.controller');

const router = Router();

router.get('/categories', ctrl.categories);
router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);

module.exports = router;
