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

function toParagraphs(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "work";
}

function buildWorks(content) {
  return content.projects.map((project, index) => ({
    ...project,
    id: project.id || slugify(project.title),
    title: project.title,
    year: project.year,
    medium: project.medium,
    description: project.description,
    presentations: project.presentations || [],
    image: project.image || "assets/profile-zhitao-lin.png",
    index
  }));
}

function renderAbout(content) {
  const root = document.querySelector("[data-content='about']");
  if (!root) return;
  root.innerHTML = "";
  const photo = el("figure", "about-photo");
  const img = el("img");
  img.src = "assets/profile-zhitao-lin.png";
  img.alt = "Zhitao Lin";
  photo.append(img);
  const caption = el("figcaption");
  caption.innerHTML = `<span>Zhitao Lin</span><span>林之涛</span><i></i>`;
  photo.append(caption);

  const copy = el("div", "about-copy");
  copy.append(el("p", "about-role", content.about.roles));
  content.about.biography.forEach((text, index) => {
    copy.append(el("p", index === 0 ? "about-lede" : "", text));
  });

  const education = el("div", "about-timeline");
  education.append(el("h2", "", "Education"));
  content.about.education.forEach((entry) => {
    const item = el("div", "about-timeline-item");
    item.append(el("strong", "", entry.title));
    item.append(el("span", "", entry.meta));
    education.append(item);
  });
  copy.append(education);

  const contact = el("div", "about-contact");
  contact.append(el("h2", "", "Contact"));
  const email = el("a", "", content.about.contact.email);
  email.href = `mailto:${content.about.contact.email}`;
  contact.append(email);
  copy.append(contact);

  root.append(photo, copy);
}

function renderWorks(content) {
  const root = document.querySelector("[data-content='projects']");
  if (!root) return;
  root.innerHTML = "";
  document.querySelector(".fold-controls")?.remove();
  const works = buildWorks(content);
  const label = document.querySelector("[data-content='works-label']");
  const params = new URLSearchParams(window.location.search);
  const requestedWork = params.get("work") || params.get("id");
  let current = Math.max(0, works.findIndex((work) => work.id === requestedWork));

  function paint() {
    root.innerHTML = "";
    if (label) label.textContent = `WORKS ${current + 1}/${works.length}`;
    works.forEach((work, index) => {
      const offset = index - current;
      const page = el("article", "fold-page");
      page.tabIndex = 0;
      page.dataset.index = String(index);
      page.style.setProperty("--offset", offset);
      page.classList.toggle("is-current", index === current);
      page.classList.toggle("is-before", index < current);
      page.classList.toggle("is-after", index > current);

      const link = el("a", "fold-link");
      link.href = `work-detail.html?id=${encodeURIComponent(work.id)}`;
      link.setAttribute("aria-label", `Open ${work.title}`);
      link.addEventListener("click", (event) => {
        if (index !== current) {
          event.preventDefault();
          current = index;
          paint();
        }
      });

      const visual = el("figure", "fold-visual");
      const img = el("img");
      img.src = work.image;
      img.alt = work.title;
      visual.append(img);
      const info = el("div", "fold-info");
      info.append(el("strong", "", work.title));
      info.append(el("span", "", work.form || work.medium));
      link.append(visual, info);
      page.append(link);

      page.addEventListener("click", () => {
        if (index !== current) {
          current = index;
          paint();
        }
      });
      page.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          current = index;
          paint();
        }
      });
      root.append(page);
    });
  }

  const controls = el("div", "fold-controls");
  controls.innerHTML = `<button data-fold-prev type="button">Prev</button><button data-fold-next type="button">Next</button>`;
  root.after(controls);
  controls.querySelector("[data-fold-prev]").addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    current = Math.max(0, current - 1);
    paint();
  });
  controls.querySelector("[data-fold-next]").addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    current = Math.min(works.length - 1, current + 1);
    paint();
  });
  paint();
}

function renderWorkDetail(content) {
  const root = document.querySelector("[data-content='work-detail']");
  if (!root) return;
  const works = buildWorks(content);
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || works[0]?.id;
  const work = works.find((entry) => entry.id === id) || works[0];
  if (!work) return;

  document.title = `${work.title} | Zhitao Lin`;
  root.innerHTML = "";

  const back = el("a", "detail-back", "← Back");
  back.href = `works.html?work=${encodeURIComponent(work.id)}`;
  root.append(back);

  const hero = el("figure", "detail-hero");
  const img = el("img");
  img.src = work.image;
  img.alt = work.title;
  hero.append(img);
  root.append(hero);

  const header = el("section", "detail-header");
  header.innerHTML = `
    <h1>${work.title}</h1>
    <i></i>
    <dl>
      <div><dt>Year</dt><dd>${work.year || ""}</dd></div>
      <div><dt>Form</dt><dd>${work.form || ""}</dd></div>
      <div><dt>Medium</dt><dd>${work.medium || ""}</dd></div>
    </dl>
  `;
  root.append(header);

  const body = el("section", "detail-body");
  const text = el("div", "detail-text");
  const description = toParagraphs(work.description);
  description.forEach((paragraph) => text.append(el("p", "", paragraph)));
  if (work.recognition?.length) {
    const list = el("div", "detail-presentations");
    list.append(el("h2", "", "Recognition"));
    work.recognition.forEach((line) => list.append(el("p", "", line)));
    text.append(list);
  }
  if (work.presentations?.length) {
    const list = el("div", "detail-presentations");
    list.append(el("h2", "", "Presentations"));
    work.presentations.forEach((line) => list.append(el("p", "", line)));
    text.append(list);
  }
  if (work.photoCredit?.length) {
    const list = el("div", "detail-presentations");
    list.append(el("h2", "", "Photo Credit"));
    work.photoCredit.forEach((line) => list.append(el("p", "", line)));
    text.append(list);
  }
  const technical = el("aside", "detail-technical");
  if (work.credits?.length) {
    technical.append(el("h2", "", "Credits"));
    work.credits.forEach((line) => technical.append(el("p", "", line)));
  }
  const system = work.system || work.technical || [];
  if (system.length) {
    technical.append(el("h2", "", "System"));
    system.forEach((line) => technical.append(el("p", "", line)));
  }
  body.append(text, technical);
  root.append(body);
}

function renderCompositions(content) {
  const root = document.querySelector("[data-content='compositions']");
  if (!root) return;
  root.innerHTML = "";
  let count = 0;
  content.compositions.forEach((group) => {
    const article = el("article", "composition-group");
    const heading = el("h2", "", group.category);
    heading.dataset.count = String(group.items.length);
    article.append(heading);
    group.items.forEach((item) => {
      count += 1;
      const row = el("div", "composition-row");
      const title = el("div", "composition-title");
      title.append(el("strong", "", item.title));
      if (item.format) title.append(el("em", "", item.format));

      const facts = el("div", "composition-facts");
      if (item.facts?.length) {
        item.facts.forEach((fact) => {
          const factNode = el("p");
          factNode.innerHTML = `<span>${fact.label}</span>${fact.value}`;
          facts.append(factNode);
        });
      } else {
        facts.append(el("p", "", item.description || ""));
      }

      row.append(el("span", "composition-year", item.year || ""), title, facts);
      article.append(row);
    });
    root.append(article);
  });
  const stats = el("div", "composition-stats");
  stats.innerHTML = `<strong>${count}</strong><span>selected compositions</span>`;
  root.append(stats);
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
    renderWorkDetail(content);
    renderCompositions(content);
    renderResearch(content);
  })
  .catch((error) => {
    console.error(error);
  });
