var renderer = new marked.Renderer();

marked.setOptions({
  renderer: renderer,
  gfm: false,
  tables: false,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  smartypants: false
});

