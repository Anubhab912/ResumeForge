const SECTIONS = {
  basics: { title: 'Personal information', sub: 'Start with your contact details' },
  experience: { title: 'Work experience', sub: 'Add your professional history' },
  education: { title: 'Education', sub: 'Degrees, diplomas and coursework' },
  skills: { title: 'Skills', sub: 'Languages, frameworks and tools' },
  projects: { title: 'Projects', sub: 'Personal and professional projects' },
  certifications: { title: 'Certifications', sub: 'Licenses and certificates' },
  publications: { title: 'Publications', sub: 'Papers, articles and books' },
  custom: { title: 'Custom section', sub: 'Add anything else' },
  export: { title: 'Export & share', sub: 'Download your PDF or share it' },
};

let currentTemplate = 'ats';
let tags = { lang: [], fw: [], tools: [], soft: [] };
let entries = { exp: [], edu: [], proj: [], cert: [], pub: [], custom: [] };
let entryCounter = 0;

/* ── Navigation ── */
function switchSection(name) {
  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  const keys = Object.keys(SECTIONS);
  document.querySelectorAll('.nav-item')[keys.indexOf(name)].classList.add('active');
  document.getElementById('toolbar-title').textContent = SECTIONS[name].title;
  document.getElementById('toolbar-sub').textContent = SECTIONS[name].sub;
}

function setTemplate(tpl) {
  currentTemplate = tpl;
  document.querySelectorAll('.tpl-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tpl-' + tpl).classList.add('active');
  showToast('Template: ' + (tpl === 'ats' ? 'ATS Clean' : 'FANG Modern'));
}

/* ── Tag inputs ── */
function handleTag(e, key) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const val = e.target.value.trim().replace(/,$/, '');
    if (val) { tags[key].push(val); e.target.value = ''; renderTags(key); }
  } else if (e.key === 'Backspace' && !e.target.value && tags[key].length) {
    tags[key].pop(); renderTags(key);
  }
}

function focusTagInput(key) { document.getElementById('tag-input-' + key).focus(); }

function renderTags(key) {
  const wrap = document.getElementById('tags-' + key);
  const input = document.getElementById('tag-input-' + key);
  wrap.querySelectorAll('.tag').forEach(t => t.remove());
  tags[key].forEach((t, i) => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.innerHTML = `${t}<button onclick="removeTag('${key}',${i})">×</button>`;
    wrap.insertBefore(el, input);
  });
}

function removeTag(key, i) { tags[key].splice(i, 1); renderTags(key); }

/* ── Entry templates ── */
const ENTRY_HTML = {
  exp: id => `
    <div class="field-row">
      <div class="field-group"><label class="field-label">Job title</label><input type="text" id="exp-title-${id}" placeholder="Software Engineer"></div>
      <div class="field-group"><label class="field-label">Company</label><input type="text" id="exp-company-${id}" placeholder="Google"></div>
    </div>
    <div class="field-row">
      <div class="field-group"><label class="field-label">Start date</label><input type="text" id="exp-start-${id}" placeholder="Jan 2022"></div>
      <div class="field-group"><label class="field-label">End date</label><input type="text" id="exp-end-${id}" placeholder="Present"></div>
    </div>
    <div class="field-group"><label class="field-label">Location</label><input type="text" id="exp-loc-${id}" placeholder="Mountain View, CA"></div>
    <div class="field-group"><label class="field-label">Key achievements (one per line, use metrics)</label>
      <textarea id="exp-bullets-${id}" placeholder="• Led migration to microservices, reducing latency by 40%&#10;• Mentored 5 junior engineers..."></textarea>
    </div>`,

  edu: id => `
    <div class="field-row">
      <div class="field-group"><label class="field-label">Degree</label><input type="text" id="edu-degree-${id}" placeholder="B.S. Computer Science"></div>
      <div class="field-group"><label class="field-label">Institution</label><input type="text" id="edu-school-${id}" placeholder="MIT"></div>
    </div>
    <div class="field-row">
      <div class="field-group"><label class="field-label">Year</label><input type="text" id="edu-year-${id}" placeholder="2020"></div>
      <div class="field-group"><label class="field-label">GPA (optional)</label><input type="text" id="edu-gpa-${id}" placeholder="3.9 / 4.0"></div>
    </div>
    <div class="field-group"><label class="field-label">Relevant coursework / honors</label>
      <input type="text" id="edu-notes-${id}" placeholder="Summa Cum Laude, Dean's List...">
    </div>`,

  proj: id => `
    <div class="field-row">
      <div class="field-group"><label class="field-label">Project name</label><input type="text" id="proj-name-${id}" placeholder="OpenAI Wrapper CLI"></div>
      <div class="field-group"><label class="field-label">Tech stack</label><input type="text" id="proj-stack-${id}" placeholder="Python, FastAPI, Docker"></div>
    </div>
    <div class="field-group"><label class="field-label">Project URL (optional)</label><input type="url" id="proj-url-${id}" placeholder="github.com/you/project"></div>
    <div class="field-group"><label class="field-label">Description</label>
      <textarea id="proj-desc-${id}" placeholder="What it does, impact, metrics..."></textarea>
    </div>`,

  cert: id => `
    <div class="field-row">
      <div class="field-group"><label class="field-label">Certification name</label><input type="text" id="cert-name-${id}" placeholder="AWS Solutions Architect"></div>
      <div class="field-group"><label class="field-label">Issuer</label><input type="text" id="cert-issuer-${id}" placeholder="Amazon Web Services"></div>
    </div>
    <div class="field-row">
      <div class="field-group"><label class="field-label">Date</label><input type="text" id="cert-date-${id}" placeholder="March 2024"></div>
      <div class="field-group"><label class="field-label">Credential ID / URL</label><input type="text" id="cert-id-${id}" placeholder="ABC123"></div>
    </div>`,

  pub: id => `
    <div class="field-group"><label class="field-label">Title</label><input type="text" id="pub-title-${id}" placeholder="Attention Is All You Need"></div>
    <div class="field-row">
      <div class="field-group"><label class="field-label">Authors</label><input type="text" id="pub-authors-${id}" placeholder="Smith, J. et al."></div>
      <div class="field-group"><label class="field-label">Venue / Journal</label><input type="text" id="pub-venue-${id}" placeholder="NeurIPS 2024"></div>
    </div>
    <div class="field-row">
      <div class="field-group"><label class="field-label">Year</label><input type="text" id="pub-year-${id}" placeholder="2024"></div>
      <div class="field-group"><label class="field-label">DOI / URL</label><input type="url" id="pub-doi-${id}" placeholder="doi.org/..."></div>
    </div>`,

  custom: id => `
    <div class="field-row">
      <div class="field-group"><label class="field-label">Item title</label><input type="text" id="custom-item-title-${id}" placeholder="Award name, activity..."></div>
      <div class="field-group"><label class="field-label">Date</label><input type="text" id="custom-item-date-${id}" placeholder="2024"></div>
    </div>
    <div class="field-group"><label class="field-label">Description</label>
      <textarea id="custom-item-desc-${id}" placeholder="Brief description..."></textarea>
    </div>`,
};

const ENTRY_NAMES = { exp: 'Experience', edu: 'Education', proj: 'Project', cert: 'Certification', pub: 'Publication', custom: 'Item' };

function addEntry(type) {
  const id = ++entryCounter;
  entries[type].push(id);
  const list = document.getElementById(type + '-list');
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.id = 'entry-' + type + '-' + id;
  card.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-title">${ENTRY_NAMES[type]} ${entries[type].length}</span>
      <button class="btn-remove" onclick="removeEntry('${type}',${id})">×</button>
    </div>
    ${ENTRY_HTML[type](id)}`;
  list.appendChild(card);
}

function removeEntry(type, id) {
  const card = document.getElementById('entry-' + type + '-' + id);
  if (card) card.remove();
  entries[type] = entries[type].filter(i => i !== id);
}

/* ── Collect all form data ── */
function collectData() {
  const g = id => (document.getElementById(id) || {}).value || '';
  return {
    name: g('name'), title: g('title'), email: g('email'), phone: g('phone'),
    location: g('location'), linkedin: g('linkedin'), github: g('github'),
    website: g('website'), summary: g('summary'),
    skills: { ...tags },
    experience: entries.exp.map(id => ({
      title: g('exp-title-' + id), company: g('exp-company-' + id),
      start: g('exp-start-' + id), end: g('exp-end-' + id),
      loc: g('exp-loc-' + id), bullets: g('exp-bullets-' + id),
    })),
    education: entries.edu.map(id => ({
      degree: g('edu-degree-' + id), school: g('edu-school-' + id),
      year: g('edu-year-' + id), gpa: g('edu-gpa-' + id),
      notes: g('edu-notes-' + id),
    })),
    projects: entries.proj.map(id => ({
      name: g('proj-name-' + id), stack: g('proj-stack-' + id),
      url: g('proj-url-' + id), desc: g('proj-desc-' + id),
    })),
    certifications: entries.cert.map(id => ({
      name: g('cert-name-' + id), issuer: g('cert-issuer-' + id),
      date: g('cert-date-' + id), credId: g('cert-id-' + id),
    })),
    publications: entries.pub.map(id => ({
      title: g('pub-title-' + id), authors: g('pub-authors-' + id),
      venue: g('pub-venue-' + id), year: g('pub-year-' + id),
      doi: g('pub-doi-' + id),
    })),
    customTitle: g('custom-title'),
    custom: entries.custom.map(id => ({
      title: g('custom-item-title-' + id),
      date: g('custom-item-date-' + id),
      desc: g('custom-item-desc-' + id),
    })),
  };
}

/* ── LaTeX helpers ── */
function esc(s) {
  return (s || '')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/* ── LaTeX generation ── */
function generateLatex(data) {
  const isATS = currentTemplate === 'ats';

  // ── ATS Header: plain centered, black & white, titlerule dividers ────────
  const atsHeader = [
    '\\documentclass[10pt,a4paper]{article}',
    '\\usepackage[margin=1in]{geometry}',
    '\\usepackage{enumitem}',
    '\\usepackage[hidelinks]{hyperref}',
    '\\usepackage{titlesec}',
    '\\usepackage{parskip}',
    '\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]',
    '\\setlength{\\parindent}{0pt}',
    '\\pagestyle{empty}',
    '\\begin{document}',
    '{\\LARGE\\textbf{' + esc(data.name) + '}}\\\\[2pt]',
    '{\\small ' + esc(data.title) + ' $\\cdot$ ' + esc(data.email) + ' $\\cdot$ ' + esc(data.phone) + ' $\\cdot$ ' + esc(data.location) + '}\\\\',
    '{\\small ' + esc(data.linkedin) + ' $\\cdot$ ' + esc(data.github) + ' $\\cdot$ ' + esc(data.website) + '}',
    '\\vspace{4pt}',
  ].join('\n');

  // ── FANG Header: two-tone blue, right-aligned contact, bold name + icons ──
  const fangHeader = [
    '\\documentclass[10pt,a4paper]{article}',
    '\\usepackage[margin=0.75in]{geometry}',
    '\\usepackage{enumitem}',
    '\\usepackage[hidelinks]{hyperref}',
    '\\usepackage{xcolor}',
    '\\usepackage{titlesec}',
    '\\usepackage{parskip}',
    '\\usepackage{fontawesome5}',
    '\\definecolor{accent}{RGB}{30,80,160}',
    '\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0em}{}[\\color{accent}\\titlerule]',
    '\\setlength{\\parindent}{0pt}',
    '\\pagestyle{empty}',
    '\\begin{document}',
    // Row 1: Name (left) | email · phone (right)
    '{\\LARGE\\textbf{\\color{accent}' + esc(data.name) + '}} \\hfill'
    + (data.email ? ' {\\small\\faEnvelope\\ \\href{mailto:' + esc(data.email) + '}{' + esc(data.email) + '}}' : '')
    + (data.phone ? ' $\\cdot$ {\\small\\faPhone\\ ' + esc(data.phone) + '}' : '')
    + '\\\\',
    // Row 2: Title (left) | location · linkedin (right)
    '{\\large ' + esc(data.title) + '} \\hfill'
    + (data.location ? ' {\\small\\faMapMarker*\\ ' + esc(data.location) + '}' : '')
    + (data.linkedin ? ' $\\cdot$ {\\small\\faLinkedin\\ \\href{https://' + esc(data.linkedin) + '}{' + esc(data.linkedin) + '}}' : '')
    + '\\\\',
    // Row 3: github · website (right-aligned)
    '\\hfill'
    + (data.github ? ' {\\small\\faGithub\\ \\href{https://' + esc(data.github) + '}{' + esc(data.github) + '}}' : '')
    + (data.website ? ' $\\cdot$ {\\small\\faGlobe\\ \\href{https://' + esc(data.website) + '}{' + esc(data.website) + '}}' : ''),
    '\\vspace{4pt}',
  ].join('\n');

  let latex = (isATS ? atsHeader : fangHeader) + '\n\n';

  // ── Summary ───────────────────────────────────────────────────────────────
  if (data.summary) {
    if (isATS) {
      latex += '\\section{Summary}\n' + esc(data.summary) + '\n\n';
    } else {
      latex += '\\section{Professional Summary}\n{\\color{black}' + esc(data.summary) + '}\n\n';
    }
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (data.experience.length) {
    latex += '\\section{Experience}\n';
    data.experience.forEach(e => {
      if (isATS) {
        latex += '\\textbf{' + esc(e.title) + '} \\hfill ' + esc(e.start) + ' -- ' + esc(e.end) + '\\\\\n';
        latex += '\\textit{' + esc(e.company) + '} \\hfill ' + esc(e.loc) + '\\\\\n';
      } else {
        latex += '\\textbf{\\color{accent}' + esc(e.title) + '} \\hfill {\\small\\bfseries ' + esc(e.start) + ' -- ' + esc(e.end) + '}\\\\\n';
        latex += '\\textit{' + esc(e.company) + '} \\hfill {\\small\\itshape ' + esc(e.loc) + '}\\\\\n';
      }
      if (e.bullets) {
        latex += '\\begin{itemize}[noitemsep,topsep=2pt,leftmargin=*]\n';
        e.bullets.split('\n').filter(b => b.trim()).forEach(b => {
          latex += '  \\item ' + esc(b.replace(/^[•\-]\s*/, '')) + '\n';
        });
        latex += '\\end{itemize}\n';
      }
      latex += '\\vspace{4pt}\n';
    });
    latex += '\n';
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (data.education.length) {
    latex += '\\section{Education}\n';
    data.education.forEach(e => {
      if (isATS) {
        latex += '\\textbf{' + esc(e.school) + '} \\hfill ' + esc(e.year) + '\\\\\n';
        latex += esc(e.degree);
        if (e.gpa) latex += ' $\\cdot$ GPA: ' + esc(e.gpa);
        if (e.notes) latex += ' $\\cdot$ ' + esc(e.notes);
      } else {
        latex += '\\textbf{' + esc(e.school) + '} \\hfill {\\color{accent}\\textbf{' + esc(e.year) + '}}\\\\\n';
        latex += '\\textit{' + esc(e.degree) + '}';
        if (e.gpa) latex += ' $|$ \\textbf{GPA: ' + esc(e.gpa) + '}';
        if (e.notes) latex += '\\\\\n{\\small ' + esc(e.notes) + '}';
      }
      latex += '\\\\\n\\vspace{4pt}\n';
    });
    latex += '\n';
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const hasSkills = [...data.skills.lang, ...data.skills.fw, ...data.skills.tools, ...data.skills.soft].length;
  if (hasSkills) {
    latex += '\\section{Skills}\n';
    if (isATS) {
      // ATS: plain inline comma-separated lists
      if (data.skills.lang.length) latex += '\\textbf{Languages:} ' + data.skills.lang.map(esc).join(', ') + '\\\\\n';
      if (data.skills.fw.length) latex += '\\textbf{Frameworks:} ' + data.skills.fw.map(esc).join(', ') + '\\\\\n';
      if (data.skills.tools.length) latex += '\\textbf{Tools:} ' + data.skills.tools.map(esc).join(', ') + '\\\\\n';
      if (data.skills.soft.length) latex += '\\textbf{Soft skills:} ' + data.skills.soft.map(esc).join(', ') + '\\\\\n';
    } else {
      // FANG: two-column table with accent bold labels and bullet-separated values
      latex += '{\\renewcommand{\\arraystretch}{1.2}\\begin{tabular}{@{}{\\color{accent}\\bfseries}p{2.2cm} p{\\dimexpr\\linewidth-2.6cm}@{}}\\n';
      if (data.skills.lang.length) latex += 'Languages & ' + data.skills.lang.map(esc).join(' $\\cdot$ ') + ' \\\\\\\\[-3pt]\\n';
      if (data.skills.fw.length) latex += 'Frameworks & ' + data.skills.fw.map(esc).join(' $\\cdot$ ') + ' \\\\\\\\[-3pt]\\n';
      if (data.skills.tools.length) latex += 'Tools & ' + data.skills.tools.map(esc).join(' $\\cdot$ ') + ' \\\\\\\\[-3pt]\\n';
      if (data.skills.soft.length) latex += 'Soft Skills & ' + data.skills.soft.map(esc).join(' $\\cdot$ ') + ' \\\\\\\\\\n';
      latex += '\\end{tabular}}\\n';
    }
    latex += '\n';
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if (data.projects.length) {
    latex += '\\section{Projects}\n';
    data.projects.forEach(p => {
      if (isATS) {
        latex += '\\textbf{' + esc(p.name) + '}';
        if (p.stack) latex += ' $|$ \\textit{' + esc(p.stack) + '}';
        if (p.url) latex += ' \\hfill \\texttt{' + esc(p.url) + '}';
      } else {
        latex += '\\textbf{\\color{accent}' + esc(p.name) + '}';
        if (p.stack) latex += ' {\\small $|$ \\textit{' + esc(p.stack) + '}}';
        if (p.url) latex += ' \\hfill {\\small\\ttfamily ' + esc(p.url) + '}';
      }
      latex += '\\\\\n';
      if (p.desc) latex += esc(p.desc) + '\\\\\n';
      latex += '\\vspace{4pt}\n';
    });
    latex += '\n';
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (data.certifications.length) {
    latex += '\\section{Certifications}\n\\begin{itemize}[noitemsep,leftmargin=*]\n';
    data.certifications.forEach(c => {
      if (isATS) {
        latex += '  \\item \\textbf{' + esc(c.name) + '} -- ' + esc(c.issuer);
        if (c.date) latex += ', ' + esc(c.date);
        if (c.credId) latex += ' (' + esc(c.credId) + ')';
      } else {
        latex += '  \\item {\\color{accent}\\textbf{' + esc(c.name) + '}} $|$ \\textit{' + esc(c.issuer) + '}';
        if (c.date) latex += ' \\hfill {\\small ' + esc(c.date) + '}';
      }
      latex += '\n';
    });
    latex += '\\end{itemize}\n\n';
  }

  // ── Publications ──────────────────────────────────────────────────────────
  if (data.publications.length) {
    latex += '\\section{Publications}\n\\begin{enumerate}[noitemsep,leftmargin=*]\n';
    data.publications.forEach(p => {
      latex += '  \\item ' + esc(p.authors) + '. \\textit{' + esc(p.title) + '}. ' + esc(p.venue);
      if (p.year) latex += ', ' + esc(p.year);
      if (p.doi) latex += '. \\url{' + p.doi + '}';
      latex += '\n';
    });
    latex += '\\end{enumerate}\n\n';
  }

  // ── Custom ────────────────────────────────────────────────────────────────
  if (data.custom.length && data.customTitle) {
    latex += '\\section{' + esc(data.customTitle) + '}\n\\begin{itemize}[noitemsep,leftmargin=*]\n';
    data.custom.forEach(c => {
      if (isATS) {
        latex += '  \\item \\textbf{' + esc(c.title) + '}';
        if (c.date) latex += ' (' + esc(c.date) + ')';
        if (c.desc) latex += ': ' + esc(c.desc);
      } else {
        latex += '  \\item {\\color{accent}\\textbf{' + esc(c.title) + '}}';
        if (c.date) latex += ' \\hfill {\\small ' + esc(c.date) + '}';
        if (c.desc) latex += '\\\\\n  ' + esc(c.desc);
      }
      latex += '\n';
    });
    latex += '\\end{itemize}\n\n';
  }

  latex += '\\end{document}';
  return latex;
}

/* ── Compile via API ── */
function setStatus(state, msg) {
  document.getElementById('status-dot').className = 'status-dot' + (state === 'pending' ? ' pending' : state === 'error' ? ' error' : '');
  document.getElementById('status-text').textContent = msg;
}

async function compileLatex(latex) {
  setStatus('pending', 'Sending to LaTeX compiler…');
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler: 'pdflatex', resources: [{ main: true, content: latex }] }),
  });
  if (!res.ok) {
    setStatus('error', `Compilation failed (${res.status}). Check your inputs and try again.`);
    throw new Error('Compiler HTTP ' + res.status);
  }
  setStatus('ok', 'Compiled successfully');
  return res.blob();
}

async function compileAndDownload() {
  const data = collectData();
  if (!data.name) { showToast('Please enter your name first'); switchSection('basics'); return; }
  try {
    const blob = await compileLatex(generateLatex(data));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (data.name.replace(/\s+/g, '_') || 'resume') + '_resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Resume downloaded!');
    switchSection('export');
  } catch (e) { console.error(e); }
}

async function previewResume() {
  const data = collectData();
  if (!data.name) { showToast('Please enter your name first'); switchSection('basics'); return; }
  switchSection('export');
  try {
    const blob = await compileLatex(generateLatex(data));
    const url = URL.createObjectURL(blob);
    document.getElementById('preview-area').innerHTML =
      `<iframe src="${url}" style="width:100%;height:420px;border:none;border-radius:8px;"></iframe>`;
  } catch (e) { console.error(e); }
}

/* ── Share ── */
function shareOn(platform) {
  const name = document.getElementById('name').value || 'My';
  const text = encodeURIComponent(`${name}'s resume — built with ResumeForge`);
  if (platform === 'instagram') { showToast('Download your PDF and share it on Instagram!'); return; }
  const urls = {
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=https://resumeforge.app',
    whatsapp: `https://wa.me/?text=${text}`,
  };
  window.open(urls[platform], '_blank');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).catch(() => { });
  showToast('Link copied!');
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t._t);
  t._t = setTimeout(() => (t.style.display = 'none'), 2600);
}
