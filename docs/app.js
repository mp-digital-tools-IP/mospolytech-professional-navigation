(() => {
  const scripts = ["./core.js","./diagnostics.js","./views.js"];
  let i = 0;
  function next(){
    if(i >= scripts.length) return;
    const s = document.createElement("script");
    s.src = scripts[i++];
    s.async = false;
    s.onload = next;
    s.onerror = () => console.error("Failed to load", s.src);
    document.body.appendChild(s);
  }
  next();
})();