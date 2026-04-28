const editor = document.querySelector("#jsonEditor");
const statusEl = document.querySelector("#adminStatus");
let content = null;
let fileHandle = null;

function setStatus(message) {
  statusEl.textContent = message;
}

function syncEditor() {
  editor.value = JSON.stringify(content, null, 2);
}

function readEditor() {
  content = JSON.parse(editor.value);
  return content;
}

async function loadSiteData() {
  const response = await fetch("content.json", { cache: "no-store" });
  content = await response.json();
  syncEditor();
  setStatus("Loaded content.json from the site.");
}

function downloadJson() {
  readEditor();
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content.json";
  a.click();
  URL.revokeObjectURL(url);
  setStatus("Exported content.json.");
}

async function openLocalFile() {
  if (!window.showOpenFilePicker) {
    setStatus("This browser cannot save files directly. Use Export JSON instead.");
    return;
  }
  [fileHandle] = await window.showOpenFilePicker({
    types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
  });
  const file = await fileHandle.getFile();
  content = JSON.parse(await file.text());
  syncEditor();
  setStatus(`Opened ${file.name}.`);
}

async function saveLocalFile() {
  readEditor();
  if (!fileHandle) {
    if (!window.showSaveFilePicker) {
      downloadJson();
      return;
    }
    fileHandle = await window.showSaveFilePicker({
      suggestedName: "content.json",
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
    });
  }
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(content, null, 2));
  await writable.close();
  setStatus("Saved content.json.");
}

document.querySelector("#projectForm").addEventListener("submit", (event) => {
  event.preventDefault();
  readEditor();
  const data = new FormData(event.currentTarget);
  content.projects.unshift({
    title: data.get("title"),
    year: data.get("year"),
    medium: data.get("medium"),
    description: data.get("description"),
    presentations: data.get("presentations").split("\n").map((line) => line.trim()).filter(Boolean)
  });
  syncEditor();
  event.currentTarget.reset();
  setStatus("Added project. Remember to Save or Export JSON.");
});

document.querySelector("#compositionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  readEditor();
  const data = new FormData(event.currentTarget);
  const category = data.get("category");
  let group = content.compositions.find((entry) => entry.category.toLowerCase() === category.toLowerCase());
  if (!group) {
    group = { category, items: [] };
    content.compositions.push(group);
  }
  group.items.unshift({
    title: data.get("title"),
    year: data.get("year"),
    description: data.get("description")
  });
  syncEditor();
  event.currentTarget.reset();
  setStatus("Added composition. Remember to Save or Export JSON.");
});

document.querySelector("#openFile").addEventListener("click", openLocalFile);
document.querySelector("#saveFile").addEventListener("click", saveLocalFile);
document.querySelector("#downloadFile").addEventListener("click", downloadJson);
document.querySelector("#resetFile").addEventListener("click", loadSiteData);

loadSiteData().catch((error) => setStatus(error.message));
