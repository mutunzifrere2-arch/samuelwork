const KEY = 'samuel_works_v1', CODE = 'Sam30558';
let D = JSON.parse(localStorage.getItem(KEY) || 'null') || {
	days: {},
	projects: [],
	scripts: [],
	books: [],
	finance: [],
	needs: [],
	personal: {}
};

function save() {
	localStorage.setItem(KEY, JSON.stringify(D));
}

function unlock() {
	if (document.getElementById('pin').value === CODE) {
		sessionStorage.ok = '1';
		document.getElementById('lock').style.display = 'none';
		init();
	} else {
		alert('Code incorrect.');
	}
}

function lockApp() {
	sessionStorage.removeItem('ok');
	location.reload();
}

function init() {
	if (sessionStorage.ok !== '1') return;
	document.getElementById('lock').style.display = 'none';
	let now = new Date();
	document.getElementById('month').value = now.toISOString().slice(0, 7);
	document.getElementById('todayLabel').textContent = now.toLocaleDateString('fr-FR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	loadPersonal();
	renderAll();
}

function dayKey(d = new Date()) {
	return d.toISOString().slice(0, 10);
}

function getDay(k = dayKey()) {
	if (!D.days[k]) {
		D.days[k] = {
			main: ['', '', ''],
			secondary: ['', ''],
			done: [false, false, false, false, false]
		};
	}
	return D.days[k];
}

function taskRow(text, i, main) {
	return `<div class="task ${getDay().done[i] ? 'done' : ''}"><input type="checkbox" ${getDay().done[i] ? 'checked' : ''} onchange="toggleTask(${i})"><input class="input tasktext" value="${esc(text)}" placeholder="${main ? 'Tâche principale ' + (i + 1) : 'Tâche secondaire ' + (i - 2)}" onchange="setTask(${i},this.value)"></div>`;
}

function renderToday() {
	let x = getDay();
	document.getElementById('mainTasks').innerHTML = x.main.map((t, i) => taskRow(t, i, true)).join('');
	document.getElementById('secondaryTasks').innerHTML = x.secondary.map((t, i) => taskRow(t, i + 3, false)).join('');
}

function setTask(i, v) {
	let x = getDay();
	if (i < 3) x.main[i] = v;
	else x.secondary[i - 3] = v;
	save();
	renderCalendar();
	renderScore();
}

function toggleTask(i) {
	getDay().done[i] = !getDay().done[i];
	save();
	renderToday();
	renderCalendar();
	renderScore();
}

function addToday() {
	let x = getDay();
	let i = x.main.findIndex(v => !v);
	if (i < 0) i = x.secondary.findIndex(v => !v) + 3;
	if (i < 3) x.main[i] = x.main[i] || 'Nouvelle tâche';
	else if (i >= 3 && i < 5) x.secondary[i - 3] = x.secondary[i - 3] || 'Nouvelle tâche';
	save();
	renderToday();
}

function renderCalendar() {
	let el = document.getElementById('calendar'), v = document.getElementById('month').value;
	let [y, m] = v.split('-').map(Number), first = new Date(y, m - 1, 1), last = new Date(y, m, 0), start = (first.getDay() + 6) % 7;
	let out = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(x => `<div class="dayname">${x}</div>`).join('');
	for (let i = 0; i < start; i++) out += '<div></div>';
	for (let n = 1; n <= last.getDate(); n++) {
		let d = new Date(y, m - 1, n), k = dayKey(d), x = D.days[k], done = x ? x.done.filter(Boolean).length : 0;
		out += `<div class="day ${k === dayKey() ? 'today' : ''}" onclick="openDate('${k}')"><div class="daynum">${n}</div>${done ? '<span class="dot"></span>' + done + '/5' : ''}</div>`;
	}
	el.innerHTML = out;
}

function openDate(k) {
	let x = D.days[k] || { main: ['', '', ''], secondary: ['', ''], done: [false, false, false, false, false] };
	let text = [...x.main, ...x.secondary].map((t, i) => `${x.done[i] ? '☑' : '☐'} ${t || '(vide)'}`).join('\\n');
	alert(new Date(k + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '\\n\\n' + text);
}

function renderScore() {
	let now = new Date(), day = now.getDay(), mon = new Date(now);
	mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
	let total = 0, max = 0, vals = [];
	for (let i = 0; i < 7; i++) {
		let d = new Date(mon);
		d.setDate(mon.getDate() + i);
		let x = D.days[dayKey(d)];
		let s = x ? (x.done[0] ? 2 : 0) + (x.done[1] ? 2 : 0) + (x.done[2] ? 2 : 0) + (x.done[3] ? 1 : 0) + (x.done[4] ? 1 : 0) : 0;
		total += s;
		max += 8;
		vals.push(s);
	}
	let pct = Math.round(total / max * 100);
	document.getElementById('score').textContent = pct + '/100';
	document.getElementById('scorebar').style.width = pct + '%';
	document.getElementById('chart').innerHTML = vals.map((v, i) => `<div class="barcol"><i style="height:${Math.max(3, v / 8 * 130)}px"></i><small>${['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}</small></div>`).join('');
}

function addProject() {
	if (D.projects.length >= 3) return alert('Les 3 projets du mois sont déjà créés.');
	D.projects.push({ name: '', desc: '', done: false, month: new Date().toISOString().slice(0, 7) });
	save();
	renderProjects();
}

function renderProjects() {
	document.getElementById('projectsList').innerHTML = D.projects.map((p, i) => `<div class="card"><div class="between"><span class="pill">Projet ${i + 1}</span><input type="checkbox" ${p.done ? 'checked' : ''} onchange="D.projects[${i}].done=this.checked;save()"></div><br><input class="input" value="${esc(p.name)}" placeholder="Nom du projet" onchange="D.projects[${i}].name=this.value;save()"><br><br><textarea placeholder="Objectif, étapes, deadline..." onchange="D.projects[${i}].desc=this.value;save()">${esc(p.desc)}</textarea></div>`).join('');
}

function newScript() {
	D.scripts.push({ title: 'Nouveau script', type: 'short', hook: '', intro: '', dev: '', cta: '' });
	save();
	renderScripts();
	editScript(D.scripts.length - 1);
}

function renderScripts() {
	document.getElementById('scriptList').innerHTML = D.scripts.map((s, i) => `<button class="btn dark" style="width:100%;margin:4px 0;text-align:left" onclick="editScript(${i})">${esc(s.title)} · ${s.type}</button>`).join('');
}

function editScript(i) {
	let s = D.scripts[i], fields = s.type === 'long' ? [['hook', 'HOOK'], ['intro', 'INTRO'], ['dev', 'DÉVELOPPEMENT'], ['cta', 'CALL TO ACTION']] : [['hook', 'HOOK'], ['dev', 'DÉVELOPPEMENT'], ['cta', 'CALL TO ACTION']];
	document.getElementById('editor').innerHTML = `<div class="row"><input class="input" value="${esc(s.title)}" onchange="D.scripts[${i}].title=this.value;save();renderScripts()"><select class="input" onchange="D.scripts[${i}].type=this.value;save();editScript(${i})"><option ${s.type === 'short' ? 'selected' : ''}>short</option><option ${s.type === 'long' ? 'selected' : ''}>long</option></select></div>${fields.map(f => `<label style="display:block;margin-top:15px;font-weight:800">${f[1]}<textarea onchange="D.scripts[${i}].${f[0]}=this.value;save()">${esc(s[f[0]])}</textarea></label>`).join('')}`;
}

function addBook() {
	let cat = prompt('Catégorie : Argent, Art oratoire, Leadership, Émotions, Pensées…');
	if (!cat) return;
	D.books.push({ title: '', author: '', cat });
	save();
	renderBooks();
}

function renderBooks() {
	document.getElementById('booksList').innerHTML = D.books.map((b, i) => `<div class="card"><span class="pill">${esc(b.cat)}</span><br><br><input class="input" placeholder="Titre du livre" value="${esc(b.title)}" onchange="D.books[${i}].title=this.value;save()"><br><br><input class="input" placeholder="Auteur" value="${esc(b.author)}" onchange="D.books[${i}].author=this.value;save()"></div>`).join('');
}

function loadPersonal() {
	document.getElementById('weight').value = D.personal.weight || '';
	document.getElementById('height').value = D.personal.height || '';
}

function savePersonal() {
	D.personal.weight = document.getElementById('weight').value;
	D.personal.height = document.getElementById('height').value;
	save();
}

function addFinance() {
	let type = prompt('Type : épargne ou investissement');
	if (!['épargne', 'investissement'].includes(type)) return;
	let amount = Number(prompt('Montant'));
	if (!amount) return;
	let project = prompt('Pourquoi / nom du projet');
	D.finance.push({ type, amount, project, date: dayKey() });
	save();
	renderFinance();
}

function renderFinance() {
	let s = D.finance.filter(x => x.type === 'épargne').reduce((a, x) => a + x.amount, 0), i = D.finance.filter(x => x.type === 'investissement').reduce((a, x) => a + x.amount, 0);
	savingTotal.textContent = s.toLocaleString();
	investTotal.textContent = i.toLocaleString();
	netTotal.textContent = (s + i).toLocaleString();
	financeList.innerHTML = D.finance.map(x => `<div class="task"><span class="pill">${x.type}</span><div><b>${x.amount.toLocaleString()}</b> · ${esc(x.project || 'Sans objectif')}<div class="sub">${x.date}</div></div></div>`).join('');
	financeChart.innerHTML = D.finance.slice(-10).map(x => `<div class="barcol"><i style="height:${Math.min(140, Math.max(5, x.amount / 10))}px"></i><small>${x.amount}</small></div>`).join('');
}

function addNeed() {
	let level = prompt('Niveau : moins cher, moyen ou cher');
	let key = { 'moins cher': 'cheap', 'moyen': 'medium', 'cher': 'expensive' }[level?.toLowerCase()];
	if (!key) return;
	let name = prompt('Besoin à acheter');
	if (!name) return;
	D.needs.push({ name, level: key, done: false });
	save();
	renderNeeds();
}

function renderNeeds() {
	['cheap', 'medium', 'expensive'].forEach(k => document.getElementById(k).innerHTML = D.needs.filter(n => n.level === k).map((n, i) => {
		let idx = D.needs.indexOf(n);
		return `<div class="task ${n.done ? 'done' : ''}"><input type="checkbox" ${n.done ? 'checked' : ''} onchange="D.needs[${idx}].done=this.checked;save();renderNeeds()"><div>${esc(n.name)}</div></div>`;
	}).join(''));
}

function renderAll() {
	renderToday();
	renderCalendar();
	renderScore();
	renderProjects();
	renderScripts();
	renderBooks();
	renderFinance();
	renderNeeds();
}

function show(id, b) {
	document.querySelectorAll('.page').forEach(x => x.classList.add('hidden'));
	document.getElementById(id).classList.remove('hidden');
	document.querySelectorAll('.nav button').forEach(x => x.classList.remove('active'));
	b.classList.add('active');
}

function esc(s) {
	return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

document.getElementById('pin').addEventListener('keydown', e => {
	if (e.key === 'Enter') unlock();
});

if (sessionStorage.ok === '1') init();
