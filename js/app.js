const listEl = document.getElementById("changelog-list");
const contentEl = document.getElementById("changelog-content");
const menuToggle = document.getElementById("menuToggle");
const closeMenu = document.getElementById("closeMenu");
const copyButton = document.getElementById("copyButton");
const sendOnPrint = document.getElementById("sendOnPrint");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
let currentFile = null;
let currentMarkdown = "";

marked.use({
  gfm: true,
  breaks: false
});

function openMenu() {
  sidebar.classList.add('open');
  overlay.classList.add('visible');
  menuToggle.classList.add('hidden');
}

function closeMenuFunc() {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  menuToggle.classList.remove('hidden');
}

menuToggle.addEventListener('click', openMenu);
overlay.addEventListener('click', closeMenuFunc);
closeMenu.addEventListener('click', closeMenuFunc);

function closeMobileMenu() {
  if (window.innerWidth <= 768) {
     closeMenuFunc();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof marked === 'undefined') {
    contentEl.innerHTML = '<p style="color: red;">Ошибка: библиотека marked не загружена</p>';
    return;
  }

  fetch("changelogs.json")
    .then(res => {
      if (!res.ok) throw new Error('Не удалось загрузить changelogs.json');
      return res.json();
    })
    .then(files => {
      if (!files || files.length === 0) {
        listEl.innerHTML = '<li>Нет доступных changelog</li>';
        return;
      }

      files.forEach((file, index) => {
        const li = document.createElement("li");
        li.textContent = file.replace(".md", "");
        li.onclick = () => loadChangelog(file, li);
        listEl.appendChild(li);

        if (index === 0) li.click(); // автозагрузка первого
      });
    })
    .catch(err => {
      console.error('Ошибка загрузки списка:', err);
      contentEl.innerHTML = `<p style="color: red;">Ошибка: ${err.message}</p>`;
    });
});

function loadChangelog(file, element) {
  document.querySelectorAll(".sidebar li")
    .forEach(li => li.classList.remove("active"));

  element.classList.add("active");

  fetch(`changelogs/${file}`)
    .then(res => {
      if (!res.ok) throw new Error(`Не удалось загрузить ${file}`);
      return res.text();
    })
    .then(md => {
      currentMarkdown = md;
      contentEl.innerHTML = marked.parse(md);
      closeMobileMenu();
    })
    .catch(err => {
      console.error('Ошибка загрузки changelog:', err);
      contentEl.innerHTML = `<p style="color: red;">Ошибка загрузки: ${err.message}</p>`;
    });

  contentEl.parentElement.scrollTop = 0;
}

copyButton.addEventListener('click', () => {
  if (!currentMarkdown) return;
  navigator.clipboard.writeText(currentMarkdown).then(() => {
    copyButton.textContent = '✓';
    setTimeout(() => copyButton.textContent = '❐', 2000);
  }).catch(() => {
    alert('Не удалось скопировать');
  });
});

sendOnPrint.addEventListener('click', () => {
  if (!currentMarkdown) return;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html><head>
      <meta charset="UTF-8">
      <title>Print</title>
      <style>
        body { font-family: sans-serif; padding: 32px; max-width: 900px; margin: 0 auto; }
        h1, h2, h3 { border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
        pre { background: #f0f0f0; padding: 12px; border-radius: 6px; overflow-x: auto; }
        ul { padding-left: 20px; }
      </style>
    </head><body>${marked.parse(currentMarkdown)}</body></html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});