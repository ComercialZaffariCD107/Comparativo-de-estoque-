// =====================================================
// =====================================================
// INVENTÁRIO CÍCLICO
//
// "Relatório dentro do relatório": mesma console do
// Comparativo de Estoque, view própria (ver trocarView()
// em script.js). Reaproveita 100% dos helpers globais já
// existentes no script.js: lerTXT(), detectarColuna(),
// normalizarCodigo(), obterPavilhao(), PAVILHOES,
// mostrarLoading()/ocultarLoading().
//
// Entrada: dois TXT do WMS (Velox/Consinco), ambos
// ; delimitado, ISO-8859-1:
//   - Estoque Pulmão:
//     CODDEPOSITO;CODRUA;NROPREDIO;NROAPARTAMENTO;
//     NROSALA;SEQPRODUTO;DESCRICAO;ESPECIEENDERECO;STATUS
//     (uma linha por ENDEREÇO de pulmão, ocupado ou não)
//   - Ruas Fixas:
//     ENDER;SEQPRODUTO;DESCCOMPLETA
//     (ENDER = "DEP.RUA.PREDIO.APTO.SALA", uma linha por
//     endereço FIXO de picking/apanha)
//
// Fluxo: seleciona rua(s) -> imprime folha de contagem
// em branco (sem valores do sistema pra conferir, só
// endereço + produto esperado) pra picking OU pulmão.
// =====================================================
// =====================================================

let icDadosPulmao = [];
let icDadosRuasFixas = [];
let icRuasDisponiveis = []; // [{codigo:"105", pavilhao:"Pavilhão 2"}, ...]

// =====================================
// NOME DOS ARQUIVOS SELECIONADOS
// =====================================

document
.getElementById("icArquivoPulmao")
?.addEventListener("change", function(){

    const arquivo = this.files[0];

    document
    .getElementById("icNomePulmao")
    .innerText =
    arquivo
    ? arquivo.name
    : "Nenhum arquivo selecionado";

});

document
.getElementById("icArquivoRuasFixas")
?.addEventListener("change", function(){

    const arquivo = this.files[0];

    document
    .getElementById("icNomeRuasFixas")
    .innerText =
    arquivo
    ? arquivo.name
    : "Nenhum arquivo selecionado";

});

// =====================================
// PROCESSAMENTO
// =====================================

async function icProcessar(){

    try{

        const arquivoPulmao =
        document
        .getElementById("icArquivoPulmao")
        .files[0];

        const arquivoRuasFixas =
        document
        .getElementById("icArquivoRuasFixas")
        .files[0];

        if(!arquivoPulmao || !arquivoRuasFixas){

            alert(
                "Selecione os dois arquivos: Estoque Pulmão e Ruas Fixas."
            );

            return;

        }

        mostrarLoading();

        const brutoPulmao = await lerTXT(arquivoPulmao);
        const brutoRuasFixas = await lerTXT(arquivoRuasFixas);

        icDadosPulmao = icNormalizarPulmao(brutoPulmao);
        icDadosRuasFixas = icNormalizarRuasFixas(brutoRuasFixas);

        console.log(
            "Inventário Cíclico — Estoque Pulmão:",
            icDadosPulmao.length,
            "| Ruas Fixas:",
            icDadosRuasFixas.length
        );

        icMontarListaDeRuas();
        icPopularFiltroRua();
        icAtualizarResumo();

        ocultarLoading();

    }
    catch(erro){

        console.error(erro);

        ocultarLoading();

        alert(
            "Erro ao processar os arquivos do Inventário Cíclico:\n\n" +
            erro.message +
            "\n\n(detalhe técnico no console, F12)"
        );

    }

}

// =====================================
// NORMALIZAÇÃO DOS DADOS
// =====================================

function icNormalizarPulmao(linhas){

    if(!linhas.length) return [];

    const colRua =
    detectarColuna(linhas[0], ["codrua"]);

    const colPredio =
    detectarColuna(linhas[0], ["nropredio"]);

    const colApto =
    detectarColuna(linhas[0], ["nroapartamento"]);

    const colSala =
    detectarColuna(linhas[0], ["nrosala"]);

    const colSeq =
    detectarColuna(linhas[0], ["seqproduto","codigo","código","sku"]);

    const colDesc =
    detectarColuna(linhas[0], ["descricao","descrição","desccompleta","produto"]);

    const colEspecie =
    detectarColuna(linhas[0], ["especieendereco","especie_end","especie","espécie"]);

    const colStatus =
    detectarColuna(linhas[0], ["status"]);

    if(!colRua){

        alert(
            "Não consegui identificar a coluna CODRUA no arquivo de Estoque Pulmão. Abra o console (F12) e confira as colunas."
        );

        console.log("Colunas Estoque Pulmão:", Object.keys(linhas[0]));

        return [];

    }

    return linhas
    .map(l=>({

        rua: String(l[colRua] ?? "").trim(),

        predio: String(colPredio ? (l[colPredio] ?? "") : "").trim(),

        apto: String(colApto ? (l[colApto] ?? "") : "").trim(),

        sala: String(colSala ? (l[colSala] ?? "") : "").trim(),

        sku: normalizarCodigo(colSeq ? l[colSeq] : ""),

        descricao: String(colDesc ? (l[colDesc] ?? "") : "").trim(),

        especie: String(colEspecie ? (l[colEspecie] ?? "") : "").trim(),

        status: String(colStatus ? (l[colStatus] ?? "") : "").trim()

    }))
    .filter(l=> l.rua !== "")
    // Endereços com status INATIVO não entram no inventário
    // (não aparecem na lista de ruas, KPIs nem na impressão)
    .filter(l=> !icStatusEhInativo(l.status));

}

// Aceita "Inativo", "INATIVO", "Inativa", " inativo " etc.
function icStatusEhInativo(status){

    return String(status ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .startsWith("inativ");

}

function icNormalizarRuasFixas(linhas){

    if(!linhas.length) return [];

    const colEnder =
    detectarColuna(linhas[0], ["ender","endereco","endereço"]);

    const colSeq =
    detectarColuna(linhas[0], ["seqproduto","codigo","código","sku"]);

    const colDesc =
    detectarColuna(linhas[0], ["desccompleta","descricao","descrição","produto"]);

    if(!colEnder){

        alert(
            "Não consegui identificar a coluna ENDER no arquivo de Ruas Fixas. Abra o console (F12) e confira as colunas."
        );

        console.log("Colunas Ruas Fixas:", Object.keys(linhas[0]));

        return [];

    }

    return linhas
    .map(l=>{

        const enderecoBruto =
        String(l[colEnder] ?? "").trim();

        // ENDER = DEPOSITO.RUA.PREDIO.APTO.SALA
        const partes = enderecoBruto.split(".");

        return {

            rua: (partes[1] ?? "").trim(),

            predio: (partes[2] ?? "").trim(),

            apto: (partes[3] ?? "").trim(),

            sala: (partes[4] ?? "").trim(),

            endereco: enderecoBruto,

            sku: normalizarCodigo(colSeq ? l[colSeq] : ""),

            descricao: String(colDesc ? (l[colDesc] ?? "") : "").trim()

        };

    })
    .filter(l=> l.rua !== "");

}

// =====================================
// LISTA DE RUAS (união dos dois arquivos,
// agrupada por pavilhão via obterPavilhao()
// já existente no script.js)
// =====================================

function icMontarListaDeRuas(){

    const codigos = new Set();

    icDadosPulmao.forEach(l=> codigos.add(l.rua));
    icDadosRuasFixas.forEach(l=> codigos.add(l.rua));

    icRuasDisponiveis =
    Array.from(codigos)
    .filter(c=> c !== "")
    .sort((a,b)=>
        a.localeCompare(b, "pt-BR", {numeric:true})
    )
    .map(codigo=>({
        codigo,
        pavilhao: obterPavilhao(codigo)
    }));

}

// =====================================
// FILTRO DE RUA (mesmo padrão visual do
// filtro de rua do Comparativo — dropdown
// com checkboxes agrupados por pavilhão)
// =====================================

function icPopularFiltroRua(){

    const opcoes =
    document.getElementById("icFiltroRuaOpcoes");

    if(!opcoes) return;

    if(!icRuasDisponiveis.length){

        opcoes.innerHTML =
        `<p class="ic-aviso-vazio">Nenhuma rua encontrada nos arquivos carregados.</p>`;

        icAtualizarLabelRua();

        return;

    }

    const marcadasAntes =
    new Set(
        Array.from(
            document.querySelectorAll(".icFiltroRuaItem")
        )
        .filter(chk => chk.checked)
        .map(chk => chk.value)
    );

    const haviaSelecaoAnterior =
    document.querySelectorAll(".icFiltroRuaItem").length > 0;

    let html = `
    <label class="filtro-pavilhao-item filtro-pavilhao-todos">
        <input
            type="checkbox"
            id="icFiltroRuaTodos"
            checked
            onchange="icAlternarTodasRuas(this)">
        Todas as Ruas
    </label>
    <div class="filtro-pavilhao-separador"></div>
    `;

    let pavilhaoAtual = null;

    icRuasDisponiveis.forEach(({codigo, pavilhao})=>{

        if(pavilhao !== pavilhaoAtual){

            pavilhaoAtual = pavilhao;

            html += `<div class="filtro-rua-grupo-titulo-ic">${pavilhao}</div>`;

        }

        const marcado =
        !haviaSelecaoAnterior ||
        marcadasAntes.has(codigo);

        html += `
        <label class="filtro-pavilhao-item">
            <input
                type="checkbox"
                class="icFiltroRuaItem"
                value="${codigo}"
                ${marcado ? "checked" : ""}
                onchange="icAtualizarSelecaoRuas()">
            Rua ${codigo}
        </label>
        `;

    });

    opcoes.innerHTML = html;

    icAtualizarLabelRua();

}

function icToggleRuaDropdown(){

    const opcoes =
    document.getElementById("icFiltroRuaOpcoes");

    if(!opcoes) return;

    opcoes.style.display =
    opcoes.style.display === "none"
    ? "block"
    : "none";

}

document.addEventListener("click", function(e){

    const container =
    document.getElementById("icFiltroRuaMulti");

    const opcoes =
    document.getElementById("icFiltroRuaOpcoes");

    if(container && opcoes && !container.contains(e.target)){

        opcoes.style.display = "none";

    }

});

function icAlternarTodasRuas(chkTodos){

    document
    .querySelectorAll(".icFiltroRuaItem")
    .forEach(chk=>{

        chk.checked = chkTodos.checked;

    });

    icAtualizarLabelRua();
    icAtualizarResumo();

}

function icAtualizarSelecaoRuas(){

    const itens =
    document.querySelectorAll(".icFiltroRuaItem");

    const chkTodos =
    document.getElementById("icFiltroRuaTodos");

    const todosMarcados =
    Array.from(itens)
    .every(chk => chk.checked);

    if(chkTodos){

        chkTodos.checked = todosMarcados;

    }

    icAtualizarLabelRua();
    icAtualizarResumo();

}

function icAtualizarLabelRua(){

    const label =
    document.getElementById("icFiltroRuaLabel");

    if(!label) return;

    const itens =
    Array.from(
        document.querySelectorAll(".icFiltroRuaItem")
    );

    if(!itens.length){

        label.innerText = "Processe os arquivos primeiro";

        return;

    }

    const marcados =
    itens.filter(chk => chk.checked);

    if(marcados.length === 0){

        label.innerText = "Nenhuma Rua";

    }
    else if(marcados.length === itens.length){

        label.innerText = "Todas as Ruas";

    }
    else if(marcados.length <= 3){

        label.innerText =
        marcados
        .map(chk => `Rua ${chk.value}`)
        .join(", ");

    }
    else{

        label.innerText =
        `${marcados.length} ruas selecionadas`;

    }

}

// array vazio = todas marcadas = sem filtro
// (mesma convenção do resto do app)
function icObterRuasFiltroAtual(){

    const itens =
    Array.from(
        document.querySelectorAll(".icFiltroRuaItem")
    );

    if(!itens.length){

        return [];

    }

    const marcados =
    itens.filter(chk => chk.checked);

    if(marcados.length === itens.length){

        return [];

    }

    return marcados.map(chk => chk.value);

}

// =====================================
// DADOS FILTRADOS (picking / pulmão)
// ordenados por endereço (rua.predio.apto.sala)
// =====================================

// Ordem: rua → lado (ÍMPARES primeiro, depois PARES)
// → prédio → apto → sala. O lado é definido pelo número
// do prédio (ex.: 115 = ímpar, 116 = par). Vale para
// Picking e Pulmão (os dois usam este comparador).
function icNumeroOuNaN(valor){

    const n = parseInt(String(valor).trim(), 10);

    return n;

}

function icCompararEndereco(a, b){

    // 1) Rua
    const cmpRua = String(a.rua).localeCompare(
        String(b.rua),
        "pt-BR",
        {numeric:true}
    );

    if(cmpRua !== 0) return cmpRua;

    // 2) Lado: ímpar (0) antes de par (1)
    const predioA = icNumeroOuNaN(a.predio);
    const predioB = icNumeroOuNaN(b.predio);

    const ladoA = (!isNaN(predioA) && predioA % 2 === 0) ? 1 : 0;
    const ladoB = (!isNaN(predioB) && predioB % 2 === 0) ? 1 : 0;

    if(ladoA !== ladoB) return ladoA - ladoB;

    // 3) Prédio → apto → sala (ordem natural crescente)
    const opcoes = {numeric:true};

    return (
        String(a.predio).localeCompare(String(b.predio), "pt-BR", opcoes) ||
        String(a.apto).localeCompare(String(b.apto), "pt-BR", opcoes) ||
        String(a.sala).localeCompare(String(b.sala), "pt-BR", opcoes)
    );

}

// Ordem do PULMÃO: rua → LADO (todo o lado ÍMPAR primeiro, depois
// todo o lado PAR) → ALTURA (crescente) → prédio → apto → sala.
// Altura = dezena do apto (21/22 = 2, 31/32 = 3, 41/42 = 4...).
// Em cada lado, termina a altura 21/22 em todos os prédios antes de
// subir para a 31/32, e assim por diante.
function icCompararEnderecoPulmao(a, b){

    // 1) Rua
    const cmpRua = String(a.rua).localeCompare(
        String(b.rua),
        "pt-BR",
        {numeric:true}
    );

    if(cmpRua !== 0) return cmpRua;

    // 2) Lado: ímpar (0) antes de par (1)
    const predioA = icNumeroOuNaN(a.predio);
    const predioB = icNumeroOuNaN(b.predio);

    const ladoA = (!isNaN(predioA) && predioA % 2 === 0) ? 1 : 0;
    const ladoB = (!isNaN(predioB) && predioB % 2 === 0) ? 1 : 0;

    if(ladoA !== ladoB) return ladoA - ladoB;

    // 3) Altura = dezena do apto, em ordem crescente
    //    (apto sem número vai para o fim)
    const aptoA = icNumeroOuNaN(a.apto);
    const aptoB = icNumeroOuNaN(b.apto);

    const alturaA = isNaN(aptoA) ? Infinity : Math.floor(aptoA / 10);
    const alturaB = isNaN(aptoB) ? Infinity : Math.floor(aptoB / 10);

    if(alturaA !== alturaB) return alturaA < alturaB ? -1 : 1;

    // 4) Prédio → apto → sala (ordem natural crescente)
    const opcoes = {numeric:true};

    return (
        String(a.predio).localeCompare(String(b.predio), "pt-BR", opcoes) ||
        String(a.apto).localeCompare(String(b.apto), "pt-BR", opcoes) ||
        String(a.sala).localeCompare(String(b.sala), "pt-BR", opcoes)
    );

}

function icFiltrarPickings(){

    const ruasFiltro = icObterRuasFiltroAtual();

    return icDadosRuasFixas
    .filter(l=>
        !ruasFiltro.length ||
        ruasFiltro.includes(l.rua)
    )
    .slice()
    .sort(icCompararEndereco);

}

function icFiltrarPulmoes(){

    const ruasFiltro = icObterRuasFiltroAtual();

    return icDadosPulmao
    .filter(l=>
        !ruasFiltro.length ||
        ruasFiltro.includes(l.rua)
    )
    .slice()
    .sort(icCompararEnderecoPulmao);

}

// =====================================
// RESUMO / KPIs (atualiza sempre que a
// seleção de rua muda)
// =====================================

function icAtualizarResumo(){

    const pickings = icFiltrarPickings();
    const pulmoes = icFiltrarPulmoes();

    const ocupados =
    pulmoes.filter(p=>
        p.status.toLowerCase() === "ocupado" ||
        p.status.toLowerCase() === "reservado"
    ).length;

    const disponiveis =
    pulmoes.filter(p=>
        p.status.toLowerCase() === "disponivel" ||
        p.status.toLowerCase() === "disponível"
    ).length;

    setTexto("icKpiPickings", pickings.length);
    setTexto("icKpiPulmoesTotal", pulmoes.length);
    setTexto("icKpiPulmoesOcupados", ocupados);
    setTexto("icKpiPulmoesDisponiveis", disponiveis);

}

// =====================================
// IMPRESSÃO — CABEÇALHO COMUM
// =====================================

function icResumoRuasSelecionadas(){

    const itens =
    Array.from(
        document.querySelectorAll(".icFiltroRuaItem")
    );

    if(!itens.length) return "—";

    const marcados =
    itens.filter(chk => chk.checked);

    if(!marcados.length) return "Nenhuma rua selecionada";

    if(marcados.length === itens.length) return "Todas as ruas";

    return marcados.map(chk => chk.value).join(", ");

}

function icAbrirJanelaImpressao(){

    const janela = window.open("", "_blank");

    if(!janela){

        alert("Permita pop-ups para este site.");

        return null;

    }

    return janela;

}

// =====================================
// IMPRESSÃO — PICKING (APANHA)
// =====================================

function icImprimirPickings(){

    if(!icDadosRuasFixas.length){

        alert(
            "Processe os arquivos do Inventário Cíclico antes de imprimir."
        );

        return;

    }

    const dados = icFiltrarPickings();

    if(!dados.length){

        alert(
            "Nenhum endereço de picking encontrado para a(s) rua(s) selecionada(s)."
        );

        return;

    }

    const janela = icAbrirJanelaImpressao();

    if(!janela) return;

    let linhasHtml = "";
    let ruaAtualImpressao = null;

    dados.forEach(item=>{

        if(item.rua !== ruaAtualImpressao){

            ruaAtualImpressao = item.rua;

            linhasHtml += `
            <tr class="grupo-rua">
                <td colspan="4">Rua ${item.rua}</td>
            </tr>
            `;

        }

        linhasHtml += `
        <tr>
            <td class="tag">${item.rua}.${item.predio}.${item.apto}.${item.sala}</td>
            <td class="centro">${item.sku || "—"}</td>
            <td>${item.descricao || "—"}</td>
            <td class="qtd"><input type="text" class="input-contagem"></td>
        </tr>
        `;

    });

    const html = icMontarHtmlImpressao({

        titulo: "📋 INVENTÁRIO CÍCLICO — PICKING (APANHA)",

        subtitulo: "Comercial Zaffari · CD-107 · Nova Santa Rita/RS",

        total: dados.length,

        cabecalhoColunas: `
        <th>Endereço</th>
        <th class="centro">SKU</th>
        <th>Descrição</th>
        <th class="centro">Qtd. Contada</th>
        `,

        linhasHtml

    });

    janela.document.open();
    janela.document.write(html);
    janela.document.close();
    janela.focus();

}

// =====================================
// IMPRESSÃO — PULMÃO
// =====================================

function icImprimirPulmoes(){

    if(!icDadosPulmao.length){

        alert(
            "Processe os arquivos do Inventário Cíclico antes de imprimir."
        );

        return;

    }

    const dados = icFiltrarPulmoes();

    if(!dados.length){

        alert(
            "Nenhum endereço de pulmão encontrado para a(s) rua(s) selecionada(s)."
        );

        return;

    }

    const janela = icAbrirJanelaImpressao();

    if(!janela) return;

    let linhasHtml = "";
    let ruaAtualImpressao = null;

    dados.forEach(item=>{

        if(item.rua !== ruaAtualImpressao){

            ruaAtualImpressao = item.rua;

            linhasHtml += `
            <tr class="grupo-rua">
                <td colspan="5">Rua ${item.rua}</td>
            </tr>
            `;

        }

        const statusClasse =
        `status-${item.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}`;

        linhasHtml += `
        <tr>
            <td class="tag">${item.rua}.${item.predio}.${item.apto}.${item.sala}</td>
            <td class="centro"><span class="status-pill ${statusClasse}">${item.status || "—"}</span></td>
            <td class="centro">${item.sku || "—"}</td>
            <td>${item.descricao || "—"}</td>
            <td class="qtd"><input type="text" class="input-contagem"></td>
        </tr>
        `;

    });

    const html = icMontarHtmlImpressao({

        titulo: "📦 INVENTÁRIO CÍCLICO — PULMÃO",

        subtitulo: "Comercial Zaffari · CD-107 · Nova Santa Rita/RS",

        total: dados.length,

        cabecalhoColunas: `
        <th>Endereço</th>
        <th class="centro">Status</th>
        <th class="centro">SKU</th>
        <th>Descrição</th>
        <th class="centro">Qtd. Contada</th>
        `,

        linhasHtml

    });

    janela.document.open();
    janela.document.write(html);
    janela.document.close();
    janela.focus();

}

// =====================================
// MONTAGEM DO HTML DE IMPRESSÃO
// (folha de contagem em branco — sem
// valor do sistema pra comparar, já que
// nenhum dos dois arquivos traz
// quantidade; só endereço + produto
// esperado + espaço pro conferente
// escrever a contagem física)
// =====================================

function icMontarHtmlImpressao({titulo, subtitulo, total, cabecalhoColunas, linhasHtml}){

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<style>

@page{
    size:A4 portrait;
    margin:10mm;
}

*{
    box-sizing:border-box;
}

body{
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
    margin:0;
}

h1{
    margin:0 0 4px 0;
    text-align:center;
    color:#1e3a8a;
    font-size:17px;
}

h2.subtitulo{
    margin:0 0 14px 0;
    text-align:center;
    color:#6b7280;
    font-size:11px;
    font-weight:normal;
    text-transform:uppercase;
    letter-spacing:.04em;
}

.info{
    display:flex;
    justify-content:space-between;
    flex-wrap:wrap;
    gap:8px;
    margin-bottom:6px;
    padding-bottom:10px;
    border-bottom:1px solid #d9d9d9;
    font-size:12px;
}

.info b{
    color:#1e3a8a;
}

.assinatura{
    display:flex;
    justify-content:space-between;
    gap:28px;
    margin:16px 0 14px;
    font-size:12px;
}

.assinatura div.lote{
    flex:.7;
}

.assinatura div{
    flex:1;
    border-top:1px solid #999;
    padding-top:4px;
    text-align:center;
    color:#6b7280;
}

table.itens{
    width:100%;
    border-collapse:collapse;
    font-size:11.5px;
}

table.itens th{
    text-align:left;
    font-size:9px;
    text-transform:uppercase;
    letter-spacing:.03em;
    color:#6b7280;
    padding:6px;
    border-bottom:2px solid #1e3a8a;
    position:sticky;
    top:0;
    background:#fff;
}

table.itens td{
    padding:6px;
    border-bottom:1px solid #eee;
    vertical-align:middle;
}

table.itens td.tag{
    font-weight:bold;
    color:#1e3a8a;
    white-space:nowrap;
}

table.itens td.centro{
    text-align:center;
}

table.itens tr.grupo-rua td{
    background:#eef1f8;
    font-weight:bold;
    color:#0E1B3D;
    font-size:11px;
    padding:6px 8px;
    border-bottom:1px solid #c7cfe6;
    border-top:1px solid #c7cfe6;
}

table.itens tr.grupo-rua:first-child td{
    border-top:none;
}

td.qtd{
    width:100px;
}

.input-contagem{
    width:100%;
    min-width:80px;
    border:none;
    border-bottom:1.4px solid #999;
    text-align:center;
    font-size:12px;
    font-family:inherit;
    padding:3px 4px;
    background:transparent;
}

.status-pill{
    display:inline-block;
    font-size:9.5px;
    font-weight:bold;
    padding:2px 7px;
    border-radius:9px;
    background:#f3f4f6;
    color:#444;
    white-space:nowrap;
}

.status-pill.status-ocupado{ background:#e4ecf9; color:#2E63A8; }
.status-pill.status-reservado{ background:#fcefdd; color:#b06e00; }
.status-pill.status-disponivel{ background:#e3f7ec; color:#1E9E5C; }
.status-pill.status-bloqueado{ background:#fbe6e8; color:#D9333F; }
.status-pill.status-inativo{ background:#f0f0f0; color:#888; }

.toolbar{
    display:flex;
    justify-content:flex-end;
    gap:8px;
    margin-bottom:12px;
}

.btn-imprimir{
    background:#0E1B3D;
    color:#fff;
    border:none;
    padding:9px 18px;
    border-radius:6px;
    font-size:13px;
    font-weight:bold;
    font-family:inherit;
    cursor:pointer;
}

@media print{

    .toolbar{
        display:none;
    }

    table.itens tr.grupo-rua td{
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
    }

    .status-pill{
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
    }

    table.itens{
        page-break-inside:auto;
    }

    table.itens tr{
        page-break-inside:avoid;
    }

}

</style>
</head>
<body>

<div class="toolbar">
    <button class="btn-imprimir" onclick="window.print()">🖨️ Imprimir</button>
</div>

<h1>${titulo}</h1>
<h2 class="subtitulo">${subtitulo}</h2>

<div class="info">
    <div><b>Data:</b> ${new Date().toLocaleString("pt-BR")}</div>
    <div><b>Rua(s):</b> ${icResumoRuasSelecionadas()}</div>
    <div><b>Total de endereços:</b> ${total}</div>
</div>

<div class="assinatura">
    <div class="lote">Lote</div>
    <div>Conferente</div>
    <div>Visto Liderança</div>
</div>

<table class="itens">
<thead>
<tr>
${cabecalhoColunas}
</tr>
</thead>
<tbody>
${linhasHtml}
</tbody>
</table>

</body>
</html>
`;

}
