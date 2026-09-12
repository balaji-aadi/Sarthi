import { ProblemConfigurationError } from '../outputSerializers/SerializerErrors.js';
import { SemanticValidatorRegistry } from '../validators/SemanticValidatorRegistry.js';

/**
 * Java Driver Harness Generator (Phase 6)
 * Generates a self-contained Java driver source file around student code.
 */
export function generateJavaDriverHarness(studentCode, functionDefinition, executionProfile = {}, testCases = []) {
  const functionName = functionDefinition?.name || functionDefinition?.functionName || 'twoSum';
  const parameters = functionDefinition?.parameters || [];
  const returnType = functionDefinition?.returnType || 'number[]';
  const inPlaceMutation = executionProfile?.inPlaceMutation === true || returnType === 'void';
  const mutatedParameter = executionProfile?.mutatedParameter;
  const semanticValidator = executionProfile?.semanticValidator;

  if (semanticValidator) {
    SemanticValidatorRegistry.assertValid(semanticValidator);
  }

  if (inPlaceMutation) {
    const cleanMutated = (mutatedParameter || '').trim();
    if (!cleanMutated) {
      throw new ProblemConfigurationError("Missing required 'executionProfile.mutatedParameter' for in-place mutation problem.");
    }
    const paramExists = parameters.some(p => {
      const pName = typeof p === 'string' ? p : (p.name || (p.toObject ? p.toObject().name : '') || '');
      return pName.trim() === cleanMutated;
    });
    if (!paramExists) {
      throw new ProblemConfigurationError(`Mutated parameter '${cleanMutated}' not found in functionDefinition parameters.`);
    }
  }

  const validationHelpersCode = SemanticValidatorRegistry.getInjectedValidationCode('java', semanticValidator);

// Helper to format Java literal values from JSON input
function formatJavaLiteral(val, type) {
  const normType = (type || 'number').toLowerCase();
  if (val === null || val === undefined) {
    if (normType.includes('node')) return 'null';
    return '0';
  }
  if (normType === 'number' || normType === 'int') return String(val);
  if (normType === 'float' || normType === 'double') return String(val);
  if (normType === 'boolean' || normType === 'bool') return val ? 'true' : 'false';
  if (normType === 'string' || normType === 'str') return escapeJavaStringLiteral(val);
  if (normType === 'number[]' || normType === 'int[]') return `new int[]{${(Array.isArray(val) ? val : []).join(',')}}`;
  if (normType === 'string[]' || normType === 'str[]') return `new String[]{${(Array.isArray(val) ? val : []).map(s => escapeJavaStringLiteral(s)).join(',')}}`;
  if (normType === 'boolean[]' || normType === 'bool[]') return `new boolean[]{${(Array.isArray(val) ? val : []).map(b => b ? 'true' : 'false').join(',')}}`;
  if (normType === 'number[][]' || normType === 'int[][]') return `new int[][]{${(Array.isArray(val) ? val : []).map(r => `new int[]{${(Array.isArray(r) ? r : []).join(',')}}`).join(',')}}`;
  if (normType === 'string[][]' || normType === 'str[][]') return `new String[][]{${(Array.isArray(val) ? val : []).map(r => `new String[]{${(Array.isArray(r) ? r : []).map(s => escapeJavaStringLiteral(s)).join(',')}}`).join(',')}}`;
  if (normType.includes('listnode') && !normType.includes('random')) {
    if (val === null || val === undefined) return 'null';
    const arr = Array.isArray(val) ? val : [];
    return `deserializeListNode(new int[]{${arr.join(',')}})`;
  }
  if (normType.includes('treenode') || normType.includes('binarytree')) {
    if (val === null || val === undefined) return 'null';
    const arr = Array.isArray(val) ? val : [];
    const quoted = arr.map(x => (x === null || x === undefined || String(x).toLowerCase() === 'null') ? '"null"' : `"${x}"`);
    return `deserializeTreeNode(new String[]{${quoted.join(',')}})`;
  }
  return String(val);
}

function escapeJavaStringLiteral(str) {
  if (typeof str !== 'string') return `"${str}"`;
  return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
}

function getJavaSerializerCall(varName, type) {
  const normType = (type || 'number').toLowerCase();
  if (normType === 'number' || normType === 'int') return `String.valueOf(${varName})`;
  if (normType === 'float' || normType === 'double') return `String.valueOf(${varName})`;
  if (normType === 'boolean' || normType === 'bool') return `String.valueOf(${varName})`;
  if (normType === 'string' || normType === 'str') return `escapeJson(${varName})`;
  if (normType === 'number[][]' || normType === 'int[][]') return `serialize2DIntArray(${varName})`;
  if (normType === 'string[][]' || normType === 'str[][]') return `serialize2DStringArray(${varName})`;
  if (normType === 'number[]' || normType === 'int[]') return `serialize1DIntArray(${varName})`;
  if (normType === 'string[]' || normType === 'str[]') return `serialize1DStringArray(${varName})`;
  if (normType === 'boolean[]' || normType === 'bool[]') return `serialize1DBoolArray(${varName})`;
  if (normType.includes('listnode') && !normType.includes('random')) return `serializeListNode(${varName})`;
  if (normType.includes('treenode') || normType.includes('binarytree')) return `serializeTreeNode(${varName})`;
  return `String.valueOf(${varName})`;
}

  const testCaseBlocks = testCases.map((tc, idx) => {
    const rawInput = tc.input !== undefined ? tc.input : tc;
    
    const paramInits = parameters.map((p, i) => {
      const pName = p.name || `param_${i}`;
      const val = (typeof rawInput === 'object' && rawInput !== null && rawInput[pName] !== undefined) ? rawInput[pName] : (Array.isArray(rawInput) ? rawInput[i] : rawInput);
      const rawType = (p.type || 'number').toLowerCase();
      let javaType = 'int';
      if (rawType === 'number' || rawType === 'int') javaType = 'int';
      else if (rawType === 'float' || rawType === 'double') javaType = 'double';
      else if (rawType === 'boolean' || rawType === 'bool') javaType = 'boolean';
      else if (rawType === 'string' || rawType === 'str') javaType = 'String';
      else if (rawType === 'number[]' || rawType === 'int[]') javaType = 'int[]';
      else if (rawType === 'string[]' || rawType === 'str[]') javaType = 'String[]';
      else if (rawType === 'boolean[]' || rawType === 'bool[]') javaType = 'boolean[]';
      else if (rawType === 'number[][]' || rawType === 'int[][]') javaType = 'int[][]';
      else if (rawType === 'string[][]' || rawType === 'str[][]') javaType = 'String[][]';
      else if (rawType.includes('listnode')) javaType = 'ListNode';
      else if (rawType.includes('treenode')) javaType = 'TreeNode';
      else if (rawType.includes('graph')) javaType = 'Node';

      return `${javaType} tc_${idx}_${pName} = ${formatJavaLiteral(val, p.type)};`;
    }).join('\n        ');

    const argList = parameters.map(p => `tc_${idx}_${p.name || ''}`).join(', ');

    let execAndSerialize = '';
    if (inPlaceMutation) {
      const targetParam = parameters.find(p => p.name === mutatedParameter) || parameters[0];
      const targetType = targetParam ? targetParam.type : 'number[]';
      const serializer = getJavaSerializerCall(`tc_${idx}_${mutatedParameter}`, targetType);
      execAndSerialize = `solution.${functionName}(${argList});\n                outStr = ${serializer};`;
    } else {
      const serializer = getJavaSerializerCall('res', returnType);
      execAndSerialize = `var res = solution.${functionName}(${argList});\n                outStr = ${serializer};`;
    }

    return `// Test Case ${idx}
        {
            ${paramInits}
            PrintStream origOut = System.out;
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintStream captureOut = new PrintStream(baos);
            String outStr = "";
            try {
                System.setOut(captureOut);
                ${execAndSerialize}
            } finally {
                System.setOut(origOut);
            }
            String userStdout = baos.toString();
            if (${idx} > 0) System.out.print(",");
            System.out.print("{\\"testCaseIndex\\":" + ${idx} + ",\\"output\\":" + outStr + ",\\"stdout\\":" + escapeJson(userStdout) + "}");
        }`;
  }).join('\n\n        ');

  return `import java.util.*;
import java.io.*;

// ==========================================
// 1. STANDARD DATA STRUCTURE DEFINITIONS
// ==========================================
class ListNode {
    public int val;
    public ListNode next;
    public ListNode() {}
    public ListNode(int val) { this.val = val; }
    public ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode() {}
    public TreeNode(int val) { this.val = val; }
    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class Node {
    public int val;
    public Node next;
    public Node random;
    public List<Node> neighbors;

    public Node() {
        this.val = 0;
        this.neighbors = new ArrayList<>();
    }
    public Node(int _val) {
        this.val = _val;
        this.neighbors = new ArrayList<>();
    }
    public Node(int _val, Node _next, Node _random) {
        this.val = _val;
        this.next = _next;
        this.random = _random;
        this.neighbors = new ArrayList<>();
    }
    public Node(int _val, ArrayList<Node> _neighbors) {
        this.val = _val;
        this.neighbors = _neighbors;
    }
}

// ==========================================
// 2. INJECTED STUDENT CODE
// ==========================================
${studentCode}

// ==========================================
// 3. MAIN DRIVER & JSON SERIALIZATION (PHASE 4 CONTRACT)
// ==========================================
public class Main {
    ${validationHelpersCode}

    public static String escapeJson(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append('"');
        for (char c : s.toCharArray()) {
            if (c == '"') sb.append("\\\\\\\"");
            else if (c == '\\\\') sb.append("\\\\\\\\");
            else if (c == '\\b') sb.append("\\\\b");
            else if (c == '\\f') sb.append("\\\\f");
            else if (c == '\\n') sb.append("\\\\n");
            else if (c == '\\r') sb.append("\\\\r");
            else if (c == '\\t') sb.append("\\\\t");
            else sb.append(c);
        }
        sb.append('"');
        return sb.toString();
    }

    public static String serialize1DIntArray(int[] arr) {
        if (arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    public static String serialize1DStringArray(String[] arr) {
        if (arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(escapeJson(arr[i]));
        }
        sb.append("]");
        return sb.toString();
    }

    public static String serialize1DBoolArray(boolean[] arr) {
        if (arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    public static String serialize2DIntArray(int[][] mat) {
        if (mat == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < mat.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(serialize1DIntArray(mat[i]));
        }
        sb.append("]");
        return sb.toString();
    }

    public static String serialize2DStringArray(String[][] mat) {
        if (mat == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < mat.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(serialize1DStringArray(mat[i]));
        }
        sb.append("]");
        return sb.toString();
    }

    public static String serializeListNode(ListNode head) {
        if (head == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        ListNode curr = head;
        Set<ListNode> visited = new HashSet<>();
        boolean first = true;
        while (curr != null) {
            if (visited.contains(curr)) throw new RuntimeException("CycleDetectedError: Cyclic reference in linked list");
            visited.add(curr);
            if (!first) sb.append(",");
            sb.append(curr.val);
            first = false;
            curr = curr.next;
        }
        sb.append("]");
        return sb.toString();
    }

    public static String serializeTreeNode(TreeNode root) {
        if (root == null) return "[]";
        List<String> list = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            TreeNode curr = q.poll();
            if (curr != null) {
                list.add(String.valueOf(curr.val));
                q.offer(curr.left);
                q.offer(curr.right);
            } else {
                list.add("null");
            }
        }
        while (!list.isEmpty() && list.get(list.size() - 1).equals("null")) {
            list.remove(list.size() - 1);
        }
        return "[" + String.join(",", list) + "]";
    }

    public static ListNode deserializeListNode(int[] vals) {
        if (vals == null || vals.length == 0) return null;
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int v : vals) {
            curr.next = new ListNode(v);
            curr = curr.next;
        }
        return dummy.next;
    }

    public static TreeNode deserializeTreeNode(String[] vals) {
        if (vals == null || vals.length == 0) return null;
        if (vals[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(vals[0]));
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode curr = q.poll();
            if (curr == null) continue;
            if (i < vals.length) {
                if (!vals[i].equals("null")) {
                    curr.left = new TreeNode(Integer.parseInt(vals[i]));
                    q.offer(curr.left);
                }
                i++;
            }
            if (i < vals.length) {
                if (!vals[i].equals("null")) {
                    curr.right = new TreeNode(Integer.parseInt(vals[i]));
                    q.offer(curr.right);
                }
                i++;
            }
        }
        return root;
    }

    public static void main(String[] args) {
        try {
            Solution solution = new Solution();
            System.out.println("{\\"status\\":\\"SUCCESS\\",\\"results\\":[");
            ${testCaseBlocks}
            System.out.println("]}");
        } catch (Exception e) {
            System.out.println("{\\"status\\":\\"RUNTIME_ERROR\\",\\"testCaseIndex\\":0,\\"errorType\\":\\"" + e.getClass().getSimpleName() + "\\",\\"message\\":" + escapeJson(e.getMessage()) + "}");
        }
    }
}
`;
}
