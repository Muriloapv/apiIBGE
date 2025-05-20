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
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

app.post("/nome", async (req, res) => {
  const { nome } = req.body;

  try {
    const response = await axios.get(`https://servicodados.ibge.gov.br/api/v2/censos/nomes/${nome}`);
    res.json(response.data[0]); // resposta já estruturada
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar dados do IBGE" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
