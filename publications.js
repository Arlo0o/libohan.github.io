(() => {
  'use strict';

  const topics = {
    driving: 'Autonomous Driving',
    embodied: 'Embodied Intelligence',
    vision: '3D Vision & Generation',
    science: 'AI for Science'
  };
  // Keys match the existing thumbnail filenames; publication text stays in HTML.
  const catalog = {
    'omninwm.png': { topics: ['driving'], selected: true },
    'uniscene.png': { topics: ['driving'], selected: true },
    'uniscenev2.png': { topics: ['driving'], selected: true },
    'occscene.png': { topics: ['driving'], selected: true },
    'hisop.png': { topics: ['driving'], selected: true },
    'KVLR.png': { topics: ['science'], selected: true, tag: 'Surgical Robotics' },
    'coral.jpg': { topics: ['science'], selected: true },
    'Langsurf.png': { topics: ['vision'] },
    'navinerfplus.png': { topics: ['vision'] },
    'orv.png': { topics: ['embodied'], selected: true },
    'pam.png': { topics: ['vision', 'embodied'] },
    'LightofNormals.png': { topics: ['vision'] },
    'LightX.png': { topics: ['vision'], selected: true },
    'stablemap.png': { topics: ['driving'] },
    'dkt.png': { topics: ['embodied', 'vision'] },
    'challenger.png': { topics: ['driving'] },
    'MDE.png': { topics: ['vision', 'driving'] },
    'streetgs.png': { topics: ['driving', 'vision'] },
    'OnePoseViaGen.png': { topics: ['embodied', 'vision'] },
    'dist4d.png': { topics: ['driving'] },
    'mudg.jpg': { topics: ['driving', 'vision'] },
    'TAPTRv2.png': { topics: ['vision'] },
    'htcl.jpg': { topics: ['driving'] },
    'cldis.jpg': { topics: ['vision'] },
    'brgscene.jpg': { topics: ['driving'] },
    'vpd.jpg': { topics: ['driving'] },
    'navinerf.jpg': { topics: ['vision'] },
    'GigaBrain0.5M.png': { topics: ['embodied'] },
    'General-World-Models-Survey.png': { topics: ['embodied'], tag: 'World Model Survey' },
    'tai.png': { topics: ['vision'] },
    'stereodiffuer.png': { topics: ['vision'] }
  };

  // Editorial order: leading contributions and research continuity first,
  // followed by collaborative publications and then preprints.
  const displayOrder = [
    'uniscenev2.png', 'uniscene.png', 'omninwm.png',
    'occscene.png', 'hisop.png', 'KVLR.png', 'coral.jpg', 'orv.png',
    'htcl.jpg', 'brgscene.jpg', 'vpd.jpg', 'stereodiffuer.png',
    'MDE.png', 'cldis.jpg', 'navinerf.jpg', 'challenger.png',
    'Langsurf.png', 'navinerfplus.png', 'LightX.png', 'LightofNormals.png',
    'pam.png', 'OnePoseViaGen.png', 'dkt.png', 'stablemap.png',
    'streetgs.png', 'dist4d.png', 'mudg.jpg', 'TAPTRv2.png', 'tai.png',
    'General-World-Models-Survey.png', 'GigaBrain0.5M.png'
  ];
  const ranks = new Map(displayOrder.map((filename, index) => [filename, index]));

  const table = document.getElementById('tbPublications');
  if (!table) return;
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const status = document.getElementById('publication-status');
  const toggle = document.getElementById('publication-toggle');
  const note = document.getElementById('publication-expand-note');
  const heading = document.getElementById('publications-heading');
  const entries = [];

  for (const row of table.rows) {
    const thumbnail = row.cells[0]?.querySelector('img');
    if (!thumbnail || row.cells.length < 2) continue;
    const filename = thumbnail.getAttribute('src').replace(/\\/g, '/').split('/').pop();
    const metadata = catalog[filename] || { topics: [] };
    row.classList.add('publication-item');
    thumbnail.classList.add('publication-thumbnail');
    thumbnail.setAttribute('src', `images/${filename}`);
    const details = row.cells[1];
    for (const badge of details.querySelectorAll('img')) {
      const hideUnavailableBadge = () => { badge.hidden = true; };
      badge.addEventListener('error', hideUnavailableBadge);
      if (badge.complete && !badge.naturalWidth) hideUnavailableBadge();
    }
    const title = details.querySelector('b > a');
    const paperLink = [...details.querySelectorAll('a')].find(link => link.textContent.trim().toLowerCase() === 'paper');
    if (title) {
      title.classList.add('publication-title');
      if (!title.getAttribute('href') && paperLink) title.href = paperLink.href;
      if (!thumbnail.alt) thumbnail.alt = title.textContent.trim();
    }
    const tags = document.createElement('div');
    tags.className = 'publication-tags';
    for (const topic of metadata.topics) {
      const tag = document.createElement('span');
      tag.className = `publication-tag topic-${topic}`;
      tag.textContent = topics[topic];
      tags.append(tag);
    }
    if (metadata.tag) {
      const tag = document.createElement('span');
      tag.className = 'publication-tag';
      tag.textContent = metadata.tag;
      tags.append(tag);
    }
    details.append(tags);
    entries.push({ row, filename, ...metadata });
  }

  entries.sort((a, b) => (ranks.get(a.filename) ?? Infinity) - (ranks.get(b.filename) ?? Infinity));
  for (const entry of entries) table.tBodies[0].append(entry.row);

  let active = 'selected';
  const selectedCount = entries.filter(entry => entry.selected).length;
  function render(filter) {
    active = filter;
    let count = 0;
    for (const entry of entries) {
      const visible = filter === 'all' || (filter === 'selected' ? entry.selected : entry.topics.includes(filter));
      entry.row.hidden = !visible;
      if (visible) count += 1;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }
    status.textContent = filter === 'selected'
      ? `${count} selected works across four research directions`
      : filter === 'all' ? `All ${count} works` : `${topics[filter]} / ${count} works`;
    toggle.textContent = filter === 'all' ? `Back to selected works (${selectedCount})` : `Show all works (${entries.length})`;
    toggle.setAttribute('aria-expanded', String(filter === 'all'));
    note.textContent = filter === 'all' ? 'The complete list, including preprints.' : 'Explore the complete list, including preprints.';
  }

  for (const button of buttons) {
    button.addEventListener('click', () => render(button.dataset.filter));
  }
  toggle.addEventListener('click', () => {
    const collapse = active === 'all';
    render(collapse ? 'selected' : 'all');
    if (collapse) {
      buttons[0].focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    }
  });
  table.classList.add('publications-enhanced');
  render('selected');
  document.getElementById('publication-controls').hidden = false;
  document.getElementById('publication-expand').hidden = false;
})();
