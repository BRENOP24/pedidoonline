// Adicione esta função ao seu arquivo admin.js:

function exportarProdutosParaCodigo() {
    // 1. Carrega a lista de produtos atual do localStorage
    const produtosAtuais = carregarProdutosBase(); 

    // 2. Transforma a lista de objetos em uma string JSON formatada
    const produtosJSON = JSON.stringify(produtosAtuais, null, 4); 

    // 3. Monta o código JS completo para ser copiado
    const codigoPronto = `
// ====================================================================
// ESTA É A NOVA LISTA DE PRODUTOS PADRÃO (Gerada pelo Admin)
// Use para atualizar a constante PRODUTOS_PADRAO no script.js
// ====================================================================
const PRODUTOS_PADRAO = ${produtosJSON};
    `;

    // 4. Cria um elemento para exibir e selecionar o código
    const areaTexto = document.createElement('textarea');
    areaTexto.value = codigoPronto;
    areaTexto.style.width = '100%';
    areaTexto.style.height = '300px';
    
    // Limpa qualquer código anterior e exibe o novo código
    let container = document.getElementById('export-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'export-container';
        document.body.appendChild(container); // Adiciona ao final do corpo se não existir
    }
    container.innerHTML = '<h3>Copie o código abaixo e cole no seu script.js:</h3>';
    container.appendChild(areaTexto);

    // Seleciona o texto para facilitar a cópia
    areaTexto.select();
    alert("Código JavaScript gerado com sucesso! Copie o texto e siga para o Passo 2.");
}