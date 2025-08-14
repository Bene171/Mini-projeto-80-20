// 80/20: pegue DOM, reaja a eventos, atualize a tela, salve no localStorage.

const elForm = document.querySelector('#form-nova-tarefa');
const elInput = document.querySelector('#input-tarefa');
const elPrioridade = document.querySelector('#select-prioridade');
const elLista = document.querySelector('#lista');
const elFiltroTexto = document.querySelector('#input-filtro');
const elFiltroBotoes = document.querySelectorAll('.filtros-estado button');
const elBtnLimpar = document.querySelector('#btn-limpar');
const elContador = document.querySelector('#contador');

let estado = {
    tarefas: carregar(),
    filtroTexto: '',
    filtroEstado: 'todas' // 'todas' | 'abertas' | 'feitas'
};

function salvar() {
    localStorage.setItem('tarefas_8020', JSON.stringify(estado.tarefas));
}
function carregar() {
    try { return JSON.parse(localStorage.getItem('tarefas_8020')) ?? []; }
    catch { return []; }
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function adicionar(texto, prioridade = 'normal') {
    estado.tarefas.push({ id: uid(), texto, prioridade, feita: false, criadoEm: Date.now() });
    salvar(); render();
}
function alternarFeita(id) {
    const t = estado.tarefas.find(x => x.id === id);
    if (!t) return;
    t.feita = !t.feita;
    salvar(); render();
}
function remover(id) {
    estado.tarefas = estado.tarefas.filter(x => x.id !== id);
    salvar(); render();
}
function limparFeitas() {
    estado.tarefas = estado.tarefas.filter(x => !x.feita);
    salvar(); render();
}

function aplicaFiltros(list) {
    let res = list;
    if (estado.filtroTexto.trim()) {
        const q = estado.filtroTexto.toLowerCase();
        res = res.filter(t => t.texto.toLowerCase().includes(q));
    }
    if (estado.filtroEstado === 'abertas') res = res.filter(t => !t.feita);
    if (estado.filtroEstado === 'feitas') res = res.filter(t => t.feita);
    return res;
}

function render() {
    const visiveis = aplicaFiltros(estado.tarefas);
    elContador.textContent = visiveis.length;

    if (visiveis.length === 0) {
        elLista.innerHTML = `<div class="empty">Nada por aqui. Adicione uma tarefa 👇</div>`;
        return;
    }

    elLista.innerHTML = visiveis.map(t => `
    <li class="item ${t.feita ? 'feita' : ''}" data-id="${t.id}">
      <input type="checkbox" ${t.feita ? 'checked' : ''} aria-label="Concluir tarefa" />
      <div>
        <div>${esc(t.texto)}</div>
        <small class="badge ${t.prioridade}">${t.prioridade}</small>
      </div>
      <div class="actions">
        <button class="btn-del" title="Remover">Remover</button>
      </div>
    </li>
  `).join('');
}

// pequena proteção contra injeção ao exibir texto do usuário
function esc(s) {
    return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// === Eventos ===
elForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = elInput.value.trim();
    const prioridade = elPrioridade.value;
    if (!texto) return;
    adicionar(texto, prioridade);
    elInput.value = '';
    elInput.focus();
});

elLista.addEventListener('click', (e) => {
    const li = e.target.closest('.item');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.matches('input[type="checkbox"]')) {
        alternarFeita(id);
    }
    if (e.target.matches('.btn-del')) {
        remover(id);
    }
});

elFiltroTexto.addEventListener('input', (e) => {
    estado.filtroTexto = e.target.value;
    render();
});

elFiltroBotoes.forEach(btn => {
    btn.addEventListener('click', () => {
        elFiltroBotoes.forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        estado.filtroEstado = btn.dataset.estado;
        render();
    });
});

elBtnLimpar.addEventListener('click', limparFeitas);

// primeira renderização
render();
