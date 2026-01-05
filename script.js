// --- VARIÁVEIS GLOBAIS ---
let cart = [];
let total = 0;
let currentUser = null;
let allUsers = [];

// --- INICIALIZAÇÃO DO SITE ---
document.addEventListener('DOMContentLoaded', () => {
    // Carrega usuários
    const storedUsers = localStorage.getItem('ghostUsersDB');
    if (storedUsers) {
        allUsers = JSON.parse(storedUsers);
    }
    // Verifica sessão
    const savedSession = sessionStorage.getItem('ghostCurrentUser');
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
        loginSuccess(currentUser);
    }
});

// --- SISTEMA DE AUTENTICAÇÃO ---
function toggleAuth(screen) {
    if (screen === 'register') {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    } else {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    if (allUsers.find(user => user.email === email)) {
        alert("Erro: Este e-mail já está cadastrado.");
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: pass,
        library: []
    };

    allUsers.push(newUser);
    saveDB();
    alert("Conta criada com sucesso! Faça login agora.");
    toggleAuth('login');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    const user = allUsers.find(u => u.email === email && u.password === pass);

    if (user) {
        loginSuccess(user);
    } else {
        alert("E-mail ou senha incorretos.");
    }
}

function loginSuccess(user) {
    currentUser = user;
    sessionStorage.setItem('ghostCurrentUser', JSON.stringify(user));
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('user-display').innerText = user.name;
    updateLibraryUI();
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('ghostCurrentUser');
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('login-form').reset();
    alert("Você saiu da conta.");
}

function saveDB() {
    localStorage.setItem('ghostUsersDB', JSON.stringify(allUsers));
}

// --- LÓGICA DE NAVEGAÇÃO ---
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active-section'));
    const links = document.querySelectorAll('nav a');
    links.forEach(l => l.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active-section');
    const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
    if(activeLink) activeLink.classList.add('active');
}

function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('open');
}

// --- CARRINHO ---
function addToCart(name, price) {
    const alreadyOwns = currentUser.library.some(item => item.name === name);
    if(alreadyOwns) { alert("Você já possui este item!"); return; }

    const inCart = cart.some(item => item.name === name);
    if(inCart) { alert("Já está no carrinho."); return; }

    cart.push({ name, price });
    updateCartUI();
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

// --- CHECKOUT ---
function checkout() {
    if(cart.length === 0) return alert("Carrinho vazio!");

    if(confirm(`Confirmar compra fictícia de R$ ${total.toFixed(2)}?`)) {
        cart.forEach(item => {
            currentUser.library.push({
                name: item.name,
                date: new Date().toLocaleDateString('pt-BR')
            });
        });

        const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
        allUsers[userIndex] = currentUser;
        saveDB();
        sessionStorage.setItem('ghostCurrentUser', JSON.stringify(currentUser));

        cart = [];
        updateCartUI();
        toggleCart();
        updateLibraryUI();
        showSection('biblioteca');
        alert("Compra realizada com sucesso!");
    }
}

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
        currentUser.library.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('library-item');
            div.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <span class="status">Adquirido em: ${item.date}</span>
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
    alert(`Iniciando download simulado de: ${itemName}...`);
}

// --- SUPORTE REAL (ENVIO DE E-MAIL) ---
function handleTicket(event) {
    event.preventDefault(); // Não recarrega a página

    const btn = document.getElementById('btn-submit');
    const originalText = btn.innerText;
    
    // Captura os dados do formulário
    const form = event.target;
    const formData = new FormData(form);

    // Mude o texto do botão para dar feedback
    btn.innerText = "Enviando...";
    btn.disabled = true;

    // --- COLOQUE SEU EMAIL ABAIXO ONDE DIZ "SEU_EMAIL_AQUI" ---
    // Exemplo: https://formsubmit.co/ajax/joao@gmail.com
    const emailDestino = "gabrielws12345@gmail.com"; 

    // Envio via AJAX para não sair da página
    fetch(`https://formsubmit.co/ajax/${emailDestino}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert("Ticket enviado com sucesso! Verifique seu e-mail em breve.");
        form.reset();
    })
    .catch(error => {
        alert("Erro ao enviar. Verifique se colocou o e-mail correto no código.");
        console.error('Erro:', error);
    })
    .finally(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    });
}
