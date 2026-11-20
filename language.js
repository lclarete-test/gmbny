(() => {
  const key = "gmbny-language";
  const url = new URL(location.href);
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const language = (url.searchParams.get("lang") || saved) === "en" ? "en" : "pt";
  document.documentElement.lang = language === "en" ? "en-US" : "pt-BR";
  const dictionary = window.gmbTranslations || {};
  const translate = value => dictionary[value.trim()] || value;
  if (language === "en") {
    document.title = document.title.split(" | ").map(translate).join(" | ");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement.closest("script, style, svg, noscript") ?
        NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.data.trim()) node.data = node.data.replace(node.data.trim(), translate(node.data));
    }
    document.querySelectorAll("[aria-label], [title], [placeholder], meta[name=description]").forEach(element => {
      for (const attribute of ["aria-label", "title", "placeholder", "content"]) {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, translate(element.getAttribute(attribute)));
      }
    });
  }
  const nav = document.querySelector(".hub-nav .wrap");
  if (!nav) return;
  const switcher = document.createElement("div");
  switcher.className = "language-switcher";
  switcher.setAttribute("role", "group");
  switcher.setAttribute("aria-label", language === "en" ? "Language" : "Idioma");
  for (const [code, flag, label] of [["pt", "🇧🇷", "Português"], ["en", "🇺🇸", "English"]]) {
    const link = document.createElement("a");
    const target = new URL(url);
    target.searchParams.set("lang", code);
    link.href = target.href;
    link.lang = code === "en" ? "en-US" : "pt-BR";
    link.hreflang = link.lang;
    if (language === code) link.setAttribute("aria-current", "true");
    link.innerHTML = `<span aria-hidden="true">${flag}</span> ${label}`;
    link.addEventListener("click", () => {
      try { localStorage.setItem(key, code); } catch {}
    });
    switcher.append(link);
  }
  nav.append(switcher);
  document.querySelectorAll("a[href]").forEach(link => {
    const target = new URL(link.href, url);
    if (target.origin !== url.origin || !target.pathname.startsWith(url.pathname.replace(/[^/]*$/, "")) ||
        !target.pathname.endsWith(".html") || target.searchParams.has("lang")) return;
    target.searchParams.set("lang", language);
    link.href = target.href;
  });
})();
