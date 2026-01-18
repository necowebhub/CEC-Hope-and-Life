const listEl = document.getElementById("changelog-list");
const contentEl = document.getElementById("changelog-content");

fetch("changelogs.json")
  .then(res => res.json())
  .then(files => {
    files.forEach((file, index) => {
      const li = document.createElement("li");
      li.textContent = file.replace(".md", "");
      li.onclick = () => loadChangelog(file, li);
      listEl.appendChild(li);

      if (index === 0) li.click(); // автозагрузка первого
    });
  });

function loadChangelog(file, element) {
  document.querySelectorAll(".sidebar li")
    .forEach(li => li.classList.remove("active"));

  element.classList.add("active");

  fetch(`changelogs/${file}`)
    .then(res => res.text())
    .then(md => {
      contentEl.innerHTML = marked.parse(md);
    });
}
