const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Converte os dados enviados pelo Netlify (Buffer ou String) para JSON
app.use((req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (e) {
      req.body = {};
    }
  } else if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      req.body = {};
    }
  }
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_padrao';

// Conexão com o MongoDB Atlas
let isConnected = false;
const connectDB = async () => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
  }
};

// Schema de Usuários (Admin)
const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }
});
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

// Schema de Registros Emocionais (Anônimo)
const RegistroSchema = new mongoose.Schema({
  usuarioId: { type: String, default: 'anonimo' },
  emocao: { type: String, required: true },
  mensagem: { type: String, default: '' },
  dataCriacao: { type: Date, default: Date.now }
});
const Registro = mongoose.models.Registro || mongoose.model('Registro', RegistroSchema);

// ROTA 1: Cadastrar Admin
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
    res.status(500).json({ erro: 'Erro ao cadastrar usuário', detalhe: erro.message });
  }
});

// ROTA 2: Login Admin
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
    res.status(500).json({ erro: 'Erro ao realizar login', detalhe: erro.message });
  }
});

// ROTA 3: Salvar Registro da Emoção do Aluno (Anônimo)
app.post('/.netlify/functions/api/registros', async (req, res) => {
  try {
    await connectDB();

    const { emocao, mensagem } = req.body;

    if (!emocao) {
      return res.status(400).json({ erro: 'Selecione uma emoção antes de enviar.' });
    }

    const novoRegistro = new Registro({
      usuarioId: 'anonimo',
      emocao,
      mensagem: mensagem || ''
    });

    await novoRegistro.save();
    res.status(201).json({ mensagem: 'Emoção registrada com sucesso!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao salvar no banco de dados', detalhe: erro.message });
  }
});

// ROTA 4: Buscar todos os registros para o Dashboard
app.get('/.netlify/functions/api/registros', async (req, res) => {
  try {
    await connectDB();
    const registros = await Registro.find().sort({ dataCriacao: -1 });
    res.json(registros);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar registros', detalhe: erro.message });
  }
});

module.exports.handler = serverless(app);