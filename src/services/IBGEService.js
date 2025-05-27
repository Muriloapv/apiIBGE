const axios = require('axios');
const winston = require('winston');

class IBGEService {
    constructor() {
        this.baseURL = 'https://servicodados.ibge.gov.br/api/v2/censos/nomes';
        this.ibgeBaseURL = 'https://servicodados.ibge.gov.br/api/v1/localidades';
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' })
            ]
        });
    }

    async getNomeData(nome, periodoInicio, periodoFim) {
        try {
            this.logger.info(`Fetching data for name: ${nome} between ${periodoInicio} and ${periodoFim}`);
            let url = `${this.baseURL}/${nome}`;
            
            // Adiciona o filtro de período se ambos os anos forem fornecidos
            if (periodoInicio && periodoFim) {
                url += `?periodo=${periodoInicio}|${periodoFim}`;
            } else if (periodoInicio) {
                 url += `?periodo=${periodoInicio}`;
            } else if (periodoFim) {
                 url += `?periodo=${periodoFim}`;
            }

            const response = await axios.get(url);
            
            if (!response.data || response.data.length === 0 || !response.data[0].res) {
                 throw new Error('Nenhum dado encontrado para o nome e período especificados');
            }

            // Retorna o array de resultados dentro da propriedade 'res'
            return response.data[0];

        } catch (error) {
            this.logger.error(`Error fetching data for name ${nome}: ${error.message}`);
            throw new Error(`Falha ao buscar dados do IBGE: ${error.message}`);
        }
    }

    async getNomeDataByLocation(nome, localidade, ano) {
        try {
            this.logger.info(`Fetching data for name: ${nome} in location: ${localidade}${ano ? ` in year: ${ano}` : ''}`);
            let url = `${this.baseURL}/${nome}?localidade=${localidade}`;
            if (ano) {
                url += `&periodo=${ano}`;
            }
            const response = await axios.get(url);
            return response.data[0];
        } catch (error) {
            this.logger.error(`Error fetching data for name ${nome} in location ${localidade}: ${error.message}`);
            throw new Error(`Failed to fetch IBGE data: ${error.message}`);
        }
    }

    async getTopNomesByLocalidade(codigoLocalidade) {
        try {
            this.logger.info(`Fetching top names for location: ${codigoLocalidade}`);
            const response = await axios.get(`${this.baseURL}/ranking?localidade=${codigoLocalidade}`);
            if (!response.data || response.data.length === 0 || !response.data[0].res) {
                throw new Error('Nenhum dado de ranking encontrado para a localidade especificada');
            }
            return response.data[0].res || [];
        } catch (error) {
            this.logger.error(`Error fetching top names for location ${codigoLocalidade}: ${error.message}`);
            throw new Error(`Falha ao buscar dados de ranking do IBGE: ${error.message}`);
        }
    }

    async getEstados() {
        try {
            this.logger.info('Fetching available states');
            const response = await axios.get(`${this.ibgeBaseURL}/estados`);
            return response.data.map(estado => ({
                id: estado.id,
                nome: estado.nome,
                sigla: estado.sigla
            }));
        } catch (error) {
            this.logger.error(`Error fetching states: ${error.message}`);
            throw new Error(`Failed to fetch states: ${error.message}`);
        }
    }

    async getMunicipios(estadoId) {
        try {
            this.logger.info(`Fetching municipalities for state: ${estadoId}`);
            const response = await axios.get(`${this.ibgeBaseURL}/estados/${estadoId}/municipios`);
            return response.data.map(municipio => ({
                id: municipio.id,
                nome: municipio.nome
            }));
        } catch (error) {
            this.logger.error(`Error fetching municipalities: ${error.message}`);
            throw new Error(`Failed to fetch municipalities: ${error.message}`);
        }
    }

    async getFrequenciaNomesPorLocalidadeEPeriodo(codigoLocalidade, nome1, nome2, periodoInicio, periodoFim) {
        try {
            this.logger.info(`Fetching data for names ${nome1}, ${nome2} in location ${codigoLocalidade} between ${periodoInicio} and ${periodoFim}`);

            const url1 = `${this.baseURL}/${nome1}?localidade=${codigoLocalidade}&periodo=${periodoInicio}|${periodoFim}`;
            const url2 = `${this.baseURL}/${nome2}?localidade=${codigoLocalidade}&periodo=${periodoInicio}|${periodoFim}`;

            const [response1, response2] = await Promise.all([
                axios.get(url1).catch(error => { // Captura erro para uma requisição e permite a outra continuar
                    this.logger.error(`Error fetching data for name ${nome1}: ${error.message}`);
                    return null; // Retorna null em caso de erro para não quebrar o Promise.all
                }),
                axios.get(url2).catch(error => { // Captura erro para a segunda requisição
                     this.logger.error(`Error fetching data for name ${nome2}: ${error.message}`);
                     return null;
                })
            ]);
            
            // Processa os resultados
            const res1 = response1 && response1.data && response1.data[0] ? response1.data[0].res : [];
            const res2 = response2 && response2.data && response2.data[0] ? response2.data[0].res : [];

            // Formata os dados para facilitar o consumo no frontend
            const formattedRes1 = res1.reduce((acc, curr) => {
                acc[curr.periodo] = curr.frequencia;
                return acc;
            }, {});

             const formattedRes2 = res2.reduce((acc, curr) => {
                acc[curr.periodo] = curr.frequencia;
                return acc;
            }, {});

            return { res1: formattedRes1, res2: formattedRes2 };

        } catch (error) {
            this.logger.error(`Error fetching frequency data for names in location ${codigoLocalidade}: ${error.message}`);
            throw new Error(`Falha ao buscar dados de frequência do IBGE: ${error.message}`);
        }
    }
}

module.exports = new IBGEService(); 