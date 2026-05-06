@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
}

body {
  margin: 0;
  background-color: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#root {
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border-inline: 1px solid var(--border);
}

h1, h2 {
  color: var(--text-h);
  font-weight: 600;
}