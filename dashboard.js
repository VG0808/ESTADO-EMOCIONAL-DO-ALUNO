// ==========================================
// BANCO DE DADOS - ESTADO EMOCIONAL
// ==========================================


// ==========================================
// MODO ESCURO / MODO CLARO
// ==========================================

const themeToggle = document.getElementById("themeToggle");


function aplicarTema() {

    const modoEscuro =
        localStorage.getItem("darkMode") === "true";


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
// PEGAR REGISTROS
// ==========================================

function obterRegistros() {

    return JSON.parse(
        localStorage.getItem(
            "registrosEmocionais"
        )
    ) || [];

}


// ==========================================
// CARREGAR BANCO
// ==========================================

function carregarDashboard() {

    const registros =
        obterRegistros();


    atualizarTotal(registros);

    atualizarEmocaoMaisRegistrada(registros);

    atualizarUltimoRegistro(registros);

    mostrarTabela(registros);

}


// ==========================================
// TOTAL DE REGISTROS
// ==========================================

function atualizarTotal(registros) {

    const elemento =
        document.getElementById(
            "totalRegistros"
        );


    if (elemento) {

        elemento.textContent =
            registros.length;

    }

}


// ==========================================
// EMOÇÃO MAIS REGISTRADA
// ==========================================

function atualizarEmocaoMaisRegistrada(registros) {

    const elemento =
        document.getElementById(
            "emocaoMaisRegistrada"
        );


    if (!elemento) return;


    if (registros.length === 0) {

        elemento.textContent =
            "Nenhuma";

        return;

    }


    const contagem = {};


    registros.forEach(function (registro) {

        const emocao =
            registro.emocao;


        contagem[emocao] =
            (contagem[emocao] || 0) + 1;

    });


    let emocaoMais = "";

    let maiorQuantidade = 0;


    for (const emocao in contagem) {

        if (
            contagem[emocao] >
            maiorQuantidade
        ) {

            maiorQuantidade =
                contagem[emocao];

            emocaoMais =
                emocao;

        }

    }


    elemento.textContent =
        emocaoMais;

}


// ==========================================
// ÚLTIMO REGISTRO
// ==========================================

function atualizarUltimoRegistro(registros) {

    const elemento =
        document.getElementById(
            "ultimoRegistro"
        );


    if (!elemento) return;


    if (registros.length === 0) {

        elemento.textContent =
            "Nenhum";

        return;

    }


    const ultimo =
        registros[registros.length - 1];


    elemento.textContent =
        ultimo.data +
        " às " +
        ultimo.hora;

}


// ==========================================
// MOSTRAR TABELA
// ==========================================

function mostrarTabela(registros) {

    const tabela =
        document.getElementById(
            "tabelaRegistros"
        );


    if (!tabela) return;


    tabela.innerHTML = "";


    if (registros.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="4" class="sem-registros">
                    Nenhum registro encontrado.
                </td>
            </tr>
        `;

        return;

    }


    // Mais recente primeiro
    registros
        .slice()
        .reverse()
        .forEach(function (registro) {


            const linha =
                document.createElement("tr");


            const data =
                document.createElement("td");

            data.textContent =
                registro.data;


            const hora =
                document.createElement("td");

            hora.textContent =
                registro.hora;


            const emocao =
                document.createElement("td");

            emocao.textContent =
                registro.emocao;


            const mensagem =
                document.createElement("td");

            mensagem.textContent =
                registro.mensagem ||
                "Sem mensagem";


            linha.appendChild(data);

            linha.appendChild(hora);

            linha.appendChild(emocao);

            linha.appendChild(mensagem);


            tabela.appendChild(linha);

        });

}


// ==========================================
// LIMPAR BANCO
// ==========================================

function limparBanco() {

    const registros =
        obterRegistros();


    if (registros.length === 0) {

        alert(
            "O banco de dados já está vazio."
        );

        return;

    }


    const confirmar =
        confirm(
            "Tem certeza que deseja apagar todos os registros?"
        );


    if (!confirmar) return;


    localStorage.removeItem(
        "registrosEmocionais"
    );


    carregarDashboard();


    alert(
        "Todos os registros foram apagados."
    );

}


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarDashboard();

    }
);