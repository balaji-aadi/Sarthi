/**
 * Dynamic LLD Starter Code Generator
 * 
 * Generates non-prescriptive, clean starter code templates for C++, Python, and Java.
 * If a task contains an existing language code block in its description (e.g. refactoring drills),
 * it extracts that code block so the learner starts with the intended scenario.
 */

export function generateLldStarterCode({ task = {}, language = "cpp" } = {}) {
  const langLower = (language || "cpp").toLowerCase();

  // 1. Check if task description contains an explicit markdown code block for this language
  const desc = task?.taskDescription || "";
  const langAliases = {
    cpp: ["cpp", "c\\+\\+", "c"],
    python: ["python", "py"],
    java: ["java"]
  };

  const aliases = langAliases[langLower] || [langLower];
  for (const alias of aliases) {
    const codeBlockRegex = new RegExp(`\`\`\`${alias}\\s*\\n([\\s\\S]*?)\`\`\``, "i");
    const match = desc.match(codeBlockRegex);
    if (match && match[1]?.trim()) {
      let snippet = match[1].trim();
      // Ensure Direct Program executable entrypoint is available if not present in snippet
      if (langLower === "cpp" && !snippet.includes("main(")) {
        if (!snippet.includes("<iostream>")) {
          snippet = `#include <iostream>\n#include <vector>\n#include <string>\n#include <memory>\n\nusing namespace std;\n\n` + snippet;
        }
        snippet += `\n\nint main() {\n    // Instantiate your objects and verify system behavior\n    cout << "--- Testing LLD Solution ---" << endl;\n    return 0;\n}\n`;
      } else if (langLower === "java" && !snippet.includes("main(")) {
        snippet = `import java.util.*;\n\n` + snippet + `\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("--- Testing LLD Solution ---");\n    }\n}\n`;
      } else if (langLower === "python" && !snippet.includes("main") && !snippet.includes("__main__")) {
        snippet += `\n\ndef main():\n    print("--- Testing LLD Solution ---")\n\n\nif __name__ == "__main__":\n    main()\n`;
      }
      return snippet;
    }
  }

  // 2. Fallback to clean, non-prescriptive templates
  switch (langLower) {
    case "cpp":
      return `#include <iostream>
#include <vector>
#include <string>
#include <memory>

using namespace std;

// 1. Define your domain classes and data structures here


int main() {
    // 2. Instantiate your objects and verify system behavior
    cout << "--- Testing LLD Solution ---" << endl;

    return 0;
}
`;

    case "python":
      return `# 1. Define your domain classes and data structures here


def main():
    # 2. Instantiate your objects and verify system behavior
    print("--- Testing LLD Solution ---")


if __name__ == "__main__":
    main()
`;

    case "java":
      return `import java.util.*;

// 1. Define your domain classes and data structures here


public class Main {
    public static void main(String[] args) {
        // 2. Instantiate your objects and verify system behavior
        System.out.println("--- Testing LLD Solution ---");
    }
}
`;

    default:
      return `// Write your LLD code here\n`;
  }
}

export function getAllStarterTemplates(task = {}) {
  return {
    cpp: generateLldStarterCode({ task, language: "cpp" }),
    python: generateLldStarterCode({ task, language: "python" }),
    java: generateLldStarterCode({ task, language: "java" })
  };
}
