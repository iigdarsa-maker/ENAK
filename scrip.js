require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"
  }
});

const files = {
  html: {
    language: "html",
    value: `<h1>Halo dari Live Editor!</h1>
<p>Ini adalah editor mirip Visual Studio Code.</p>
<button id="btn">Klik saya</button>
<div id="output"></div>`
  },
  css: {
    language: "css",
    value: `body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  text-align: center;
}

h1 {
  font-size: 2.4rem;
  margin-bottom: 10px;
}

button {
  margin-top: 20px;
  padding: 12px 28px;
  font-size: 16px;
  background: #00d2ff;
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

button:hover {
  transform: scale(1.05);
  background: #00a8cc;
}

#output {
  margin-top: 20px;
  font-size: 1.2rem;
}`
  },
  js: {
    language: "javascript",
    value: `const btn = document.getElementById('btn');
const output = document.getElementById('output');

btn.addEventListener('click', () => {
  output.textContent = 'Tombol berhasil diklik! 🎉';
  document.body.style.background = '#' + Math.floor(Math.random() * 16777215).toString(16);
});`
  }
};

let editors = {};
let current = "html";
let timeout = null;

require(["vs/editor/editor.main"], function () {
  // Buat 3 editor
  ["html", "css", "js"].forEach((key) => {
    editors[key] = monaco.editor.create(document.getElementById(`editor-${key}`), {
      value: files[key].value,
      language: files[key].language,
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      padding: { top: 12 }
    });

    // Update posisi kursor
    editors[key].onDidChangeCursorPosition((e) => {
      if (current === key) {
        document.getElementById("cursor-pos").textContent =
          `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
      }
    });

    // Auto update preview saat mengetik
    editors[key].onDidChangeModelContent(() => {
      clearTimeout(timeout);
      timeout = setTimeout(runPreview, 600);
    });
  });

  // Fungsi ganti file
  function switchFile(file) {
    if (!editors[file]) return;
    current = file;

    // Update tab
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.file === file);
    });

    // Update sidebar
    document.querySelectorAll(".file-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.file === file);
    });

    // Tampilkan editor yang benar
    document.querySelectorAll(".monaco-container").forEach((el) => {
      el.classList.remove("active");
    });
    document.getElementById(`editor-${file}`).classList.add("active");

    // Update label bahasa
    const labels = { html: "HTML", css: "CSS", js: "JavaScript" };
    document.getElementById("lang-label").textContent = labels[file];

    editors[file].focus();
  }

  // Event klik tab & file
  document.querySelectorAll(".tab, .file-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-close")) return;
      const file = el.dataset.file;
      if (file) switchFile(file);
    });
  });

  // Fungsi menjalankan preview
  function runPreview() {
    const html = editors.html.getValue();
    const css = editors.css.getValue();
    const js = editors.js.getValue();

    const result = `
<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (err) {
      console.error(err);
      document.body.innerHTML += '<pre style="color:red;padding:20px;">Error: ' + err.message + '</pre>';
    }
  <\/script>
</body>
</html>`;

    document.getElementById("preview").srcdoc = result;
  }

  // Tombol Run & Refresh
  document.getElementById("runBtn").addEventListener("click", runPreview);
  document.getElementById("refreshBtn").addEventListener("click", runPreview);

  // Shortcut Ctrl + Enter
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      runPreview();
    }
  });

  // Toggle folder di sidebar
  document.querySelectorAll(".sidebar-header").forEach((header) => {
    header.addEventListener("click", () => {
      header.classList.toggle("open");
    });
  });

  // Jalankan pertama kali
  setTimeout(runPreview, 400);
});