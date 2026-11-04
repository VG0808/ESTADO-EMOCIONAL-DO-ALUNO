const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_padrao';

// Conexão com o MongoDB
let isConnected = false;
const connectDB = async () => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
  }
};

// Schema de Usuários
const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }
});
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

// Schema de Registros Emocionais
const RegistroSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  emocao: { type: String, required: true },
  mensagem: { type: String, default: '' },
  dataCriacao: { type: Date, default: Date.now }
});
const Registro = mongoose.models.Registro || mongoose.model('Registro', RegistroSchema);

// ROTA 1: Cadastrar Usuário
app.post('/.netlify/functions/api/cadastrar', async (req, res) => {
  try {
    await connectDB();
    const { email, senha } = req.body;

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado!' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const novoUsuario = new Usuario({ email, senha: senhaCriptografada });
    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
});

// ROTA 2: Login de Usuário
app.post('/.netlify/functions/api/login', async (req, res) => {
  try {
    await connectDB();
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ erro: 'E-mail ou senha incorretos!' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ erro: 'E-mail ou senha incorretos!' });
    }

    const token = jwt.sign({ id: usuario._id, email: usuario.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ mensagem: 'Login realizado!', token });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao realizar login' });
  }
});

// ROTA 3: Salvar Registro da Emoção (Protegida)
app.post('/.netlify/functions/api/registros', async (req, res) => {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ erro: 'Faça login primeiro!' });

    const token = authHeader.split(' ')[1];
    const dadosUsuario = jwt.verify(token, JWT_SECRET);

    const { emocao, mensagem } = req.body;
    const novoRegistro = new Registro({
      usuarioId: dadosUsuario.id,
      emocao,
      mensagem
    });

    await novoRegistro.save();
    res.status(201).json({ mensagem: 'Emoção registrada com sucesso!' });
  } catch (erro) {
    res.status(401).json({ erro: 'Sessão inválida ou expirada' });
  }
});

module.exports.handler = serverless(app);