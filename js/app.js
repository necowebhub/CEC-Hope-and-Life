const listEl = document.getElementById("changelog-list");
const contentEl = document.getElementById("changelog-content");

// Дождаться загрузки marked
window.addEventListener('DOMContentLoaded', () => {
  // Проверка загрузки marked
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
      // Правильный способ использования marked в новых версиях
      contentEl.innerHTML = marked.parse(md);
    })
    .catch(err => {
      console.error('Ошибка загрузки changelog:', err);
      contentEl.innerHTML = `<p style="color: red;">Ошибка загрузки: ${err.message}</p>`;
    });
}
