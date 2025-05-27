const express = require('express');
const router = express.Router();
const NomeController = require('../controllers/NomeController');

router.post('/nome', NomeController.getNomeData);
router.post('/nome/localidade', NomeController.getNomeDataByLocation);
router.post('/nome/ranking', NomeController.getTopNomesByLocalidade);
router.get('/estados', NomeController.getEstados);
router.get('/estados/:estadoId/municipios', NomeController.getMunicipios);
router.post('/nome/localidade/comparar', NomeController.compararNomesPorLocalidadeEPeriodo);

module.exports = router; 