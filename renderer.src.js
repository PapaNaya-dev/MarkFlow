import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import MarkdownIt from "markdown-it";
import mermaid from "mermaid";
import hljs from "highlight.js";

// DOM Elements
const editorContainer = document.getElementById('editor-container');
const preview = document.getElementById('preview');
const openBtn = document.getElementById('openBtn');
const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const helpBtn = document.getElementById('helpBtn');
const igLink = document.getElementById('igLink');
const ghLink = document.getElementById('ghLink');
const filePathDisplay = document.getElementById('filePath');
const wordCountDisplay = document.getElementById('wordCount');

let currentFilePath = null;

// Initialize Mermaid
mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose'
});

// Initialize Markdown-it
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                       hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                       '</code></pre>';
            } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

// Custom Mermaid renderer for Markdown-it
const defaultRender = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const code = token.content.trim();
    if (token.info === 'mermaid') {
        return `<div class="mermaid">${code}</div>`;
    }
    return defaultRender(tokens, idx, options, env, self);
};

// State management
let editorView;

const updatePreview = async () => {
    const content = editorView.state.doc.toString();
    const html = md.render(content);
    preview.innerHTML = html;
    
    // Render Mermaid diagrams
    try {
        await mermaid.run({
            querySelector: '.mermaid',
        });
    } catch (err) {
        console.error("Mermaid error:", err);
    }
    
    // Update word count
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    wordCountDisplay.textContent = `${words} words`;
};

// Initialize CodeMirror
const startEditor = (content = "") => {
    const state = EditorState.create({
        doc: content,
        extensions: [
            basicSetup,
            markdown(),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    updatePreview();
                }
            })
        ]
    });

    editorView = new EditorView({
        state,
        parent: editorContainer
    });
    
    updatePreview();
};

// Event Listeners
openBtn.addEventListener('click', async () => {
    const file = await window.electronAPI.openFile();
    if (file) {
        currentFilePath = file.path;
        filePathDisplay.textContent = file.path;
        
        // Remove old editor and start new one
        editorContainer.innerHTML = '';
        startEditor(file.content);
    }
});

saveBtn.addEventListener('click', async () => {
    const content = editorView.state.doc.toString();
    const result = await window.electronAPI.saveFile(currentFilePath, content);
    if (result) {
        currentFilePath = result;
        filePathDisplay.textContent = result;
        alert('File saved successfully!');
    }
});

exportBtn.addEventListener('click', async () => {
    // We send a signal to the main process to capture the current window as PDF
    const success = await window.electronAPI.exportPDF();
    if (success) {
        alert('PDF exported successfully!');
    }
});

helpBtn.addEventListener('click', () => {
    window.electronAPI.showHelp();
});

igLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.electronAPI.openExternal('https://www.instagram.com/erichosang');
});

ghLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.electronAPI.openExternal('https://github.com/PapaNaya-dev');
});

// Split pane resizer
const resizer = document.getElementById('resizer');
const editorPane = document.getElementById('editor-container');
let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const offset = e.clientX;
    const width = (offset / window.innerWidth) * 100;
    editorPane.style.flex = `0 0 ${width}%`;
});

document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
});

// Listen for files opened via command line or macOS open-file event
window.electronAPI.onFileOpened((file) => {
    if (file) {
        currentFilePath = file.path;
        filePathDisplay.textContent = file.path;
        
        // Remove old editor and start new one
        editorContainer.innerHTML = '';
        startEditor(file.content);
    }
});

// Start with empty editor or initial content
startEditor("# Welcome to MarkFlow\n\nEdit your markdown here and see the preview on the right.\n\n## Example Mermaid\n\n```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```");
