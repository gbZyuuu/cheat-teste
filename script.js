// --- VARIÁVEIS GLOBAIS ---
let cart = [];
let total = 0;
let currentUser = null; // Armazena o usuário logado atualmente
let allUsers = []; // Banco de dados simulado

// --- INICIALIZAÇÃO DO SITE ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega o banco de dados de usuários do LocalStorage
    const storedUsers = localStorage.getItem('ghostUsersDB');
    if (storedUsers) {
        allUsers = JSON.parse(storedUsers);
    }

    // 2. Verifica se já existe alguém logado (Sessão persistente)
    const savedSession = sessionStorage.getItem('ghostCurrentUser');
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
        loginSuccess(currentUser);
    }
});

// --- SISTEMA DE AUTENTICAÇÃO (LOGIN/REGISTRO) ---

// Alterna entre formulário de login e registro
function toggleAuth(screen) {
    if (screen === 'register') {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    } else {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    }
}

// Cria novo usuário
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    // Verifica se e-mail já existe
    if (allUsers.find(user => user.email === email)) {
        alert("Erro: Este e-mail já está cadastrado.");
        return;
    }

    // Cria o objeto do novo usuário
    const newUser = {
        name: name,
        email: email,
        password: pass,
        library: [] // Começa com biblioteca vazia
    };

    // Salva no "Banco de Dados"
    allUsers.push(newUser);
    saveDB();

    alert("Conta criada com sucesso! Faça login agora.");
    toggleAuth('login');
}

// Faz o login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    // Procura o usuário no array
    const user = allUsers.find(u => u.email === email && u.password === pass);

    if (user) {
        loginSuccess(user);
    } else {
        alert("E-mail ou senha incorretos.");
    }
}

// Executa quando o login é bem sucedido
function loginSuccess(user) {
    currentUser = user;
    sessionStorage.setItem('ghostCurrentUser', JSON.stringify(user)); // Salva sessão
    
    // Atualiza interface: Esconde login, Mostra site
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('user-display').innerText = user.name;
    
    // Carrega a biblioteca DESTE usuário
    updateLibraryUI();
}

// Faz logout
function logout() {
    currentUser = null;
    sessionStorage.removeItem('ghostCurrentUser');
    
    // Reseta interface
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('login-form').reset();
    
    alert("Você saiu da conta.");
}

// Salva o estado atual de todos os usuários no navegador
function saveDB() {
    localStorage.setItem('ghostUsersDB', JSON.stringify(allUsers));
}

// --- LÓGICA DE NAVEGAÇÃO E UI ---

function showSection(sectionId) {
    // Esconde todas
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active-section'));
    
    // Remove active dos links
    const links = document.querySelectorAll('nav a');
    links.forEach(l => l.classList.remove('active'));

    // Mostra a selecionada
    document.getElementById(sectionId).classList.add('active-section');
    
    // Marca link como ativo
    const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
    if(activeLink) activeLink.classList.add('active');
}

function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('open');
}

// --- SISTEMA DE COMPRAS E CARRINHO ---

function addToCart(name, price) {
    // Segurança: Verifica se o usuário já tem esse item
    const alreadyOwns = currentUser.library.some(item => item.name === name);
    if(alreadyOwns) {
        alert("Você já possui este item na sua biblioteca!");
        return;
    }

    // Verifica se já está no carrinho
    const inCart = cart.some(item => item.name === name);
    if(inCart) { alert("Já está no carrinho."); return; }

    // Adiciona
    cart.push({ name, price });
    updateCartUI();
    
    // Abre o carrinho
    const modal = document.getElementById('cart-modal');
    if (!modal.classList.contains('open')) modal.classList.add('open');
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>R$ ${item.price.toFixed(2)}</span>
                <span style="color:red;cursor:pointer" onclick="removeFromCart(${index})">&times;</span>
            </div>`;
    });
    document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById('cart-count').innerText = cart.length;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// --- CHECKOUT (FINALIZAÇÃO) ---
function checkout() {
    if(cart.length === 0) return alert("Carrinho vazio!");

    if(confirm(`Confirmar compra fictícia de R$ ${total.toFixed(2)}?`)) {
        
        // Adiciona itens à biblioteca do usuário ATUAL
        cart.forEach(item => {
            currentUser.library.push({
                name: item.name,
                date: new Date().toLocaleDateString('pt-BR')
            });
        });

        // ATUALIZAÇÃO DO "BANCO DE DADOS"
        // 1. Encontra o usuário na lista geral e atualiza os dados dele
        const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
        allUsers[userIndex] = currentUser;

        // 2. Salva a lista atualizada no LocalStorage
        saveDB();

        // 3. Atualiza a sessão atual
        sessionStorage.setItem('ghostCurrentUser', JSON.stringify(currentUser));

        // Limpa carrinho e redireciona
        cart = [];
        updateCartUI();
        toggleCart();
        updateLibraryUI();
        showSection('biblioteca');
        
        alert("Compra realizada com sucesso! Item adicionado à sua conta.");
    }
}

// --- BIBLIOTECA DO USUÁRIO ---
function updateLibraryUI() {
    const container = document.getElementById('library-container');
    const emptyState = document.getElementById('empty-library');
    container.innerHTML = '';

    if (!currentUser || currentUser.library.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        container.style.display = 'block';
        emptyState.style.display = 'none';

        // Renderiza cada item da biblioteca do usuário
        currentUser.library.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('library-item');
            div.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <span class="status">Adquirido em: ${item.date} • Vitalício</span>
                </div>
                <button class="download-btn" onclick="downloadFile('${item.name}')">
                    <i class="fas fa-download"></i> Download
                </button>
            `;
            container.appendChild(div);
        });
    }
}

function downloadFile(itemName) {
    alert(`Iniciando download simulado de: ${itemName}...\n(Arquivo fictício)`);
}

// --- SUPORTE (NETLIFY) ---
function handleTicket(event) {
    // O envio real ocorre via Netlify Forms (backend automático).
    // O JS aqui serve apenas para feedback visual se não houver redirecionamento.
    alert("Ticket enviado para o sistema de suporte!");
}
