const fs = require('fs');
const path = require('path');

const sourceDir = __dirname;
const publicDir = path.join(sourceDir, 'public');
const assetsDir = path.join(sourceDir, 'assets');
const markdownFile = path.join(sourceDir, 'arquetipos_descricoes.md');

// Template Files
const templateArquetipo = path.join(sourceDir, 'template_arquetipo.html');
const templateIndex = path.join(sourceDir, 'template_index.html');
const templateGuia = path.join(sourceDir, 'template_guia.html');
const templateContato = path.join(sourceDir, 'template_contato.html');
const templateTermos = path.join(sourceDir, 'template_termos.html');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Copy assets
if (fs.existsSync(assetsDir)) {
    fs.cpSync(assetsDir, path.join(publicDir, 'assets'), { recursive: true });
}

// Archetype Categories
const categories = {
    'Racionais': ['Arquiteto', 'Conservador', 'Justo', 'Pontual'],
    'Emocionais': ['Cuidador', 'Delicado', 'Amante', 'Puro'],
    'Criativos': ['Adaptável', 'Boêmio', 'Criador', 'Engraçado'],
    'Poderosos': ['Governante', 'Herói', 'Jogador', 'Ostentador', 'Rebelde'],
    'Espirituais': ['Audacioso', 'Mítico', 'Sábio', 'Simples']
};

// Helper to normalize strings for filenames (e.g. "Adaptável" -> "adaptavel")
function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Read Files
const markdownContent = fs.readFileSync(markdownFile, 'utf8');
const arquetipoTpl = fs.readFileSync(templateArquetipo, 'utf8');
const indexTpl = fs.readFileSync(templateIndex, 'utf8');
const guiaTpl = fs.readFileSync(templateGuia, 'utf8');
const contatoTpl = fs.readFileSync(templateContato, 'utf8');
const termosTpl = fs.readFileSync(templateTermos, 'utf8');

// Parse Markdown
const archetypes = [];
const chunks = markdownContent.split('---').map(c => c.trim()).filter(c => c);

chunks.forEach(chunk => {
    const lines = chunk.split('\n').map(l => l.trim());
    const archetype = {
        title: '',
        image: '',
        description: '',
        questions: [],
        positiveTerms: [],
        negativeTerms: [],
        examples: []
    };

    let currentSection = 'description';
    let currentExample = null;

    lines.forEach(line => {
        if (line.startsWith('# ')) {
            archetype.title = line.replace('# ', '').trim();
        } else if (line.startsWith('![')) {
            const match = line.match(/\((.*?)\)/);
            if (match) {
                if (currentSection === 'examples') {
                    if (currentExample) archetype.examples.push(currentExample);
                    currentExample = { image: match[1], text: '' };
                } else {
                    archetype.image = match[1];
                }
            }
        } else if (line.startsWith('### Perguntas para reflexão')) {
            currentSection = 'questions';
        } else if (line.startsWith('### Termos Positivos')) {
            currentSection = 'positiveTerms';
        } else if (line.startsWith('### Termos Negativos')) {
            currentSection = 'negativeTerms';
        } else if (line.startsWith('### Exemplos')) {
            currentSection = 'examples';
        } else if (line.startsWith('- ')) {
            const item = line.replace('- ', '').trim();
            if (currentSection === 'questions') archetype.questions.push(item);
            if (currentSection === 'positiveTerms') archetype.positiveTerms.push(item);
            if (currentSection === 'negativeTerms') archetype.negativeTerms.push(item);
        } else if (line.length > 0) {
            if (currentSection === 'description') {
                archetype.description += line + '\n';
            } else if (currentSection === 'examples' && currentExample) {
                currentExample.text += line + '\n';
            }
        }
    });
    if (currentExample) archetype.examples.push(currentExample);

    // Clean up description and example text
    archetype.description = archetype.description.trim().replace(/\n/g, '<br>');
    archetype.examples.forEach(ex => {
        ex.text = ex.text.trim().replace(/\n/g, '<br>');
        ex.text = ex.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    });
    archetype.description = archetype.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    archetypes.push(archetype);
});

// Sidebar Generator
function generateSidebar(currentTitle) {
    let html = '<div class="col-md-3" id="menu-lateral">';
    for (const [category, items] of Object.entries(categories)) {
        html += `<h6 class="text-info">${category}</h6><ul class="list-unstyled">`;
        items.forEach(item => {
            const link = normalize(item) + '.html';
            const active = item === currentTitle ? 'fw-bold' : '';
            html += `<li><a href="${link}" class="${active}">${item}</a></li>`;
        });
        html += `</ul>`;
    }
    html += '</div>';
    return html;
}

const footerLink = '<a href="termos-de-uso.html" style="font-size: 12px; text-decoration: none; color: inherit;">Termos de Uso</a>';
const copyrightText = 'Todos os direitos reservados.</a>';

function addTermsLink(content) {
    if (!content.includes('termos-de-uso.html')) {
        return content.replace(copyrightText, copyrightText + '<br>' + footerLink);
    }
    return content;
}

// Generate Archetype Pages
archetypes.forEach(arch => {
    const filename = normalize(arch.title) + '.html';
    const sidebar = generateSidebar(arch.title);

    let questionsHtml = '';
    if (arch.questions.length > 0) {
        questionsHtml = `<h3 class="text-uppercase mt-4 h6">Perguntas para reflexão</h3>
        <ul class="list-unstyled mb-4 small">
            ${arch.questions.map(q => `<li class="d-flex gap-2"><span class="fw-bold">•</span><span>${q}</span></li>`).join('')}
        </ul>`;
    }

    let examplesHtml = '';
    arch.examples.forEach(ex => {
        examplesHtml += `
        <div class="col-md-6 p-4">
            <img src="${ex.image}" class="img-fluid mb-2" style="max-height: 60px; width: auto;" referrerpolicy="no-referrer">
            <p class="mt-2">${ex.text}</p>
        </div>`;
    });

    let positiveTermsHtml = arch.positiveTerms.map(t => `<li class="list-inline-item badge text-bg-light text-dark">${t}</li>`).join('');
    let negativeTermsHtml = arch.negativeTerms.map(t => `<li class="list-inline-item badge text-bg-light text-dark">${t}</li>`).join('');

    let pageContent = arquetipoTpl
        .replace(/{{TITLE}}/g, arch.title)
        .replace(/{{IMAGE}}/g, arch.image)
        .replace(/{{DESCRIPTION}}/g, arch.description)
        .replace(/{{SIDEBAR}}/g, sidebar)
        .replace(/{{QUESTIONS}}/g, questionsHtml)
        .replace(/{{POSITIVE_TERMS}}/g, positiveTermsHtml)
        .replace(/{{NEGATIVE_TERMS}}/g, negativeTermsHtml)
        .replace(/{{EXAMPLES}}/g, examplesHtml);

    pageContent = addTermsLink(pageContent);

    fs.writeFileSync(path.join(publicDir, filename), pageContent);
});

// Generate Index Page
fs.writeFileSync(path.join(publicDir, 'index.html'), addTermsLink(indexTpl));

// Generate Contato Page
fs.writeFileSync(path.join(publicDir, 'contato.html'), addTermsLink(contatoTpl));

// Generate Termos Page
fs.writeFileSync(path.join(publicDir, 'termos-de-uso.html'), termosTpl);

// Generate Guia Page
let guiaGridHtml = '';
for (const [category, items] of Object.entries(categories)) {
    guiaGridHtml += `<div class="col-12 mt-4"><h3>${category}</h3></div>`;
    items.forEach(item => {
        const arch = archetypes.find(a => normalize(a.title) === normalize(item));
        const img = arch ? arch.image : '';
        const link = normalize(item) + '.html';
        guiaGridHtml += `
        <div class="col-md-6 col-lg-4 project-sidebar-card mb-4">
            <a href="${link}">
                <img class="img-fluid rounded-4 image scale-on-hover" src="${img}" alt="${item}" referrerpolicy="no-referrer">
            </a>
            <h4 class="mt-2 text-center">${item}</h4>
        </div>`;
    });
}
const sidebarGuia = generateSidebar('');

let guiaContent = guiaTpl
    .replace(/{{SIDEBAR}}/g, sidebarGuia)
    .replace(/{{GRID_CONTENT}}/g, guiaGridHtml);

fs.writeFileSync(path.join(publicDir, 'guia-arquetipos.html'), addTermsLink(guiaContent));

console.log('Build complete using templates. Files generated in public directory.');
