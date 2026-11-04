// ==========================================
// ESTADO EMOCIONAL DO ESTUDANTE
// ==========================================

let emocaoSelecionada = "";


// ==========================================
// MODO ESCURO / MODO CLARO
// ==========================================

const themeToggle = document.getElementById("themeToggle");

function aplicarTema() {
    const modoEscuro = localStorage.getItem("darkMode") === "true";

    if (modoEscuro) {
        document.body.classList.add("dark");

        if (themeToggle) {
            themeToggle.textContent = "☀️ Modo claro";
        }
    } else {
        document.body.classList.remove("dark");

        if (themeToggle) {
            themeToggle.textContent = "🌙 Modo escuro";
        }
    }
}

aplicarTema();


if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        const modoEscuro =
            document.body.classList.toggle("dark");

        localStorage.setItem(
            "darkMode",
            modoEscuro
        );

        if (modoEscuro) {
            themeToggle.textContent = "☀️ Modo claro";
        } else {
            themeToggle.textContent = "🌙 Modo escuro";
        }

    });

}


// ==========================================
// IR PARA AS EMOÇÕES
// ==========================================

function mostrarEmocoes() {

    const area = document.getElementById("areaEmocoes");

    if (area) {

        area.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ==========================================
// SELECIONAR EMOÇÃO
// ==========================================

function selecionarEmocao(emocao, botao) {

    emocaoSelecionada = emocao;

    // Remove seleção dos outros botões
    const botoes =
        document.querySelectorAll(".emocao");

    botoes.forEach(function (item) {

        item.classList.remove("selecionada");

    });


    // Marca o botão escolhido
    if (botao) {

        botao.classList.add("selecionada");

    }


    // Mostra formulário
    const formulario =
        document.getElementById("formulario");

    if (formulario) {

        formulario.style.display = "block";

        setTimeout(function () {

            formulario.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 100);

    }

}


// ==========================================
// SALVAR REGISTRO (INTEGRADO À NETLIFY / MONGODB)
// ==========================================

async function salvarRegistro() {

    if (!emocaoSelecionada) {

        alert("Escolha uma emoção primeiro.");

        return;

    }


    const mensagemElemento =
        document.getElementById("mensagem");

    const mensagem =
        mensagemElemento
            ? mensagemElemento.value.trim()
            : "";


    // Dados para enviar para o banco de dados online
    const dados = {
        emocao: emocaoSelecionada,
        mensagem: mensagem
    };


    try {
        // Envia os dados para a Netlify Function
        const resposta = await fetch('/.netlify/functions/api/registros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {

            alert("Registro salvo no banco de dados com sucesso! 💙");

            // Limpa o formulário após salvar com sucesso
            emocaoSelecionada = "";

            if (mensagemElemento) {
                mensagemElemento.value = "";
            }

            // Remove seleção dos botões
            const botoes = document.querySelectorAll(".emocao");
            botoes.forEach(function (item) {
                item.classList.remove("selecionada");
            });

            // Esconde o formulário novamente
            const formulario = document.getElementById("formulario");
            if (formulario) {
                formulario.style.display = "none";
            }

        } else {
            alert("❌ Erro ao salvar: " + (resultado.erro || "Tente novamente."));
        }

    } catch (erro) {
        alert("❌ Erro ao conectar com o banco de dados.");
        console.error("Erro na requisição:", erro);
    }

}


// ==========================================
// FUNÇÃO PARA BUSCAR REGISTROS DO BANCO ONLINE
// ==========================================

async function carregarRegistros() {

    try {
        const resposta = await fetch('/.netlify/functions/api/registros');
        if (resposta.ok) {
            const registros = await resposta.json();
            return registros;
        } else {
            console.error("Erro ao carregar registros do banco de dados.");
            return [];
        }
    } catch (erro) {
        console.error("Erro de conexão ao carregar registros:", erro);
        return [];
    }

}