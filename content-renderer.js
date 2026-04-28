async function loadContent() {
  const response = await fetch("content.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load content.json");
  return response.json();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderTextBlock(parent, title, paragraphs) {
  const article = el("article", "page-item");
  article.append(el("h2", "", title));
  paragraphs.forEach((text) => article.append(el("p", "", text)));
  parent.append(article);
}

function renderListBlock(parent, title, items) {
  const article = el("article", "page-item");
  article.append(el("h2", "", title));
  items.forEach((item) => {
    const p = el("p");
    p.innerHTML = `<strong>${item.title}</strong>${item.meta ? ` — ${item.meta}` : ""}`;
    article.append(p);
  });
  parent.append(article);
}

function renderAbout(content) {
  const root = document.querySelector("[data-content='about']");
  if (!root) return;
  root.innerHTML = "";
  renderTextBlock(root, content.about.name, [content.about.roles, ...content.about.biography]);
  renderListBlock(root, "Education", content.about.education);
  renderTextBlock(root, "Contact", [content.about.contact.email]);
}

function renderWorks(content) {
  const root = document.querySelector("[data-content='projects']");
  if (!root) return;
  root.innerHTML = "";
  content.projects.forEach((project) => {
    const article = el("article", "page-item");
    article.append(el("h2", "", `${project.title} (${project.year})`));
    article.append(el("p", "", project.medium));
    article.append(el("p", "", project.description));
    project.presentations.forEach((line) => article.append(el("p", "", line)));
    root.append(article);
  });
}

function renderCompositions(content) {
  const root = document.querySelector("[data-content='compositions']");
  if (!root) return;
  root.innerHTML = "";
  content.compositions.forEach((group) => {
    const article = el("article", "page-item");
    article.append(el("h2", "", group.category));
    group.items.forEach((item) => {
      const p = el("p");
      p.innerHTML = `<strong>${item.title}</strong>${item.year ? ` (${item.year})` : ""}. ${item.description}`;
      article.append(p);
    });
    root.append(article);
  });
  if (content.masterclasses?.length) {
    renderListBlock(root, "Masterclasses", content.masterclasses.map((entry) => ({ title: entry.name, meta: entry.date })));
  }
}

function renderResearch(content) {
  const headline = document.querySelector("[data-content='research-headline']");
  const paragraphs = document.querySelector("[data-content='research-paragraphs']");
  const tags = document.querySelector("[data-content='research-tags']");
  const notes = document.querySelector("[data-content='research-notes']");
  if (headline) headline.textContent = content.research.headline;
  if (paragraphs) {
    paragraphs.innerHTML = "";
    content.research.paragraphs.forEach((text) => paragraphs.append(el("p", "", text)));
  }
  if (tags) {
    tags.innerHTML = "";
    content.research.tags.forEach((tag) => tags.append(el("span", "", tag)));
  }
  if (notes) {
    notes.innerHTML = "";
    content.research.notes.forEach((note) => {
      const article = el("article");
      article.append(el("h2", "", note.title));
      article.append(el("p", "", note.body));
      notes.append(article);
    });
  }
}

loadContent()
  .then((content) => {
    renderAbout(content);
    renderWorks(content);
    renderCompositions(content);
    renderResearch(content);
  })
  .catch((error) => {
    console.error(error);
  });
