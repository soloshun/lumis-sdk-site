import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("yaml", yaml);

const LANGUAGE_ALIASES: Record<string, string> = {
  shell: "bash",
  bash: "bash",
  sh: "bash",
  python: "python",
  py: "python",
  yaml: "yaml",
  yml: "yaml",
  json: "json",
};

export function highlightCode(code: string, language: string): string | null {
  const resolved = LANGUAGE_ALIASES[language.toLowerCase()];
  if (!resolved) return null;
  try {
    return hljs.highlight(code, { language: resolved }).value;
  } catch {
    return null;
  }
}
