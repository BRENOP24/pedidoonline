// =========================================================================
// SCRIPT.JS - LÓGICA DO CLIENTE (index.html)
// =========================================================================

// VARIÁVEIS DE ARMAZENAMENTO E CONFIGURAÇÃO
const STORAGE_KEY_PRODUTOS = 'produtosFarmacia'; 
let carrinho = [];

// <-- MUDAR AQUI: Seu número de WhatsApp (Ex: 5545988887777) -->
const numeroLoja = "5546991032063"; 

// Lista de produtos padrão (Fallback caso o admin nunca tenha usado o painel)
const PRODUTOS_PADRAO = [
    { nome: "Shampoo Xtreme", preco: 25.90, categoria: "Higiene Pessoal", urlImagem: "https://via.placeholder.com/150/007bff/ffffff?text=SHAMPOO", estoque: 10, status: 'ativo' },
    { nome: "Creme Dental Flúor Max", preco: 8.50, categoria: "Higiene Pessoal", urlImagem: "https://via.placeholder.com/150/007bff/ffffff?text=CREME", estoque: 5, status: 'ativo' },
    { nome: "Vitamina C 1000mg", preco: 49.99, categoria: "Vitaminas e Suplementos", urlImagem: "https://via.placeholder.com/150/dc3545/ffffff?text=VITAMINA", estoque: 0, status: 'ativo' }, 
    { nome: "Band-Aid Pequeno", preco: 15.00, categoria: "Primeiros Socorros", urlImagem: "https://via.placeholder.com/150/28a745/ffffff?text=BAND-AID", estoque: 20, status: 'ativo' }
];


// --- FUNÇÕES GERAIS DE DADOS ---

const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// FUNÇÃO AUXILIAR: Carrega todos os produtos (ativos e inativos) para checagem de estoque
function carregarProdutosBase() {
    const produtosJSON = localStorage.getItem(STORAGE_KEY_PRODUTOS);
    const produtosSalvos = produtosJSON ? JSON.parse(produtosJSON) : [];
    
    let produtosBase = produtosSalvos.length > 0 ? produtosSalvos : PRODUTOS_PADRAO;
    
    return produtosBase.map(p => ({
        ...p,
        status: p.status || 'ativo' // Garante que o status exista
    }));
}


// FUNÇÃO PRINCIPAL: Carrega e FILTRA os produtos para o catálogo do cliente
function carregarProdutosCatálogo() {
    const produtosBase = carregarProdutosBase();
    
    // FILTRO: Retorna SOMENTE produtos ATIVOS E com ESTOQUE > 0
    const produtosFiltrados = produtosBase.filter(produto => {
        return produto.status === 'ativo' && produto.estoque > 0;
    });

    return produtosFiltrados;
}

// --- FUNÇÕES DE RENDERIZAÇÃO DO CATÁLOGO (index.html) ---

function renderizarCatalogo() {
    const catalogoContainer = document.querySelector('.catalogo');
    catalogoContainer.innerHTML = '<h2>Nossos Produtos</h2>'; 

    // 1. Carrega os produtos JÁ FILTRADOS (ativos e em estoque)
    const produtos = carregarProdutosCatálogo();
    
    // 2. Agrupa os produtos por categoria
    const categorias = produtos.reduce((acc, produto) => {
        if (!acc[produto.categoria]) {
            acc[produto.categoria] = [];
        }
        acc[produto.categoria].push(produto);
        return acc;
    }, {});

    // 3. ORDENAÇÃO: Ordena as chaves (nomes das categorias) alfabeticamente
    const nomesCategorias = Object.keys(categorias).sort();

    // 4. Renderiza cada categoria e seus produtos
    for (const cat of nomesCategorias) {
        // ORDENAÇÃO: Ordena os produtos dentro da categoria por nome (alfabético)
        const produtosOrdenados = categorias[cat].sort((a, b) => a.nome.localeCompare(b.nome));

        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'categoria';
        categoriaDiv.innerHTML = `<h3>${cat}</h3><div class="produtos"></div>`;
        
        const produtosDiv = categoriaDiv.querySelector('.produtos');

        produtosOrdenados.forEach(produto => {
            const produtoDiv = document.createElement('div');
            produtoDiv.className = 'produto';
            
            // Define datasets para o JS pegar os dados do carrinho
            produtoDiv.dataset.nome = produto.nome;
            produtoDiv.dataset.preco = produto.preco; 
            
            const urlImagem = produto.urlImagem || 'https://via.placeholder.com/150/000000/FFFFFF?text=SEM+IMAGEM'; // Fallback para imagem
            
            produtoDiv.innerHTML = `
                <img src="${urlImagem}" alt="${produto.nome}" style="width: 45%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
                <h4>${produto.nome}</h4>
                <p class="preco">${formatarMoeda(produto.preco)}</p>
                <button onclick="adicionarAoCarrinho(this)">Adicionar</button>
            `;
            produtosDiv.appendChild(produtoDiv);
        });
        catalogoContainer.appendChild(categoriaDiv);
    }
    
    // 5. Mensagens de estado
    if (produtos.length === 0) {
        catalogoContainer.innerHTML += '<p style="text-align: center; margin-top: 30px;">No momento, nenhum produto está ativo ou em estoque.</p>';
    }
}

// --- FUNÇÕES DO CARRINHO ---

function adicionarAoCarrinho(botao) {
    const produtoElement = botao.closest('.produto');
    const nome = produtoElement.dataset.nome;
    const preco = parseFloat(produtoElement.dataset.preco);

    const itemExistente = carrinho.find(item => item.nome === nome);
    
    // Busca o estoque máximo a partir da base completa de produtos
    const todosProdutosBase = carregarProdutosBase(); 
    const produtoBase = todosProdutosBase.find(p => p.nome === nome);
    
    // Verifica indisponibilidade (estoque, status, ou produto inexistente)
    if (!produtoBase || produtoBase.estoque <= 0 || produtoBase.status !== 'ativo') {
        alert(`O produto ${nome} está indisponível.`);
        return;
    }
    
    if (itemExistente) {
        if (itemExistente.quantidade >= produtoBase.estoque) {
            alert(`Limite de estoque atingido para ${nome}. Máximo: ${produtoBase.estoque}.`);
            return;
        }
        itemExistente.quantidade++;
    } else {
        carrinho.push({ nome, preco, quantidade: 1 });
    }

    renderizarCarrinho();
}

function gerenciarQuantidade(nome, acao) {
    const itemIndex = carrinho.findIndex(item => item.nome === nome);
    
    if (itemIndex > -1) {
        // Busca o estoque máximo a partir da base completa de produtos
        const todosProdutosBase = carregarProdutosBase();
        const produtoBase = todosProdutosBase.find(p => p.nome === nome);

        if (acao === 'aumentar') {
            if (produtoBase && carrinho[itemIndex].quantidade >= produtoBase.estoque) {
                alert(`Limite de estoque atingido para ${nome}. Máximo: ${produtoBase.estoque}.`);
                return;
            }
            carrinho[itemIndex].quantidade++;
        } else if (acao === 'diminuir') {
            carrinho[itemIndex].quantidade--;
            if (carrinho[itemIndex].quantidade <= 0) {
                carrinho.splice(itemIndex, 1);
            }
        }
    }
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const listaCarrinho = document.getElementById('lista-carrinho');
    const valorTotalSpan = document.getElementById('valor-total');
    let total = 0;

    listaCarrinho.innerHTML = ''; 

    if (carrinho.length === 0) {
        listaCarrinho.innerHTML = '<li class="carrinho-vazio">Seu carrinho está vazio.</li>';
        valorTotalSpan.textContent = formatarMoeda(0);
        return;
    }

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.nome} (${formatarMoeda(item.preco)} cada)</span>
            <div class="item-quantidade">
                <button onclick="gerenciarQuantidade('${item.nome}', 'diminuir')">-</button>
                <span>${item.quantidade}x</span>
                <button onclick="gerenciarQuantidade('${item.nome}', 'aumentar')">+</button>
            </div>
        `;
        listaCarrinho.appendChild(li);
    });

    valorTotalSpan.textContent = formatarMoeda(total);
}

function limparCarrinho() {
    carrinho = [];
    renderizarCarrinho();
}

// --- FUNÇÃO DE FINALIZAÇÃO (WHATSAPP) ---

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio. Adicione produtos para fazer o pedido.");
        return;
    }

    // 1. Coletar dados do cliente e validar
    const nome = document.getElementById('cliente-nome').value.trim();
    const endereco = document.getElementById('cliente-endereco').value.trim();
    const pagamento = document.getElementById('cliente-pagamento').value;

    if (!nome || !endereco || !pagamento) {
        alert("Por favor, preencha seu Nome, Endereço e selecione a Forma de Pagamento para finalizar o pedido.");
        return;
    }

    let total = 0;
    
    // 2. Construir a mensagem do Pedido
    let mensagem = "*NOVO PEDIDO FARMÁCIA VIVA BEM* \n\n";

    // Informações do Cliente
    mensagem += "*CLIENTE E ENTREGA:* \n";
    mensagem += `* Nome: ${nome} \n`;
    mensagem += `* Endereço: ${endereco} \n`;
    mensagem += `* Pagamento: ${pagamento.toUpperCase()} \n\n`;

    // Informações dos Itens
    mensagem += "*ITENS SELECIONADOS:* \n";

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        mensagem += `* ${item.quantidade}x ${item.nome} (${formatarMoeda(subtotal)}) \n`;
    });

    mensagem += `\n*TOTAL ESTIMADO: ${formatarMoeda(total)}* \n\n`;
    mensagem += "Por favor, aguarde a confirmação de disponibilidade e o valor final com a atendente. Obrigado!";

    // 3. Abrir WhatsApp (Pré-preenche a mensagem)
    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${5546991032063}?text=${mensagemCodificada}`;
    window.open(urlWhatsApp, '_blank');
    
    // Opcional: Limpar o carrinho e o formulário após o envio
    limparCarrinho();
    document.getElementById('cliente-nome').value = '';
    document.getElementById('cliente-endereco').value = '';
    document.getElementById('cliente-pagamento').selectedIndex = 0; 
}

// Inicializa o catálogo e o carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderizarCatalogo();
    renderizarCarrinho();
});