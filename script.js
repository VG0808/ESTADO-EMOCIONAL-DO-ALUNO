let emocaoSelecionada = "";

// 1. Rola a tela até a área das emoções
function mostrarEmocoes() {
    const areaEmocoes = document.getElementById("areaEmocoes");
    if (areaEmocoes) {
        areaEmocoes.scrollIntoView({ behavior: 'smooth' });
    }
}

// 2. Recebe a emoção do botão clicado no HTML
function selecionarEmocao(emocao, elemento) {
    emocaoSelecionada = emocao;

    // Tira o destaque visual dos outros botões
    const botoes = document.querySelectorAll(".emocao");
    botoes.forEach(btn => btn.style.border = "none");

    // Destaca o botão selecionado
    if (elemento) {
        elemento.style.border = "2px solid #4CAF50";
    }

    // Exibe o formulário de mensagem
    const formulario = document.getElementById("formulario");
    if (formulario) {
        formulario.style.display = "block";
    }
}

// 3. Envia os dados para a Netlify Function e salva no MongoDB Atlas
async function salvarRegistro() {
    if (!emocaoSelecionada) {
        alert("Por favor, selecione uma emoção primeiro!");
        return;
    }

    const campoMensagem = document.getElementById("mensagem");
    const textoMensagem = campoMensagem ? campoMensagem.value : "";

    const dados = {
        emocao: emocaoSelecionada,
        mensagem: textoMensagem
    };

    try {
        // Envia para a rota da Netlify Function
        const resposta = await fetch('/.netlify/functions/api/registros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("✅ Sucesso! Registro anônimo salvo no MongoDB Atlas!");
            
            // Limpa o texto e restaura a seleção
            if (campoMensagem) campoMensagem.value = "";
            emocaoSelecionada = "";
            document.querySelectorAll(".emocao").forEach(btn => btn.style.border = "none");
        } else {
            alert("❌ Erro ao salvar: " + (resultado.erro || "Tente novamente."));
        }
    } catch (erro) {
        alert("❌ Erro de conexão com a Netlify Function.");
        console.error(erro);
    }
}