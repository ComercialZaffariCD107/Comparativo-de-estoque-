// =====================================
// VARIÁVEIS GLOBAIS
// =====================================

let dadosPosicoes = [];
let dadosDiferenca = [];
let dadosValores = [];
let resultado = [];

// =====================================
// CONFIGURAÇÃO DE PAVILHÕES
// =====================================
// Mesma referência oficial usada no Gerador de Abastecimento PCP
// (Perecível.txt, Pavilhão_1.txt, Pavilhão_2.txt, Pavilhão_3.txt).
// O pavilhão de cada SKU é definido pela Rua (CODRUA) da posição
// de apanha.

const PAVILHOES = [

    {
        nome:"Perecível",
        ruas:[
            [26,27],
            [29,31],
        ],
    },
    {
        nome:"Pavilhão 1",
        ruas:[
            [3,14],
            [21,24],
            [51,65],
        ],
    },
    {
        nome:"Pavilhão 2",
        ruas:[
            [71,106],
        ],
    },
    {
        nome:"Pavilhão 3",
        ruas:[
            [311,317],
        ],
    },

];

function obterPavilhao(rua){

    const r = Number(rua) || 0;

    const encontrado =
    PAVILHOES.find(p =>
        p.ruas.some(([ruaInicio, ruaFim]) =>
            r >= ruaInicio &&
            r <= ruaFim
        )
    );

    return encontrado
    ? encontrado.nome
    : "Sem Pavilhão";

}

function popularFiltroPavilhao(){

    const opcoes =
    document.getElementById("filtroPavilhaoOpcoes");

    if(!opcoes) return;

    const nomes =
    PAVILHOES
    .map(p => p.nome)
    .concat(["Sem Pavilhão"]);

    let html = `
    <label class="filtro-pavilhao-item filtro-pavilhao-todos">
        <input
            type="checkbox"
            id="filtroPavilhaoTodos"
            checked
            onchange="alternarTodosPavilhoes(this)">
        Todos Pavilhões
    </label>
    <div class="filtro-pavilhao-separador"></div>
    `;

    nomes.forEach(nome=>{

        html += `
        <label class="filtro-pavilhao-item">
            <input
                type="checkbox"
                class="filtroPavilhaoItem"
                value="${nome}"
                checked
                onchange="atualizarSelecaoPavilhoes()">
            ${nome}
        </label>
        `;

    });

    opcoes.innerHTML = html;

    atualizarLabelPavilhao();

}

function togglePavilhaoDropdown(){

    const opcoes =
    document.getElementById("filtroPavilhaoOpcoes");

    if(!opcoes) return;

    opcoes.style.display =
    opcoes.style.display === "none"
    ? "block"
    : "none";

}

document.addEventListener("click", function(e){

    const container =
    document.getElementById("filtroPavilhaoMulti");

    const opcoes =
    document.getElementById("filtroPavilhaoOpcoes");

    if(container && opcoes && !container.contains(e.target)){

        opcoes.style.display = "none";

    }

    const containerRua =
    document.getElementById("filtroRuaMulti");

    const opcoesRua =
    document.getElementById("filtroRuaOpcoes");

    if(containerRua && opcoesRua && !containerRua.contains(e.target)){

        opcoesRua.style.display = "none";

    }

    const containerSku =
    document.getElementById("filtroSkuMulti");

    const opcoesSku =
    document.getElementById("filtroSkuOpcoes");

    if(containerSku && opcoesSku && !containerSku.contains(e.target)){

        opcoesSku.style.display = "none";

    }

});

function alternarTodosPavilhoes(chkTodos){

    document
    .querySelectorAll(".filtroPavilhaoItem")
    .forEach(chk=>{

        chk.checked = chkTodos.checked;

    });

    atualizarLabelPavilhao();

    if(typeof aplicarFiltros === "function"){

        aplicarFiltros();

    }

}

function atualizarSelecaoPavilhoes(){

    const itens =
    document.querySelectorAll(".filtroPavilhaoItem");

    const chkTodos =
    document.getElementById("filtroPavilhaoTodos");

    const todosMarcados =
    Array.from(itens)
    .every(chk => chk.checked);

    if(chkTodos){

        chkTodos.checked = todosMarcados;

    }

    atualizarLabelPavilhao();

    if(typeof aplicarFiltros === "function"){

        aplicarFiltros();

    }

}

function atualizarLabelPavilhao(){

    const label =
    document.getElementById("filtroPavilhaoLabel");

    if(!label) return;

    const itens =
    Array.from(
        document.querySelectorAll(".filtroPavilhaoItem")
    );

    const marcados =
    itens.filter(chk => chk.checked);

    if(marcados.length === 0){

        label.innerText = "Nenhum Pavilhão";

    }
    else if(marcados.length === itens.length){

        label.innerText = "Todos Pavilhões";

    }
    else{

        label.innerText =
        marcados
        .map(chk => chk.value)
        .join(", ");

    }

}

// Array vazio = todos marcados = sem filtro (mesmo
// comportamento de antes de existir o filtro de pavilhão).
function obterPavilhoesFiltroAtual(){

    const itens =
    Array.from(
        document.querySelectorAll(".filtroPavilhaoItem")
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
// FILTRO DE RUA (mesmo padrão do
// filtro de pavilhão, com checkboxes
// agrupados por pavilhão)
// =====================================

function toggleRuaDropdown(){

    const opcoes =
    document.getElementById("filtroRuaOpcoes");

    if(!opcoes) return;

    opcoes.style.display =
    opcoes.style.display === "none"
    ? "block"
    : "none";

}

function alternarTodasRuas(chkTodos){

    document
    .querySelectorAll(".filtroRuaItem")
    .forEach(chk=>{

        chk.checked = chkTodos.checked;

    });

    atualizarLabelRua();

    if(typeof aplicarFiltros === "function"){

        aplicarFiltros();

    }

}

function atualizarSelecaoRuas(){

    const itens =
    document.querySelectorAll(".filtroRuaItem");

    const chkTodos =
    document.getElementById("filtroRuaTodos");

    const todosMarcados =
    Array.from(itens)
    .every(chk => chk.checked);

    if(chkTodos){

        chkTodos.checked = todosMarcados;

    }

    atualizarLabelRua();

    if(typeof aplicarFiltros === "function"){

        aplicarFiltros();

    }

}

function atualizarLabelRua(){

    const label =
    document.getElementById("filtroRuaLabel");

    if(!label) return;

    const itens =
    Array.from(
        document.querySelectorAll(".filtroRuaItem")
    );

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

// Array vazio = todas marcadas = sem filtro (mesmo
// comportamento do filtro de pavilhão).
function obterRuasFiltroAtual(){

    const itens =
    Array.from(
        document.querySelectorAll(".filtroRuaItem")
    );

    if(!itens.length){

        return [];

    }

    const marcados =
    itens.filter(chk => chk.checked);

    if(marcados.length === itens.length){

        return [];

    }

    return marcados.map(chk => Number(chk.value));

}

popularFiltroPavilhao();
popularFiltroRua();

// =====================================
// INICIALIZAÇÃO — NOME DOS ARQUIVOS
// =====================================

document
.getElementById("arquivoPosicoes")
?.addEventListener("change", function(){

    const arquivo = this.files[0];

    document
    .getElementById("nomePosicoes")
    .innerText =
    arquivo
    ? arquivo.name
    : "Nenhum arquivo selecionado";

});

document
.getElementById("arquivoDiferenca")
?.addEventListener("change", function(){

    const arquivo = this.files[0];

    document
    .getElementById("nomeDiferenca")
    .innerText =
    arquivo
    ? arquivo.name
    : "Nenhum arquivo selecionado";

});

document
.getElementById("arquivoValores")
?.addEventListener("change", function(){

    const arquivo = this.files[0];

    document
    .getElementById("nomeValores")
    .innerText =
    arquivo
    ? arquivo.name
    : "Nenhum arquivo selecionado";

});

// =====================================
// LOADING
// =====================================

function mostrarLoading(){

    document
    .getElementById("loading")
    .style.display = "flex";

}

function ocultarLoading(){

    document
    .getElementById("loading")
    .style.display = "none";

}

// =====================================
// PROCESSAMENTO PRINCIPAL
// =====================================

async function processar(){

    try{

        mostrarLoading();

        const arquivoPosicoes =
        document
        .getElementById("arquivoPosicoes")
        .files[0];

        const arquivoDiferenca =
        document
        .getElementById("arquivoDiferenca")
        .files[0];

        const arquivoValores =
        document
        .getElementById("arquivoValores")
        ?.files[0];

        if(
            !arquivoPosicoes ||
            !arquivoDiferenca
        ){

            alert(
                "Selecione ao menos os arquivos de Posição de Endereços e Diferença de Estoque."
            );

            ocultarLoading();

            return;

        }

        dadosPosicoes =
        await lerTXT(arquivoPosicoes);

        dadosDiferenca =
        await lerTXT(arquivoDiferenca);

        dadosValores =
        arquivoValores
        ? await lerTXT(arquivoValores)
        : [];

        console.log(
            "Posições carregadas:",
            dadosPosicoes.length,
            Object.keys(dadosPosicoes[0] || {})
        );

        console.log(
            "Diferença carregada:",
            dadosDiferenca.length,
            Object.keys(dadosDiferenca[0] || {})
        );

        console.log(
            "Valores carregados:",
            dadosValores.length,
            Object.keys(dadosValores[0] || {})
        );

        gerarComparativo();

        ocultarLoading();

    }

    catch(erro){

        console.error(erro);

        ocultarLoading();

        alert(
            "Erro ao processar arquivos:\n\n" +
            erro.message +
            "\n\n(detalhe técnico no console, F12)"
        );

    }

}

// =====================================
// LEITURA TXT/CSV (mesmo padrão do
// Gerador de Abastecimento — arquivos
// exportados nesse formato costumam
// vir em ISO-8859-1, com acentos)
// =====================================

function lerTXT(arquivo){

    return new Promise((resolve,reject)=>{

        Papa.parse(
            arquivo,
            {

                header:true,

                delimiter:";",

                skipEmptyLines:true,

                encoding:"ISO-8859-1",

                complete:r=>{

                    resolve(r.data);

                },

                error:erro=>{

                    reject(erro);

                }

            }

        );

    });

}

// =====================================
// HELPERS
// =====================================

function normalizarCodigo(valor){

    return String(valor ?? "")
    .replace(",00","")
    .replace(".00","")
    .trim();

}

// converte número em formato PT-BR
// ("1.234,56" ou "7,4200") pra Number.
// retorna null se não der pra converter

function parseNumeroPtBR(valor){

    if(valor === null || valor === undefined){

        return null;

    }

    const limpo = String(valor).trim();

    if(limpo === ""){

        return null;

    }

    const normalizado =
    limpo
    .replace(/\./g,"")
    .replace(",",".");

    const numero = Number(normalizado);

    return isNaN(numero) ? null : numero;

}

// tenta achar, num objeto de dados, a
// coluna certa a partir de uma lista de
// nomes possíveis (evita quebrar se o
// arquivo vier com cabeçalho levemente
// diferente no futuro)

function detectarColuna(objeto, candidatos){

    if(!objeto){

        return null;

    }

    const chaves = Object.keys(objeto);

    for(const candidato of candidatos){

        const exato =
        chaves.find(
            k => k.toLowerCase().trim() === candidato.toLowerCase()
        );

        if(exato){

            return exato;

        }

    }

    for(const candidato of candidatos){

        const parcial =
        chaves.find(
            k => k.toLowerCase().includes(candidato.toLowerCase())
        );

        if(parcial){

            return parcial;

        }

    }

    return null;

}

// =====================================
// GERAR COMPARATIVO
// =====================================

function gerarComparativo(){

    resultado = [];

    if(!dadosDiferenca.length){

        alert(
            "O arquivo de diferença de estoque está vazio."
        );

        return;

    }

    const colSku =
    detectarColuna(
        dadosDiferenca[0],
        ["seqproduto","codigo","código","sku","cod"]
    );

    const colDescricao =
    detectarColuna(
        dadosDiferenca[0],
        ["desccompleta","descricao","descrição","produto"]
    );

    const colDiferenca =
    detectarColuna(
        dadosDiferenca[0],
        ["dif_estoque","diferenca","diferença"]
    );

    const colStatus =
    detectarColuna(
        dadosDiferenca[0],
        ["status"]
    );

    if(!colSku){

        alert(
            "Não consegui identificar a coluna do código do produto no arquivo de diferença. Abra o console (F12) e me mande os nomes das colunas que aparecem lá."
        );

        console.log(
            "Colunas disponíveis:",
            Object.keys(dadosDiferenca[0])
        );

        return;

    }

    // =====================================
    // MAPAS DE APANHA E PULMÃO
    // (uma única passada pelas posições,
    // sem laço aninhado — arquivo pode
    // ter centenas de milhares de linhas)
    // =====================================

    // =====================================
    // MAPA DE VALOR POR UNIDADE
    // (arquivo "Análise ABC do Estoque":
    // Código Produto -> Cto Bruto Unitário)
    // =====================================

    const colCodigoValor =
    detectarColuna(
        dadosValores[0],
        ["código produto","codigo produto","código","codigo"]
    );

    const colValorUnitario =
    detectarColuna(
        dadosValores[0],
        ["cto bruto unitário","custo bruto unitário","cto bruto unitario","custo bruto unitario"]
    );

    const mapaValores = Object.create(null);

    if(colCodigoValor && colValorUnitario){

        dadosValores.forEach(v=>{

            const codigo =
            normalizarCodigo(v[colCodigoValor]);

            if(!codigo){

                return;

            }

            mapaValores[codigo] =
            parseNumeroPtBR(v[colValorUnitario]);

        });

    }
    else if(dadosValores.length){

        console.log(
            "Não consegui identificar as colunas do arquivo de valores. Colunas disponíveis:",
            Object.keys(dadosValores[0])
        );

    }

    const mapaApanhas = Object.create(null);

    const mapaPulmoes = Object.create(null);

    dadosPosicoes.forEach(p=>{

        const codigo =
        normalizarCodigo(p.CODIGO);

        if(!codigo){

            return;

        }

        const especie =
        String(p.ESPECIE_END || "")
        .toUpperCase()
        .trim();

        if(

            especie.includes("APANHA") &&
            !mapaApanhas[codigo]

        ){

            mapaApanhas[codigo] = p;

        }

        if(especie.includes("PULM")){

            if(!mapaPulmoes[codigo]){

                mapaPulmoes[codigo] = [];

            }

            mapaPulmoes[codigo].push(p);

        }

    });

    // =====================================
    // SÓ OS ITENS QUE APARECEM NA
    // SEGUNDA PLANILHA (diferença estoque)
    // =====================================

    const vistos = new Set();

    dadosDiferenca.forEach(linha=>{

        const sku =
        normalizarCodigo(linha[colSku]);

        if(!sku || vistos.has(sku)){

            return;

        }

        vistos.add(sku);

        const posicaoApanha =
        mapaApanhas[sku];

        const enderecoApanha =
        posicaoApanha
        ? `${posicaoApanha.CODRUA}.${posicaoApanha.NROPREDIO}.${posicaoApanha.NROAPARTAMENTO}.${posicaoApanha.NROSALA}`
        : null;

        const pulmoesBrutos =
        mapaPulmoes[sku] || [];

        const pulmoes =
        pulmoesBrutos.map(p=>({

            endereco:
            `${p.CODRUA}.${p.NROPREDIO}.${p.NROAPARTAMENTO}.${p.NROSALA}`,

            quantidade:
            Number(p.QTD_END || 0),

            embalagem:
            Number(p.EMBALAGEM || 0)

        }));

        // EMBALAGEM = quantidade de unidades por caixa desse SKU.
        // É um atributo do produto, então pega da posição de apanha
        // primeiro; se não tiver (ou vier 0/1), tenta achar nos
        // pulmões. Se nada tiver embalagem > 1, o item é
        // considerado "de fato contado por unidade" (embalagem 1).

        const embalagemApanha =
        Number(posicaoApanha?.EMBALAGEM || 0);

        const embalagemItem =
        embalagemApanha > 1
        ? embalagemApanha
        : (pulmoes.find(p=>p.embalagem > 1)?.embalagem || embalagemApanha || 1);

        const valorUnitario =
        mapaValores[sku] ?? null;

        const diferencaNum =
        colDiferenca
        ? parseNumeroPtBR(linha[colDiferenca])
        : null;

        // impacto financeiro da divergência:
        // quantidade divergente (comercial vs CD)
        // multiplicada pelo custo unitário.
        // positivo = ganho (sobra) / negativo = perda (falta)

        const valorDivergencia =
        (valorUnitario !== null && diferencaNum !== null)
        ? diferencaNum * valorUnitario
        : null;

        resultado.push({

            sku,

            descricao:
            colDescricao
            ? String(linha[colDescricao] || "").trim()
            : "",

            diferenca:
            colDiferenca
            ? linha[colDiferenca]
            : null,

            status:
            colStatus
            ? linha[colStatus]
            : null,

            enderecoApanha,

            pavilhao:
            obterPavilhao(posicaoApanha?.CODRUA),

            pulmoes,

            qtdPulmoes: pulmoes.length,

            embalagem: embalagemItem,

            valorUnitario,

            valorDivergencia

        });

    });

    resultado.sort(
        (a,b)=>a.sku.localeCompare(
            b.sku,
            "pt-BR",
            {numeric:true}
        )
    );

    console.log(
        "Itens no comparativo:",
        resultado.length
    );

    // cada etapa isolada: se uma falhar, avisa no
    // console qual foi (em vez de travar tudo e
    // cair só no "erro genérico"), e as outras
    // etapas continuam rodando normalmente

    try{
        atualizarKPIs();
    }
    catch(erro){
        console.error("Falha em atualizarKPIs():", erro);
    }

    try{
        popularFiltroRua();
    }
    catch(erro){
        console.error("Falha em popularFiltroRua():", erro);
    }

    try{
        popularFiltroSku();
    }
    catch(erro){
        console.error("Falha em popularFiltroSku():", erro);
    }

    try{
        renderizarCards();
    }
    catch(erro){
        console.error("Falha em renderizarCards():", erro);
        throw erro;
    }

    try{
        salvarResumoPainelGeral();
    }
    catch(erro){
        console.error("Falha em salvarResumoPainelGeral():", erro);
    }

}

// =====================================
// RESUMO PRO PAINEL GERAL (VISÃO GERAL)
// =====================================

function salvarResumoPainelGeral(){

    try{

        const resumo = {

            atualizadoEm: new Date().toISOString(),

            totalItens: resultado.length,

            semApanha: resultado.filter(
                x=>!x.enderecoApanha
            ).length,

            semPulmao: resultado.filter(
                x=>x.qtdPulmoes===0
            ).length,

            totalPulmoes: resultado.reduce(
                (s,x)=>s+x.qtdPulmoes,
                0
            ),

            diferencasNegativas: resultado.filter(
                x=>Number(x.diferenca) < 0
            ).length

        };

        localStorage.setItem(
            "painelGeral_comparativo",
            JSON.stringify(resumo)
        );

    }

    catch(erro){

        console.error(
            "Não consegui salvar o resumo pro painel geral:",
            erro
        );

    }

}

// =====================================
// KPIs
// =====================================

// escreve texto num elemento só se ele existir —
// evita que um elemento faltando (ex: index.html
// desatualizado) quebre o processamento inteiro
// e dispare o alerta de erro mesmo com dados ok

function setTexto(id, valor){

    const elemento =
    document.getElementById(id);

    if(!elemento){

        console.warn(
            `Elemento #${id} não encontrado no HTML (verifique se o index.html está atualizado).`
        );

        return;

    }

    elemento.innerText = valor;

}

// formata moeda completa, sempre com 2 casas
// (usada nos cards de item, impressão e WhatsApp,
// onde tem espaço de sobra)

function formatarMoeda(valor){

    return valor.toLocaleString(
        "pt-BR",
        {style:"currency",currency:"BRL"}
    );

}

// formata moeda compacta ("R$ 1,5 mi", "R$ 468,7 mil")
// usada só nos KPIs do topo, que têm largura fixa
// e estouram com números grandes

function formatarMoedaCompacta(valor){

    return valor.toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL",
            notation:"compact",
            maximumFractionDigits:1
        }
    );

}

// escreve um valor em R$ num KPI já formatado de forma
// compacta, mas guarda o valor cheio no title (tooltip
// ao passar o mouse) pra não perder a precisão

function setTextoMoeda(id, valor){

    const elemento =
    document.getElementById(id);

    if(!elemento){

        console.warn(
            `Elemento #${id} não encontrado no HTML (verifique se o index.html está atualizado).`
        );

        return;

    }

    elemento.innerText =
    formatarMoedaCompacta(valor);

    elemento.title =
    formatarMoeda(valor);

}

function atualizarKPIs(){

    setTexto(
        "kpiTotal",
        resultado.length
    );

    setTexto(
        "kpiSemApanha",
        resultado.filter(x=>!x.enderecoApanha).length
    );

    setTexto(
        "kpiSemPulmao",
        resultado.filter(x=>x.qtdPulmoes === 0).length
    );

    setTexto(
        "kpiTotalPulmoes",
        resultado.reduce((s,x)=>s + x.qtdPulmoes, 0)
    );

    setTexto(
        "kpiUm",
        resultado.filter(x=>x.qtdPulmoes === 1).length
    );

    setTexto(
        "kpiDois",
        resultado.filter(x=>x.qtdPulmoes === 2).length
    );

    setTexto(
        "kpiTres",
        resultado.filter(x=>x.qtdPulmoes === 3).length
    );

    setTexto(
        "kpiQuatroMais",
        resultado.filter(x=>x.qtdPulmoes >= 4).length
    );

    const valorGanho =
    resultado
    .filter(x=>typeof x.valorDivergencia === "number" && !isNaN(x.valorDivergencia) && x.valorDivergencia > 0)
    .reduce((s,x)=>s + x.valorDivergencia, 0);

    const valorPerda =
    resultado
    .filter(x=>typeof x.valorDivergencia === "number" && !isNaN(x.valorDivergencia) && x.valorDivergencia < 0)
    .reduce((s,x)=>s + Math.abs(x.valorDivergencia), 0);

    setTextoMoeda(
        "kpiValorGanho",
        valorGanho
    );

    setTextoMoeda(
        "kpiValorPerda",
        valorPerda
    );

    // valor absoluto: soma do ganho com a perda,
    // representa o impacto financeiro total das
    // divergências, sem compensar um lado com o outro

    const valorAbsoluto =
    valorGanho + valorPerda;

    setTextoMoeda(
        "kpiValorAbsoluto",
        valorAbsoluto
    );

}

// =====================================
// RENDERIZAR CARDS
// =====================================

function renderizarCards(dados = resultado){

    const container =
    document.getElementById("cardsContainer");

    if(!dados.length){

        container.innerHTML =
        `<p style="text-align:center;color:#6b7280;padding:40px;grid-column:1/-1;">
        Nenhum item encontrado com esses filtros.
        </p>`;

        return;

    }

    let html = "";

    dados.forEach(item=>{

        // monta a lista de endereços do item: apanha
        // primeiro (sem qtd. de sistema fixa), depois
        // cada pulmão com sua quantidade de sistema.
        // a conferência física (Qtd. Encontrada) só existe
        // na impressão agora — aqui na tela é só consulta

        const linhasEndereco = [];

        if(item.enderecoApanha){

            linhasEndereco.push({
                endereco: item.enderecoApanha,
                tipo: "Apanha",
                qtdSistema: null
            });

        }

        item.pulmoes.forEach(p=>{

            linhasEndereco.push({
                endereco: p.endereco,
                tipo: "Pulmão",
                qtdSistema: p.quantidade
            });

        });

        const enderecosHtml =

        linhasEndereco.length

        ? linhasEndereco.map(l=>{

            const semQtd = l.qtdSistema === null || l.qtdSistema === undefined;

            return `
                <div class="endereco-linha ${l.tipo === "Apanha" ? "linha-apanha" : ""} ${semQtd ? "linha-vazia" : ""}">
                    <span class="endereco-tag">${l.endereco}</span>
                    <span class="endereco-tipo ${l.tipo === "Apanha" ? "tipo-apanha" : ""}">${l.tipo}</span>
                    <span class="qtd-sistema">${semQtd ? "—" : l.qtdSistema}</span>
                </div>`;

          }).join("")

        : `<div class="endereco-linha linha-vazia">
                <span class="endereco-tag">—</span>
                <span class="endereco-tipo">Sem endereço</span>
                <span class="qtd-sistema">—</span>
            </div>`;

        let diferencaHtml = "";

        if(

            item.diferenca !== null &&
            item.diferenca !== undefined &&
            item.diferenca !== ""

        ){

            const valor = Number(item.diferenca);

            const classe =
            valor < 0
            ? "negativa"
            : valor > 0
            ? "positiva"
            : "neutra";

            diferencaHtml =
            `<span class="badge-diferenca ${classe}">Diferença: ${item.diferenca}</span>`;

        }

        let statusClasse = "item-card--ok";

        if(!item.enderecoApanha){

            statusClasse = "item-card--critico";

        }
        else if(item.qtdPulmoes === 0){

            statusClasse = "item-card--atencao";

        }

        html += `
        <div class="item-card ${statusClasse}">

            <div class="item-card-header">

                <div class="item-card-titulo">

                    <span class="item-sku">
                        #${item.sku}
                    </span>

                    <span class="item-descricao">
                        ${item.descricao || "Sem descrição"}
                    </span>

                </div>

                ${diferencaHtml}

            </div>

            <div class="item-card-body">

                <div class="enderecos-tabela">

                    <div class="enderecos-cabecalho">
                        <span>Endereço</span>
                        <span>Tipo</span>
                        <span>Qtd. Sistema</span>
                    </div>

                    ${enderecosHtml}

                </div>

                ${
                    typeof item.valorUnitario === "number" && !isNaN(item.valorUnitario)
                    ? `
                <div class="item-linha">

                    <span class="item-label">
                        💲 Valor Unitário
                    </span>

                    <span class="item-valor">
                        ${formatarMoeda(item.valorUnitario)}
                    </span>

                </div>
                    `
                    : ""
                }

                ${
                    typeof item.valorDivergencia === "number" && !isNaN(item.valorDivergencia)
                    ? `
                <div class="item-linha">

                    <span class="item-label">
                        ${item.valorDivergencia >= 0 ? "📈 Impacto (Ganho)" : "📉 Impacto (Perda)"}
                    </span>

                    <span class="item-valor ${item.valorDivergencia >= 0 ? "item-valor--ganho" : "item-valor--perda"}">
                        ${formatarMoeda(item.valorDivergencia)}
                    </span>

                </div>
                    `
                    : ""
                }

            </div>

        </div>
        `;

    });

    container.innerHTML = html;

}

// =====================================
// FILTROS
// =====================================

// extrai o número da rua (CODRUA) a partir de um
// endereço no formato "RUA.PREDIO.APTO.SALA"

function extrairRua(endereco){

    if(!endereco){

        return null;

    }

    const rua = String(endereco).split(".")[0];

    const numero = Number(rua);

    return isNaN(numero) ? rua : numero;

}

// monta o dropdown de ruas (checkboxes) com base
// nas ruas oficialmente cadastradas em cada pavilhão
// (mesma referência oficial de Pavilhão_1.txt,
// Pavilhão_2.txt, Pavilhão_3.txt e Perecível.txt —
// os intervalos abaixo batem exatamente com as ruas
// que aparecem nesses arquivos), agrupadas por
// pavilhão. Como é uma lista fixa, as ruas aparecem
// sempre, mesmo antes de processar qualquer
// comparativo.

function popularFiltroRua(){

    const opcoes =
    document.getElementById("filtroRuaOpcoes");

    if(!opcoes) return;

    // preserva a seleção atual (se já existir) antes
    // de reconstruir a lista de checkboxes

    const marcadasAntes =
    new Set(
        Array.from(
            document.querySelectorAll(".filtroRuaItem")
        )
        .filter(chk => chk.checked)
        .map(chk => chk.value)
    );

    const haviaSelecaoAnterior =
    document.querySelectorAll(".filtroRuaItem").length > 0;

    let html = `
    <label class="filtro-pavilhao-item filtro-pavilhao-todos">
        <input
            type="checkbox"
            id="filtroRuaTodos"
            checked
            onchange="alternarTodasRuas(this)">
        Todas as Ruas
    </label>
    <div class="filtro-pavilhao-separador"></div>
    `;

    PAVILHOES.forEach(pav=>{

        const ruasDoPavilhao = [];

        pav.ruas.forEach(([ruaInicio, ruaFim])=>{

            for(let r = ruaInicio; r <= ruaFim; r++){

                ruasDoPavilhao.push(r);

            }

        });

        html += `<div class="filtro-rua-grupo-titulo">${pav.nome}</div>`;

        ruasDoPavilhao.forEach(rua=>{

            const valor =
            String(rua).padStart(3,"0");

            const marcado =
            !haviaSelecaoAnterior ||
            marcadasAntes.has(valor);

            html += `
            <label class="filtro-pavilhao-item">
                <input
                    type="checkbox"
                    class="filtroRuaItem"
                    value="${valor}"
                    ${marcado ? "checked" : ""}
                    onchange="atualizarSelecaoRuas()">
                Rua ${valor}
            </label>
            `;

        });

    });

    opcoes.innerHTML = html;

    atualizarLabelRua();

}

// =====================================
// FILTRO DE SKU (multi-seleção, mesmo
// padrão do filtro de rua/pavilhão)
// =====================================

function popularFiltroSku(){

    const lista =
    document.getElementById("filtroSkuLista");

    if(!lista) return;

    // preserva a seleção atual (se já existir) antes
    // de reconstruir a lista de checkboxes

    const marcadosAntes =
    new Set(
        Array.from(
            document.querySelectorAll(".filtroSkuItem")
        )
        .filter(chk => chk.checked)
        .map(chk => chk.value)
    );

    const haviaSelecaoAnterior =
    document.querySelectorAll(".filtroSkuItem").length > 0;

    let html = "";

    resultado.forEach(item=>{

        const marcado =
        !haviaSelecaoAnterior ||
        marcadosAntes.has(item.sku);

        const descricaoEscapada =
        (item.descricao || "")
        .replace(/"/g,"&quot;");

        html += `
        <label class="filtro-pavilhao-item filtro-sku-item" data-sku-busca="${item.sku.toLowerCase()} ${descricaoEscapada.toLowerCase()}">
            <input
                type="checkbox"
                class="filtroSkuItem"
                value="${item.sku}"
                ${marcado ? "checked" : ""}
                onchange="atualizarSelecaoSkus()">
            <span class="filtro-sku-item-textos">
                <span class="filtro-sku-item-sku">#${item.sku}</span>
                <span class="filtro-sku-item-desc">${item.descricao || "Sem descrição"}</span>
            </span>
        </label>
        `;

    });

    lista.innerHTML = html;

    const buscaAtual =
    document.getElementById("filtroSkuBusca");

    if(buscaAtual) buscaAtual.value = "";

    atualizarLabelSku();

}

function toggleSkuDropdown(){

    const opcoes =
    document.getElementById("filtroSkuOpcoes");

    if(!opcoes) return;

    opcoes.style.display =
    opcoes.style.display === "none"
    ? "block"
    : "none";

}

function alternarTodosSkus(chkTodos){

    document
    .querySelectorAll(".filtroSkuItem")
    .forEach(chk=>{

        chk.checked = chkTodos.checked;

    });

    atualizarLabelSku();

    if(typeof aplicarFiltros === "function"){

        aplicarFiltros();

    }

}

function atualizarSelecaoSkus(){

    const itens =
    document.querySelectorAll(".filtroSkuItem");

    const chkTodos =
    document.getElementById("filtroSkuTodos");

    const todosMarcados =
    Array.from(itens)
    .every(chk => chk.checked);

    if(chkTodos){

        chkTodos.checked = todosMarcados;

    }

    atualizarLabelSku();

    if(typeof aplicarFiltros === "function"){

        aplicarFiltros();

    }

}

function atualizarLabelSku(){

    const label =
    document.getElementById("filtroSkuLabel");

    if(!label) return;

    const itens =
    Array.from(
        document.querySelectorAll(".filtroSkuItem")
    );

    const marcados =
    itens.filter(chk => chk.checked);

    if(!itens.length){

        label.innerText = "Todos os SKUs";

    }
    else if(marcados.length === 0){

        label.innerText = "Nenhum SKU";

    }
    else if(marcados.length === itens.length){

        label.innerText = "Todos os SKUs";

    }
    else if(marcados.length <= 2){

        label.innerText =
        marcados
        .map(chk => `#${chk.value}`)
        .join(", ");

    }
    else{

        label.innerText =
        `${marcados.length} SKUs selecionados`;

    }

}

// busca dentro do dropdown: só filtra visualmente
// quais checkboxes aparecem na lista, não mexe na
// seleção marcada nem no filtro já aplicado

function filtrarListaSkus(){

    const busca =
    (document.getElementById("filtroSkuBusca")?.value || "")
    .toLowerCase()
    .trim();

    document
    .querySelectorAll(".filtro-sku-item")
    .forEach(label=>{

        const alvo =
        label.dataset.skuBusca || "";

        label.style.display =
        (busca === "" || alvo.includes(busca))
        ? "flex"
        : "none";

    });

}

// Array vazio = todos marcados = sem filtro (mesmo
// comportamento do filtro de rua/pavilhão).
function obterSkusFiltroAtual(){

    const itens =
    Array.from(
        document.querySelectorAll(".filtroSkuItem")
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

function obterFiltrado(){

    const skusFiltro =
    obterSkusFiltroAtual();

    const qtdFiltroRaw =
    document
    .getElementById("filtroQtdPulmoes")
    .value
    .trim();

    const qtdFiltro =
    qtdFiltroRaw === ""
    ? null
    : Number(qtdFiltroRaw);

    const tipoValor =
    document
    .getElementById("filtroTipoValor")
    ?.value || "todos";

    const ordenarPor =
    document
    .getElementById("ordenarPor")
    ?.value || "sku";

    const ruasFiltro =
    obterRuasFiltroAtual();

    const pavilhoesFiltro =
    obterPavilhoesFiltroAtual();

    let filtrado = resultado.filter(item=>{

        // SKU: multi-seleção — array vazio = sem
        // filtro (todos), senão precisa estar marcado

        const skuOk =

            !skusFiltro.length ||

            skusFiltro.includes(item.sku);

        // filtro EXATO — não é "a partir de"

        const qtdOk =

            qtdFiltro === null ||

            item.qtdPulmoes === qtdFiltro;

        // ganho = divergência positiva (sobra) /
        // perda = divergência negativa (falta) —
        // só considera item com valor calculado

        const temValor =
        typeof item.valorDivergencia === "number" &&
        !isNaN(item.valorDivergencia);

        const valorOk =

            tipoValor === "todos" ||

            (tipoValor === "ganho" && temValor && item.valorDivergencia > 0) ||

            (tipoValor === "perda" && temValor && item.valorDivergencia < 0);

        const pavilhaoOk =

            !pavilhoesFiltro.length ||

            pavilhoesFiltro.includes(item.pavilhao);

        // rua: bate se a rua da apanha OU a rua de
        // qualquer pulmão do item corresponder ao filtro

        // rua: bate se a rua da apanha OU a rua de
        // qualquer pulmão do item estiver entre as
        // ruas marcadas no filtro

        const ruaOk =

            !ruasFiltro.length ||

            ruasFiltro.includes(extrairRua(item.enderecoApanha)) ||

            item.pulmoes.some(p=>
                ruasFiltro.includes(extrairRua(p.endereco))
            );

        return skuOk && qtdOk && valorOk && pavilhaoOk && ruaOk;

    });

    // ordenação — por padrão já vem por SKU (resultado
    // já está ordenado assim); "maior ganho"/"maior perda"
    // reordenam pelo impacto financeiro. Itens sem valor
    // calculado vão pro final, não pro topo

    if(ordenarPor === "maiorGanho"){

        filtrado = filtrado.slice().sort((a,b)=>{

            const valorA =
            typeof a.valorDivergencia === "number" ? a.valorDivergencia : -Infinity;

            const valorB =
            typeof b.valorDivergencia === "number" ? b.valorDivergencia : -Infinity;

            return valorB - valorA;

        });

    }
    else if(ordenarPor === "maiorPerda"){

        filtrado = filtrado.slice().sort((a,b)=>{

            const valorA =
            typeof a.valorDivergencia === "number" ? a.valorDivergencia : Infinity;

            const valorB =
            typeof b.valorDivergencia === "number" ? b.valorDivergencia : Infinity;

            return valorA - valorB;

        });

    }

    return filtrado;

}

function aplicarFiltros(){

    renderizarCards(
        obterFiltrado()
    );

}

window.addEventListener("load",()=>{

    document
    .getElementById("filtroQtdPulmoes")
    ?.addEventListener(
        "input",
        aplicarFiltros
    );

    document
    .getElementById("filtroTipoValor")
    ?.addEventListener(
        "change",
        aplicarFiltros
    );

    document
    .getElementById("ordenarPor")
    ?.addEventListener(
        "change",
        aplicarFiltros
    );

});

// =====================================
// IMPRIMIR
// =====================================

function imprimirComparativo(){

    const dados = obterFiltrado();

    if(!dados.length){

        alert(
            "Nenhum item pra imprimir com os filtros atuais."
        );

        return;

    }

    const janela = window.open("", "_blank");

    if(!janela){

        alert("Permita pop-ups para este site.");

        return;

    }

    let html = `
<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<title>Comparativo de Estoque CD x Comercial</title>

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

    font-size:18px;

}

.info{

    display:flex;

    justify-content:space-between;

    margin-bottom:14px;

    font-size:12px;

}

.item{

    border:1px solid #d9d9d9;

    border-radius:8px;

    padding:12px;

    margin-bottom:10px;

    page-break-inside:avoid;

}

.item-topo{

    display:flex;

    justify-content:space-between;

    align-items:flex-start;

    border-bottom:1px solid #eee;

    padding-bottom:6px;

    margin-bottom:6px;

}

.sku{

    font-weight:bold;

    font-size:15px;

    color:#1e3a8a;

}

.descricao{

    font-size:12px;

    color:#444;

}

.diferenca{

    font-size:11px;

    font-weight:bold;

    padding:3px 8px;

    border-radius:10px;

    background:#f3f4f6;

    white-space:nowrap;

}

.linha{

    font-size:12px;

    margin-top:4px;

}

.linha b{

    color:#1e3a8a;

}

.enderecos{

    width:100%;

    border-collapse:collapse;

    margin-top:4px;

    font-size:11px;

}

.enderecos th{

    text-align:left;

    font-size:9px;

    text-transform:uppercase;

    letter-spacing:.03em;

    color:#6b7280;

    padding:3px 6px;

    border-bottom:1px solid #d9d9d9;

}

.enderecos td{

    padding:3px 6px;

    border-bottom:1px solid #f0f0f0;

}

.enderecos td.tag{

    font-weight:bold;

    color:#1e3a8a;

}

.enderecos tr.apanha td.tag{

    color:#2E63A8;

}

.enderecos td.centro{

    text-align:center;

}

.enderecos td.encontrada{

    text-align:center;

    font-weight:bold;

}

.enderecos tr.confere td.encontrada{

    color:#1E9E5C;

}

.enderecos tr.divergente td.encontrada{

    color:#D9333F;

}

.enderecos td.encontrada input{

    width:64px;

    text-align:center;

    font-weight:bold;

    font-size:12px;

    font-family:inherit;

    color:inherit;

    border:1.3px solid #aaa;

    border-radius:4px;

    padding:2px 4px;

    background:#fff;

}

.enderecos tr.confere td.encontrada input{

    border-color:#1E9E5C;

    color:#1E9E5C;

    background:#eafaf0;

}

.enderecos tr.divergente td.encontrada input{

    border-color:#D9333F;

    color:#D9333F;

    background:#fdecee;

}

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

.aviso-contagem{

    font-size:11px;

    color:#6b7280;

    margin:-8px 0 14px 0;

}

@media print{

    .toolbar, .aviso-contagem{

        display:none;

    }

    .enderecos td.encontrada input{

        border:1px solid #999;

        -webkit-print-color-adjust:exact;

        print-color-adjust:exact;

    }

}

.apuracao{

    margin-top:8px;

    padding-top:6px;

    border-top:1px dashed #d9d9d9;

    display:flex;

    justify-content:space-between;

    font-size:12px;

    font-weight:bold;

}

@media print{

    .item{

        -webkit-print-color-adjust:exact;

        print-color-adjust:exact;

    }

}

</style>

</head>

<body>

<div class="toolbar">
    <button class="btn-imprimir" onclick="window.print()">🖨️ Imprimir</button>
</div>

<h1>

📊 COMPARATIVO DE ESTOQUE CD LOCUS x COMERCIAL

</h1>

<div class="info">

<div>

<b>Data:</b> ${new Date().toLocaleString("pt-BR")}

</div>

<div>

<b>Total:</b> ${dados.length} itens

</div>

</div>

<p class="aviso-contagem">Preencha a "Qtd. Encontrada" durante a contagem física. Quando o endereço indicar "CX", conte e informe em caixas; quando indicar "UN", conte e informe em unidades.</p>

`;

    dados.forEach(item=>{

        // monta as mesmas linhas de endereço da tela
        // (apanha + pulmões). A "Qtd. Encontrada" só
        // existe aqui na impressão — o operador preenche
        // na hora da contagem física, direto neste
        // documento (nada é salvo, some ao fechar/recarregar)

        const linhasEndereco = [];

        if(item.enderecoApanha){

            linhasEndereco.push({
                endereco: item.enderecoApanha,
                tipo: "Apanha",
                qtdSistema: null
            });

        }

        item.pulmoes.forEach(p=>{

            linhasEndereco.push({
                endereco: p.endereco,
                tipo: "Pulmão",
                qtdSistema: p.quantidade
            });

        });

        const embalagemItem = Number(item.embalagem) || 1;

        const linhasHtml =

        linhasEndereco.length

        ? linhasEndereco.map(l=>{

            const semQtd = l.qtdSistema === null || l.qtdSistema === undefined;
            const sistemaUn = semQtd ? 0 : l.qtdSistema;

            // só mostra em CX quando o item realmente é
            // paletizado em caixa (embalagem > 1) e a
            // quantidade do endereço divide certinho por
            // caixa. Caixa quebrada/fracionada ou item que
            // é contado por unidade continua em UN.

            const podeConverterCx =
            !semQtd && embalagemItem > 1 && sistemaUn % embalagemItem === 0;

            const unidade = semQtd ? "" : (podeConverterCx ? "CX" : "UN");

            const sistemaComparacao =
            semQtd ? 0 : (podeConverterCx ? sistemaUn / embalagemItem : sistemaUn);

            const sistemaTexto =
            semQtd ? "—" : `${sistemaComparacao} ${unidade}`;

            return `
                <tr class="${l.tipo === "Apanha" ? "apanha" : ""}" data-linha-sku="${item.sku}">
                    <td class="tag">${l.endereco}</td>
                    <td>${l.tipo}</td>
                    <td class="centro">${sistemaTexto}</td>
                    <td class="encontrada">
                        <input
                            type="number"
                            inputmode="numeric"
                            placeholder=""
                            class="input-encontrada"
                            data-sku="${item.sku}"
                            data-sistema="${sistemaComparacao}"
                            data-sistema-un="${sistemaUn}"
                            data-unidade="${unidade}"
                            data-embalagem="${embalagemItem}"
                            data-sem-sistema="${semQtd ? "true" : "false"}"
                        >
                    </td>
                </tr>`;

          }).join("")

        : `<tr><td colspan="4">Sem endereço cadastrado</td></tr>`;

        const enderecosHtml = `
        <table class="enderecos">
            <thead>
                <tr>
                    <th>Endereço</th>
                    <th>Tipo</th>
                    <th class="centro">Qtd. Sistema</th>
                    <th class="centro">Qtd. Encontrada</th>
                </tr>
            </thead>
            <tbody>
                ${linhasHtml}
            </tbody>
        </table>`;

        const diferencaHtml =

        (item.diferenca !== null && item.diferenca !== undefined && item.diferenca !== "")

        ? `<span class="diferenca">Diferença: ${item.diferenca}</span>`

        : "";

        html += `

<div class="item">

    <div class="item-topo">

        <div>

            <div class="sku">#${item.sku}</div>

            <div class="descricao">${item.descricao || "Sem descrição"}</div>

        </div>

        ${diferencaHtml}

    </div>

    ${enderecosHtml}

    ${
        typeof item.valorUnitario === "number" && !isNaN(item.valorUnitario)
        ? `<div class="linha"><b>Valor Unitário:</b> ${formatarMoeda(item.valorUnitario)}</div>`
        : ""
    }

    ${
        typeof item.valorDivergencia === "number" && !isNaN(item.valorDivergencia)
        ? `<div class="linha"><b>${item.valorDivergencia >= 0 ? "Impacto (Ganho):" : "Impacto (Perda):"}</b> ${formatarMoeda(item.valorDivergencia)}</div>`
        : ""
    }

    <div class="apuracao" data-apuracao-sku="${item.sku}" style="display:none;">
        <span data-diff-sku="${item.sku}"></span>
        <span
            data-impacto-sku="${item.sku}"
            data-valor-unitario="${typeof item.valorUnitario === "number" && !isNaN(item.valorUnitario) ? item.valorUnitario : ""}"
        ></span>
    </div>

</div>

`;

    });

    html += `

<script>

function formatarMoedaImpressao(valor){

    return (valor < 0 ? "-R$ " : "R$ ") +
    Math.abs(valor).toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2});

}

function recalcularConferenciaImpressao(sku){

    const inputs =
    document.querySelectorAll('.input-encontrada[data-sku="' + sku + '"]');

    let totalSistemaUn = 0;
    let totalEncontradoUn = 0;
    let algumPreenchido = false;

    inputs.forEach(function(inp){

        const sistemaComparacao = Number(inp.dataset.sistema) || 0;
        const sistemaUn = Number(inp.dataset.sistemaUn) || 0;

        totalSistemaUn += sistemaUn;

        const valorDigitado = inp.value.trim();

        const linha = inp.closest("tr");

        if(valorDigitado !== ""){

            algumPreenchido = true;

            const encontrado = Number(valorDigitado) || 0;

            const embalagem = Number(inp.dataset.embalagem) || 1;

            const encontradoUn =
            inp.dataset.unidade === "CX" ? encontrado * embalagem : encontrado;

            totalEncontradoUn += encontradoUn;

            if(inp.dataset.semSistema === "true"){

                // Apanha não tem qtd. de sistema pra comparar —
                // só registra o que foi encontrado, sem marcar
                // como confere/divergente
                linha.classList.remove("confere","divergente");

            }else if(encontrado === sistemaComparacao){
                linha.classList.remove("divergente");
                linha.classList.add("confere");
            }else{
                linha.classList.remove("confere");
                linha.classList.add("divergente");
            }

        }else{

            linha.classList.remove("confere","divergente");

        }

    });

    const apuracaoEl =
    document.querySelector('[data-apuracao-sku="' + sku + '"]');

    const diffEl =
    document.querySelector('[data-diff-sku="' + sku + '"]');

    const impactoEl =
    document.querySelector('[data-impacto-sku="' + sku + '"]');

    if(!apuracaoEl || !diffEl || !impactoEl) return;

    if(!algumPreenchido){

        apuracaoEl.style.display = "none";

        return;

    }

    apuracaoEl.style.display = "flex";

    const diferencaApurada = totalEncontradoUn - totalSistemaUn;

    diffEl.textContent =
    "Diferença apurada: " + (diferencaApurada > 0 ? "+" : "") + diferencaApurada + " un.";

    const valorUnitarioAttr = impactoEl.dataset.valorUnitario;

    if(valorUnitarioAttr === ""){

        impactoEl.textContent = "";

    }else{

        const valorUnitario = Number(valorUnitarioAttr);

        const impacto = diferencaApurada * valorUnitario;

        impactoEl.textContent =
        "Impacto (contagem): " + (impacto > 0 ? "+" : "") + formatarMoedaImpressao(impacto);

    }

}

document.addEventListener("input", function(e){

    if(e.target.classList && e.target.classList.contains("input-encontrada")){

        recalcularConferenciaImpressao(e.target.dataset.sku);

    }

});

<\/script>

</body>

</html>

`;

    janela.document.open();

    janela.document.write(html);

    janela.document.close();

    janela.focus();

}

// =====================================
// GERAR IMAGEM PARA WHATSAPP
// =====================================

function obterResumoFiltrosAtivos(){

    const partes = [];

    const skusFiltro =
    obterSkusFiltroAtual();

    if(skusFiltro.length){

        partes.push(
            skusFiltro.length <= 3
            ? `SKU: ${skusFiltro.map(s => "#" + s).join(", ")}`
            : `SKU: ${skusFiltro.length} selecionados`
        );

    }

    const qtdFiltro =
    document
    .getElementById("filtroQtdPulmoes")
    ?.value
    .trim();

    if(qtdFiltro){

        partes.push(`Nº de pulmões: ${qtdFiltro}`);

    }

    const ruasFiltro =
    obterRuasFiltroAtual();

    if(ruasFiltro.length){

        partes.push(
            `Rua: ${ruasFiltro
                .map(r => String(r).padStart(3,"0"))
                .join(", ")}`
        );

    }

    const tipoValor =
    document
    .getElementById("filtroTipoValor")
    ?.value;

    if(tipoValor && tipoValor !== "todos"){

        partes.push(
            tipoValor === "ganho"
            ? "Somente Ganho"
            : "Somente Perda"
        );

    }

    const pavilhoesFiltro =
    obterPavilhoesFiltroAtual();

    if(pavilhoesFiltro.length){

        partes.push(`Pavilhão: ${pavilhoesFiltro.join(", ")}`);

    }

    return partes.length
    ? partes.join(" · ")
    : "Nenhum filtro ativo — base completa";

}

function montarRelatorioImagem(dadosBase = resultado, resumoFiltro = null){

    const container =
    document.getElementById("relatorioImagem");

    const agora =
    new Date().toLocaleString("pt-BR");

    const total = dadosBase.length;

    const semApanha =
    dadosBase.filter(x=>!x.enderecoApanha).length;

    const semPulmao =
    dadosBase.filter(x=>x.qtdPulmoes===0).length;

    const totalPulmoes =
    dadosBase.reduce((s,x)=>s+x.qtdPulmoes,0);

    const umPulmao =
    dadosBase.filter(x=>x.qtdPulmoes===1).length;

    const doisPulmoes =
    dadosBase.filter(x=>x.qtdPulmoes===2).length;

    const tresPulmoes =
    dadosBase.filter(x=>x.qtdPulmoes===3).length;

    const quatroOuMais =
    dadosBase.filter(x=>x.qtdPulmoes>=4).length;

    // =====================================
    // IMPACTO FINANCEIRO
    // =====================================

    const itensComValor =
    dadosBase.filter(x=>
        typeof x.valorDivergencia === "number" &&
        !isNaN(x.valorDivergencia)
    );

    const itensGanho =
    itensComValor.filter(x=>x.valorDivergencia > 0);

    const itensPerda =
    itensComValor.filter(x=>x.valorDivergencia < 0);

    const valorGanho =
    itensGanho.reduce((s,x)=>s + x.valorDivergencia, 0);

    const valorPerda =
    itensPerda.reduce((s,x)=>s + Math.abs(x.valorDivergencia), 0);

    // impacto total: ganho + perda somados, sem
    // compensar um lado com o outro

    const valorAbsoluto =
    valorGanho + valorPerda;

    const valorLiquido =
    valorGanho - valorPerda;

    const impactoMedioPorItem =
    itensComValor.length
    ? valorAbsoluto / itensComValor.length
    : 0;

    const itensSemValor =
    total - itensComValor.length;

    const coberturaValores =
    total
    ? Math.round((itensComValor.length / total) * 100)
    : 0;

    function formatarMoeda_(v){

        return (v || 0).toLocaleString(
            "pt-BR",
            {style:"currency",currency:"BRL"}
        );

    }

    const valorGanhoFormatado = formatarMoeda_(valorGanho);
    const valorPerdaFormatado = formatarMoeda_(valorPerda);
    const valorAbsolutoFormatado = formatarMoeda_(valorAbsoluto);
    const valorLiquidoFormatado = formatarMoeda_(valorLiquido);
    const impactoMedioFormatado = formatarMoeda_(impactoMedioPorItem);

    function linha(label, valor, classeExtra){

        return `
        <div class="ri-dist-linha">
            <span class="ri-dist-label">${label}</span>
            <span class="ri-dist-valor ${classeExtra || ""}">${valor}</span>
        </div>
        `;

    }

    // =====================================
    // TOP 5 MAIORES IMPACTOS (GANHO E PERDA)
    // =====================================

    function itemCard(item, tipo){

        const impactoFormatado =
        formatarMoeda_(item.valorDivergencia);

        const valorUnitarioFormatado =
        typeof item.valorUnitario === "number" && !isNaN(item.valorUnitario)
        ? formatarMoeda_(item.valorUnitario)
        : "—";

        return `
        <div class="ri-item ${tipo === "ganho" ? "ri-item--ok" : "ri-item--critico"}">
            <div class="ri-item-topo">
                <span class="ri-item-sku">#${item.sku} — ${item.descricao || "Sem descrição"}</span>
                <span class="ri-item-diferenca ${tipo === "ganho" ? "ri-dist-valor--ganho" : "ri-dist-valor--perda"}">${impactoFormatado}</span>
            </div>
            <div class="ri-item-linha">
                <b>Diferença:</b> ${item.diferenca ?? "—"}
                &nbsp;·&nbsp;
                <b>Valor Unit.:</b> ${valorUnitarioFormatado}
                &nbsp;·&nbsp;
                <b>Pulmões:</b> ${item.qtdPulmoes}
            </div>
        </div>
        `;

    }

    const top5Ganho =
    itensGanho
    .slice()
    .sort((a,b)=>b.valorDivergencia - a.valorDivergencia)
    .slice(0,5);

    const top5Perda =
    itensPerda
    .slice()
    .sort((a,b)=>a.valorDivergencia - b.valorDivergencia)
    .slice(0,5);

    const top5GanhoHtml =
    top5Ganho.length
    ? top5Ganho.map(item=>itemCard(item,"ganho")).join("")
    : `<div class="ri-item-linha" style="padding:6px 2px;">Nenhum item com ganho calculado.</div>`;

    const top5PerdaHtml =
    top5Perda.length
    ? top5Perda.map(item=>itemCard(item,"perda")).join("")
    : `<div class="ri-item-linha" style="padding:6px 2px;">Nenhum item com perda calculada.</div>`;

    container.innerHTML = `

    <div class="ri-cabecalho">

        <div class="ri-titulo">
            📊 Relatório Executivo — Comparativo de Estoque
        </div>

        <div class="ri-faixa"></div>

        <div class="ri-data">
            ${agora}
        </div>

        ${resumoFiltro ? `<div class="ri-filtro-ativo">🔎 ${resumoFiltro}</div>` : ""}

    </div>

    <div class="ri-kpis">

        <div class="ri-kpi">
            <div class="ri-kpi-label">Total de Itens</div>
            <div class="ri-kpi-valor">${total}</div>
        </div>

        <div class="ri-kpi">
            <div class="ri-kpi-label">Sem Apanha</div>
            <div class="ri-kpi-valor">${semApanha}</div>
        </div>

        <div class="ri-kpi">
            <div class="ri-kpi-label">Sem Pulmão</div>
            <div class="ri-kpi-valor">${semPulmao}</div>
        </div>

        <div class="ri-kpi">
            <div class="ri-kpi-label">Total de Pulmões</div>
            <div class="ri-kpi-valor">${totalPulmoes}</div>
        </div>

    </div>

    <div class="ri-secao-titulo">
        💰 Impacto Financeiro das Divergências
    </div>

    <div class="ri-kpis">

        <div class="ri-kpi" style="border-left-color:var(--green);">
            <div class="ri-kpi-label">Valor Ganho</div>
            <div class="ri-kpi-valor" style="color:var(--green);">${valorGanhoFormatado}</div>
        </div>

        <div class="ri-kpi" style="border-left-color:var(--red);">
            <div class="ri-kpi-label">Valor Perda</div>
            <div class="ri-kpi-valor" style="color:var(--red);">${valorPerdaFormatado}</div>
        </div>

        <div class="ri-kpi" style="border-left-color:var(--blue);">
            <div class="ri-kpi-label">Impacto Total (Ganho + Perda)</div>
            <div class="ri-kpi-valor" style="color:var(--blue);">${valorAbsolutoFormatado}</div>
        </div>

        <div class="ri-kpi" style="border-left-color:var(--amber);">
            <div class="ri-kpi-label">Saldo Líquido (Ganho - Perda)</div>
            <div class="ri-kpi-valor" style="color:${valorLiquido >= 0 ? "var(--green)" : "var(--red)"};">${valorLiquidoFormatado}</div>
        </div>

    </div>

    <div class="ri-distribuicao" style="margin-bottom:26px;">

        ${linha("Itens com ganho (divergência positiva)", `${itensGanho.length} itens`, "ri-dist-valor--ganho")}
        ${linha("Itens com perda (divergência negativa)", `${itensPerda.length} itens`, "ri-dist-valor--perda")}
        ${linha("Impacto médio por item (com valor)", impactoMedioFormatado)}
        ${linha("Cobertura de valor unitário", `${itensComValor.length} de ${total} itens (${coberturaValores}%)`)}
        ${itensSemValor > 0 ? linha("⚠️ Itens sem valor unitário cadastrado", `${itensSemValor} itens`, "ri-dist-valor--perda") : ""}

    </div>

    <div class="ri-secao-titulo">
        📈 Top 5 Maiores Ganhos
    </div>

    <div style="margin-bottom:26px;">
        ${top5GanhoHtml}
    </div>

    <div class="ri-secao-titulo">
        📉 Top 5 Maiores Perdas
    </div>

    <div style="margin-bottom:26px;">
        ${top5PerdaHtml}
    </div>

    <div class="ri-secao-titulo">
        Distribuição por Nº de Pulmões
    </div>

    <div class="ri-distribuicao">

        ${linha("Itens com 1 pulmão", umPulmao)}
        ${linha("Itens com 2 pulmões", doisPulmoes)}
        ${linha("Itens com 3 pulmões", tresPulmoes)}
        ${linha("Itens com 4 ou mais pulmões", quatroOuMais)}
        ${linha("Itens sem pulmão", semPulmao)}
        ${linha("Itens sem apanha", semApanha)}

    </div>

    <div class="ri-rodape">
        Gerado pelo Comparativo de Estoque CD x Comercial
    </div>

    `;

}

async function gerarImagemRelatorio(){

    if(!resultado.length){

        alert(
            "Processe os arquivos primeiro."
        );

        return;

    }

    montarRelatorioImagem();

    if(document.fonts && document.fonts.ready){

        await document.fonts.ready;

    }

    const elemento =
    document.getElementById("relatorioImagem");

    let canvas;

    try{

        canvas = await html2canvas(elemento, {

            backgroundColor: "#EEF1F8",

            scale: 2

        });

    }

    catch(erro){

        console.error(erro);

        alert(
            "Não consegui gerar a imagem. Veja o console (F12) pra detalhes."
        );

        return;

    }

    canvas.toBlob(async blob=>{

        if(!blob){

            alert("Falha ao gerar a imagem.");

            return;

        }

        try{

            await navigator.clipboard.write([

                new ClipboardItem({
                    "image/png": blob
                })

            ]);

            alert(
                "✅ Imagem copiada! Agora é só abrir a conversa no WhatsApp e colar (Ctrl+V)."
            );

        }

        catch(erro){

            console.error(erro);

            const link = document.createElement("a");

            link.href = URL.createObjectURL(blob);

            link.download =
            `comparativo_estoque_${new Date().toISOString().slice(0,10)}.png`;

            link.click();

            alert(
                "Seu navegador não permitiu copiar direto pro clipboard, então baixei a imagem — é só anexar ela no WhatsApp."
            );

        }

    }, "image/png");

}

// =====================================
// RELATÓRIO EXECUTIVO — FILTRADO
// =====================================
// Mesmo modelo do relatório executivo acima, mas calcula os
// KPIs/distribuições só em cima do que está passando pelos
// filtros ativos da tela (SKU, pulmões, ganho/perda e — o mais
// pedido — pavilhão). Mostra um resumo dos filtros aplicados
// no topo da imagem.

async function gerarImagemRelatorioFiltrado(){

    const dadosFiltrados =
    obterFiltrado();

    if(!dadosFiltrados.length){

        alert(
            "Nenhum item pra gerar relatório com os filtros atuais."
        );

        return;

    }

    montarRelatorioImagem(
        dadosFiltrados,
        obterResumoFiltrosAtivos()
    );

    if(document.fonts && document.fonts.ready){

        await document.fonts.ready;

    }

    const elemento =
    document.getElementById("relatorioImagem");

    let canvas;

    try{

        canvas = await html2canvas(elemento, {

            backgroundColor: "#EEF1F8",

            scale: 2

        });

    }

    catch(erro){

        console.error(erro);

        alert(
            "Não consegui gerar a imagem. Veja o console (F12) pra detalhes."
        );

        return;

    }

    canvas.toBlob(async blob=>{

        if(!blob){

            alert("Falha ao gerar a imagem.");

            return;

        }

        try{

            await navigator.clipboard.write([

                new ClipboardItem({
                    "image/png": blob
                })

            ]);

            alert(
                "✅ Imagem copiada! Agora é só abrir a conversa no WhatsApp e colar (Ctrl+V)."
            );

        }

        catch(erro){

            console.error(erro);

            const link = document.createElement("a");

            link.href = URL.createObjectURL(blob);

            link.download =
            `comparativo_estoque_filtrado_${new Date().toISOString().slice(0,10)}.png`;

            link.click();

            alert(
                "Seu navegador não permitiu copiar direto pro clipboard, então baixei a imagem — é só anexar ela no WhatsApp."
            );

        }

    }, "image/png");

}
