// Variáveis do Carrinho
let cart = [];
let total = 0;

// Função para alternar abas (Menu)
function showSection(sectionId) {
    // Esconde todas as seções
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active-section');
    });

    // Remove a classe 'active' de todos os links
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.classList.remove('active');
    });

    // Mostra a seção selecionada
    document.getElementById(sectionId).classList.add('active-section');
    
    // Adiciona classe 'active' ao link clicado (hack simples para encontrar o link certo)
    const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
    if(activeLink) activeLink.classList.add('active');
}

// Lógica do Carrinho
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('open');
}

function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
    // Abre o carrinho automaticamente ao adicionar
    const modal = document.getElementById('cart-modal');
    if (!modal.classList.contains('open')) {
        modal.classList.add('open');
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');

    // Limpa HTML atual
    cartItemsContainer.innerHTML = '';

    // Recalcula total
    total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <span>${item.name}</span>
            <span>R$ ${item.price.toFixed(2)}</span>
            <span style="color: red; cursor: pointer; margin-left: 10px;" onclick="removeFromCart(${index})">X</span>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartTotalElement.innerText = `R$ ${total.toFixed(2)}`;
    cartCountElement.innerText = cart.length;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function checkout() {
    if(cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    alert(`Compra simulada com sucesso!\nTotal: R$ ${total.toFixed(2)}\n\n(Lembrando: Isto é um site de teste, nada será cobrado).`);
    cart = [];
    updateCartUI();
    toggleCart();
}

// Lógica de Suporte
function sendTicket(event) {
    event.preventDefault(); // Impede o recarregamento da página
    alert("Ticket enviado com sucesso! Nossa equipe fictícia entrará em contato.");
    event.target.reset(); // Limpa o formulário
}
