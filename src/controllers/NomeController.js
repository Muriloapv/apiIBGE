const IBGEService = require('../services/IBGEService');

class NomeController {
    async getNomeData(req, res) {
        try {
            const { nome, periodoInicio, periodoFim } = req.body;
            if (!nome) {
                return res.status(400).json({ error: 'Nome é obrigatório' });
            }

            // Adiciona validação para os campos de período
            if (!periodoInicio || !periodoFim) {
                 return res.status(400).json({ error: 'Período de início e fim são obrigatórios' });
            }
             if (parseInt(periodoInicio) > parseInt(periodoFim)) {
                 return res.status(400).json({ error: 'O ano de início deve ser menor ou igual ao ano de fim.' });
             }

            const data = await IBGEService.getNomeData(nome, periodoInicio, periodoFim);
            res.json(data);
        } catch (error) {
             console.error('Erro no controlador getNomeData:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getNomeDataByLocation(req, res) {
        try {
            const { nome, localidade, ano } = req.body;
            if (!nome || !localidade) {
                return res.status(400).json({ error: 'Nome e localidade são obrigatórios' });
            }

            const data = await IBGEService.getNomeDataByLocation(nome, localidade, ano);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTopNomesByLocalidade(req, res) {
        try {
            const { codigoLocalidade, nomeLocalidade } = req.body;
            
            // Validação dos campos obrigatórios
            if (!codigoLocalidade) {
                return res.status(400).json({ error: 'Código da localidade é obrigatório' });
            }
            if (!nomeLocalidade) {
                return res.status(400).json({ error: 'Nome da localidade é obrigatório' });
            }

            const data = await IBGEService.getTopNomesByLocalidade(codigoLocalidade);
            
            // Adiciona informações extras aos dados
            const responseData = {
                nomeLocalidade,
                res: data
            };

            res.json(responseData);
        } catch (error) {
            console.error('Erro no controlador:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getEstados(req, res) {
        try {
            const estados = await IBGEService.getEstados();
            res.json(estados);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMunicipios(req, res) {
        try {
            const { estadoId } = req.params;
            if (!estadoId) {
                return res.status(400).json({ error: 'ID do estado é obrigatório' });
            }

            const municipios = await IBGEService.getMunicipios(estadoId);
            res.json(municipios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async compararNomesPorLocalidadeEPeriodo(req, res) {
        try {
            const { codigoLocalidade, nomeLocalidade, nome1, nome2, periodoInicio, periodoFim } = req.body;
            
            // Validação dos campos obrigatórios
            if (!codigoLocalidade || !nomeLocalidade || !nome1 || !nome2 || !periodoInicio || !periodoFim) {
                return res.status(400).json({ error: 'Todos os campos (localidade, nomes e período) são obrigatórios' });
            }

            const data = await IBGEService.getFrequenciaNomesPorLocalidadeEPeriodo(codigoLocalidade, nome1, nome2, periodoInicio, periodoFim);
            
            // Adiciona informações extras aos dados
            const responseData = {
                nomeLocalidade,
                nome1,
                nome2,
                res1: data.res1,
                res2: data.res2
            };

            res.json(responseData);

        } catch (error) {
            console.error('Erro no controlador de comparação:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new NomeController(); 