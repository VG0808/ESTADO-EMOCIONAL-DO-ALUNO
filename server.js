require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('./'));

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Schema do Banco de Dados
const RegistroSchema = new mongoose.Schema({
  emocao: { type: String, required: true },
  mensagem: { type: String, default: '' },
  data: { type: String },
  hora: { type: String },
  dataCriacao: { type: Date, default: Date.now }
});

const Registro = mongoose.model('Registro', RegistroSchema);

// Salvar registro (POST)
app.post('/api/registros', async (req, res) => {
  try {
    const { emocao, mensagem, data, hora } = req.body;
    const novoRegistro = new Registro({ emocao, mensagem, data, hora });
    await novoRegistro.save();
    res.status(201).json({ mensagem: 'Registro salvo com sucesso!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao salvar registro' });
  }
});

// Buscar registros (GET)
app.get('/api/registros', async (req, res) => {
  try {
    const registros = await Registro.find().sort({ dataCriacao: -1 });
    res.json(registros);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar registros' });
  }
});

// Limpar banco (DELETE)
app.delete('/api/registros', async (req, res) => {
  try {
    await Registro.deleteMany({});
    res.json({ mensagem: 'Todos os registros foram excluídos!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao limpar banco' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
