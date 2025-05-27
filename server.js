// // const URL = 'https://servicodados.ibge.gov.br/api/v2/censos/nomes/murilo';
// const url = 'https://servicodados.ibge.gov.br/api/v2/censos/nomes/joao?localidade=33';

// async function fetchNomes(){
//     const resp = await fetch( URL );
//        if ( resp.status === 200 ){
//         const obj = await resp.json()
//     }

//     console.log(resp)
// }

// fetchNomes()


const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = 3000;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://servicodados.ibge.gov.br;"
  );
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// API routes
app.post("/api/nome", async (req, res) => {
  const { nome, periodoInicio, periodoFim } = req.body;

  try {
    let url = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${nome}`;
    if (periodoInicio && periodoFim) {
      url += `?periodo=${periodoInicio}|${periodoFim}`;
    }
    const response = await axios.get(url);
    res.json(response.data[0]);
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    res.status(500).json({ error: "Erro ao buscar dados do IBGE" });
  }
});

// API route for estados
app.get("/api/estados", async (req, res) => {
  try {
    const response = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
    res.json(response.data);
  } catch (err) {
    console.error('Erro ao buscar estados:', err);
    res.status(500).json({ error: "Erro ao buscar estados" });
  }
});

// API route for municipios
app.get("/api/estados/:estadoId/municipios", async (req, res) => {
  try {
    const { estadoId } = req.params;
    const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`);
    res.json(response.data);
  } catch (err) {
    console.error('Erro ao buscar municípios:', err);
    res.status(500).json({ error: "Erro ao buscar municípios" });
  }
});

// API route for ranking de nomes por localidade
app.post("/api/nome/ranking", async (req, res) => {
  const { codigoLocalidade, nomeLocalidade } = req.body;

  try {
    const url = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=${codigoLocalidade}`;
    const response = await axios.get(url);
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhum dado de ranking encontrado para esta localidade');
    }

    res.json({
      nomeLocalidade,
      res: response.data[0].res
    });
  } catch (err) {
    console.error('Erro ao buscar ranking:', err);
    res.status(500).json({ error: "Erro ao buscar ranking de nomes" });
  }
});

// API route for comparativo de nomes
app.post("/api/nome/localidade/comparar", async (req, res) => {
  const { codigoLocalidade, nomeLocalidade, nome1, nome2, periodoInicio, periodoFim } = req.body;

  try {
    const url1 = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${nome1}?localidade=${codigoLocalidade}&periodo=${periodoInicio}|${periodoFim}`;
    const url2 = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${nome2}?localidade=${codigoLocalidade}&periodo=${periodoInicio}|${periodoFim}`;

    const [response1, response2] = await Promise.all([
      axios.get(url1).catch(error => {
        console.error(`Erro ao buscar dados para ${nome1}:`, error);
        return { data: [] };
      }),
      axios.get(url2).catch(error => {
        console.error(`Erro ao buscar dados para ${nome2}:`, error);
        return { data: [] };
      })
    ]);

    res.json({
      nomeLocalidade,
      nome1,
      nome2,
      res1: response1.data[0]?.res || [],
      res2: response2.data[0]?.res || []
    });
  } catch (err) {
    console.error('Erro ao comparar nomes:', err);
    res.status(500).json({ error: "Erro ao comparar nomes" });
  }
});

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Frontend disponível em http://localhost:${PORT}`);
});
