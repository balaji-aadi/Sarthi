import { ProblemConfigurationError } from '../outputSerializers/SerializerErrors.js';
import { SemanticValidatorRegistry } from '../validators/SemanticValidatorRegistry.js';
import { normalizeCanonicalType, TYPE_MAP } from '../../../../shared/templateGenerator.js';

/**
 * C++ Driver Harness Generator (Phase 6)
 * Generates a self-contained C++17 driver source file around student code.
 */
export function generateCppDriverHarness(studentCode, functionDefinition, executionProfile = {}, testCases = []) {
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

  const validationHelpersCode = SemanticValidatorRegistry.getInjectedValidationCode('cpp', semanticValidator);

// Helper to resolve canonical C++ type string
function getCppType(type) {
  const canonical = normalizeCanonicalType(type);
  if (canonical && TYPE_MAP?.cpp?.[canonical]) {
    return TYPE_MAP.cpp[canonical];
  }
  const clean = (type || '').trim().toLowerCase();
  if (clean === 'number' || clean === 'int' || clean === 'integer') return 'int';
  if (clean === 'long' || clean === 'long long' || clean === 'int64') return 'long long';
  if (clean === 'float' || clean === 'double') return 'double';
  if (clean === 'boolean' || clean === 'bool') return 'bool';
  if (clean === 'string' || clean === 'str') return 'string';
  if (
    clean === 'number[]' ||
    clean === 'int[]' ||
    clean === 'integer[]' ||
    clean.startsWith('vector<int>') ||
    clean.startsWith('list<int') ||
    clean.startsWith('list<integer') ||
    clean === 'int-array' ||
    clean === 'integer-array'
  ) {
    return 'vector<int>';
  }
  if (
    clean === 'double[]' ||
    clean === 'float[]' ||
    clean.startsWith('vector<double>') ||
    clean.startsWith('vector<float>') ||
    clean.startsWith('list<double') ||
    clean.startsWith('list<float')
  ) {
    return 'vector<double>';
  }
  if (
    clean === 'string[]' ||
    clean === 'str[]' ||
    clean.startsWith('vector<string>') ||
    clean.startsWith('list<string') ||
    clean.startsWith('list<str>')
  ) {
    return 'vector<string>';
  }
  if (
    clean === 'boolean[]' ||
    clean === 'bool[]' ||
    clean.startsWith('vector<bool>') ||
    clean.startsWith('list<bool') ||
    clean.startsWith('list<boolean')
  ) {
    return 'vector<bool>';
  }
  if (
    clean === 'number[][]' ||
    clean === 'int[][]' ||
    clean === 'integer[][]' ||
    clean.startsWith('vector<vector<int>>') ||
    clean.startsWith('list<list<int') ||
    clean.startsWith('list<list<integer') ||
    clean === 'matrix'
  ) {
    return 'vector<vector<int>>';
  }
  if (clean === 'string[][]' || clean === 'str[][]' || clean.startsWith('vector<vector<string>>')) return 'vector<vector<string>>';
  if (clean === 'boolean[][]' || clean === 'bool[][]' || clean.startsWith('vector<vector<bool>>')) return 'vector<vector<bool>>';
  if (clean.includes('listnode') && !clean.includes('random')) return 'ListNode*';
  if (clean.includes('treenode') || clean.includes('binarytree')) return 'TreeNode*';
  if (clean.includes('graph') || clean.includes('random')) return 'Node*';
  return 'int';
}

function escapeCppStringLiteral(str) {
  if (typeof str !== 'string') return `"${str}"`;
  return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
}

// Helper to format C++ literal values from JSON input
function formatCppLiteral(val, type) {
  const canonical = normalizeCanonicalType(type);
  const clean = (type || '').trim().toLowerCase();

  if (val === null || val === undefined) {
    if (canonical === 'ListNode' || canonical === 'TreeNode' || canonical === 'GraphNode' || canonical === 'RandomListNode' || clean.includes('node')) {
      return 'nullptr';
    }
    return '0';
  }

  // Primitive int / integer / number
  if (canonical === 'number' || clean === 'number' || clean === 'int' || clean === 'integer') {
    return String(val);
  }

  // Primitive long / long long
  if (canonical === 'long long' || canonical === 'long' || clean === 'long' || clean === 'long long' || clean === 'int64') {
    const s = String(val);
    return s.endsWith('LL') ? s : `${s}LL`;
  }

  // Double / float
  if (canonical === 'double' || canonical === 'float' || clean === 'double' || clean === 'float') {
    return String(val);
  }

  // Boolean
  if (canonical === 'boolean' || clean === 'boolean' || clean === 'bool') {
    return val ? 'true' : 'false';
  }

  // String
  if (canonical === 'string' || clean === 'string' || clean === 'str') {
    return escapeCppStringLiteral(val);
  }

  // 1D Arrays: Integer / Number
  if (
    canonical === 'number[]' ||
    clean === 'number[]' ||
    clean === 'int[]' ||
    clean === 'integer[]' ||
    clean.startsWith('vector<int>') ||
    clean.startsWith('list<int') ||
    clean.startsWith('list<integer') ||
    clean === 'int-array' ||
    clean === 'integer-array'
  ) {
    if (!Array.isArray(val) || val.length === 0) return '{}';
    return `{${val.map(x => Number(x)).join(', ')}}`;
  }

  // 1D Arrays: Double / Float
  if (
    canonical === 'double[]' ||
    clean === 'double[]' ||
    clean === 'float[]' ||
    clean.startsWith('vector<double>') ||
    clean.startsWith('vector<float>') ||
    clean.startsWith('list<double') ||
    clean.startsWith('list<float')
  ) {
    if (!Array.isArray(val) || val.length === 0) return '{}';
    return `{${val.map(x => Number(x)).join(', ')}}`;
  }

  // 1D Arrays: String
  if (
    canonical === 'string[]' ||
    clean === 'string[]' ||
    clean === 'str[]' ||
    clean.startsWith('vector<string>') ||
    clean.startsWith('list<string') ||
    clean.startsWith('list<str>')
  ) {
    if (!Array.isArray(val) || val.length === 0) return '{}';
    return `{${val.map(s => escapeCppStringLiteral(s)).join(', ')}}`;
  }

  // 1D Arrays: Boolean
  if (
    canonical === 'boolean[]' ||
    clean === 'boolean[]' ||
    clean === 'bool[]' ||
    clean.startsWith('vector<bool>') ||
    clean.startsWith('list<bool') ||
    clean.startsWith('list<boolean')
  ) {
    if (!Array.isArray(val) || val.length === 0) return '{}';
    return `{${val.map(b => b ? 'true' : 'false').join(', ')}}`;
  }

  // 2D Matrices: Integer / Number
  if (
    canonical === 'number[][]' ||
    clean === 'number[][]' ||
    clean === 'int[][]' ||
    clean === 'integer[][]' ||
    clean.startsWith('vector<vector<int>>') ||
    clean.startsWith('list<list<int') ||
    clean.startsWith('list<list<integer') ||
    clean === 'matrix'
  ) {
    if (!Array.isArray(val) || val.length === 0) return '{}';
    return `{${val.map(r => `{${(Array.isArray(r) ? r.map(x => Number(x)) : []).join(', ')}}`).join(', ')}}`;
  }

  // 2D Matrices: String
  if (
    canonical === 'string[][]' ||
    clean === 'string[][]' ||
    clean === 'str[][]' ||
    clean.startsWith('vector<vector<string>>')
  ) {
    if (!Array.isArray(val) || val.length === 0) return '{}';
    return `{${val.map(r => `{${(Array.isArray(r) ? r.map(s => escapeCppStringLiteral(s)) : []).join(', ')}}`).join(', ')}}`;
  }

  // 2D Matrices: Boolean
  if (
    canonical === 'boolean[][]' ||
    clean === 'boolean[][]' ||
    clean === 'bool[][]' ||
    clean.startsWith('vector<vector<bool>>')
  ) {
    if (!Array.isArray(val) || val.length === 0) return '{}';
    return `{${val.map(r => `{${(Array.isArray(r) ? r.map(b => b ? 'true' : 'false') : []).join(', ')}}`).join(', ')}}`;
  }

  // Linked List
  if (canonical === 'ListNode' || (clean.includes('listnode') && !clean.includes('random'))) {
    if (!Array.isArray(val) || val.length === 0) return 'nullptr';
    return `build_list_node({${val.map(x => Number(x)).join(', ')}})`;
  }

  // Binary Tree
  if (canonical === 'TreeNode' || clean.includes('treenode') || clean.includes('binarytree')) {
    if (!Array.isArray(val) || val.length === 0 || val[0] === null || val[0] === 'null') return 'nullptr';
    return `build_tree_node({${val.map(x => (x === null || x === 'null' ? '"null"' : `"${x}"`)).join(', ')}})`;
  }

  // Graph / Random List Node
  if (canonical === 'GraphNode' || canonical === 'RandomListNode' || clean.includes('graph') || clean.includes('random')) {
    return 'nullptr';
  }

  return String(val);
}

function getCppSerializerCall(varName, type) {
  const canonical = normalizeCanonicalType(type);
  const clean = (type || '').trim().toLowerCase();
  if (canonical === 'number' || clean === 'number' || clean === 'int' || clean === 'integer') return `serialize_int(${varName})`;
  if (canonical === 'long long' || canonical === 'long' || clean === 'long' || clean === 'long long' || clean === 'int64') return `to_string(${varName})`;
  if (canonical === 'double' || clean === 'float' || clean === 'double') return `serialize_double(${varName})`;
  if (canonical === 'boolean' || clean === 'boolean' || clean === 'bool') return `serialize_bool(${varName})`;
  if (canonical === 'string' || clean === 'string' || clean === 'str') return `serialize_str(${varName})`;
  if (
    canonical === 'number[][]' ||
    canonical === 'string[][]' ||
    canonical === 'boolean[][]' ||
    clean.endsWith('[][]') ||
    clean === 'matrix' ||
    clean.startsWith('vector<vector<')
  ) {
    return `serialize_2d_array(${varName})`;
  }
  if (
    canonical === 'number[]' ||
    canonical === 'double[]' ||
    canonical === 'string[]' ||
    canonical === 'boolean[]' ||
    clean.endsWith('[]') ||
    clean.startsWith('vector<') ||
    clean.startsWith('list<')
  ) {
    return `serialize_1d_array(${varName})`;
  }
  if (canonical === 'ListNode' || (clean.includes('listnode') && !clean.includes('random'))) return `serialize_list_node(${varName})`;
  if (canonical === 'RandomListNode' || clean.includes('randomlistnode')) return `serialize_random_list_node(${varName})`;
  if (canonical === 'TreeNode' || clean.includes('treenode') || clean.includes('binarytree')) return `serialize_tree_node(${varName})`;
  if (canonical === 'GraphNode' || clean.includes('graph')) return `serialize_graph_node(${varName})`;
  return `serialize_str(to_string(${varName}))`;
}

  const testCaseBlocks = testCases.map((tc, idx) => {
    const rawInput = tc.input !== undefined ? tc.input : tc;
    
    const paramInits = parameters.map((p, i) => {
      const pName = p.name || `param_${i}`;
      const val = (typeof rawInput === 'object' && rawInput !== null && rawInput[pName] !== undefined) ? rawInput[pName] : (Array.isArray(rawInput) ? rawInput[i] : rawInput);
      const cppType = getCppType(p.type);
      return `${cppType} tc_${idx}_${pName} = ${formatCppLiteral(val, p.type)};`;
    }).join('\n        ');

    const argList = parameters.map(p => `tc_${idx}_${p.name || ''}`).join(', ');

    let execAndSerialize = '';
    if (inPlaceMutation) {
      const targetParam = parameters.find(p => p.name === mutatedParameter) || parameters[0];
      const targetType = targetParam ? targetParam.type : 'number[]';
      const serializer = getCppSerializerCall(`tc_${idx}_${mutatedParameter}`, targetType);
      execAndSerialize = `string user_stdout = "";
            string out_str = "";
            {
                CoutRedirector _redirector;
                solution.${functionName}(${argList});
                _redirector.restore();
                user_stdout = escape_json_string(_redirector.str());
                out_str = ${serializer};
            }`;
    } else {
      const serializer = getCppSerializerCall('res', returnType);
      execAndSerialize = `string user_stdout = "";
            string out_str = "";
            {
                CoutRedirector _redirector;
                auto res = solution.${functionName}(${argList});
                _redirector.restore();
                user_stdout = escape_json_string(_redirector.str());
                out_str = ${serializer};
            }`;
    }

    return `// Test Case ${idx}
        {
            ${paramInits}
            ${execAndSerialize}
            if (${idx} > 0) cout << ",";
            cout << "{\\"testCaseIndex\\":${idx},\\"output\\":" << out_str << ",\\"stdout\\":" << user_stdout << "}";
        }`;
  }).join('\n\n        ');

  return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <algorithm>
#include <iomanip>
#include <stdexcept>

using namespace std;

// ==========================================
// 1. STANDARD DATA STRUCTURE DEFINITIONS
// ==========================================
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Node {
public:
    int val;
    Node* next;
    Node* random;
    vector<Node*> neighbors;

    Node() : val(0), next(nullptr), random(nullptr) {}
    Node(int _val) : val(_val), next(nullptr), random(nullptr) {}
    Node(int _val, Node* _next, Node* _random) : val(_val), next(_next), random(_random) {}
    Node(int _val, vector<Node*> _neighbors) : val(_val), next(nullptr), random(nullptr), neighbors(_neighbors) {}
};

// ==========================================
// 1.5 INPUT DESERIALIZATION & STREAM HELPERS
// ==========================================
ListNode* build_list_node(const vector<int>& vals) {
    if (vals.empty()) return nullptr;
    ListNode* head = new ListNode(vals[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < vals.size(); ++i) {
        curr->next = new ListNode(vals[i]);
        curr = curr->next;
    }
    return head;
}

TreeNode* build_tree_node(const vector<string>& vals) {
    if (vals.empty() || vals[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(vals[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < vals.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < vals.size()) {
            if (vals[i] != "null") {
                curr->left = new TreeNode(stoi(vals[i]));
                q.push(curr->left);
            }
            i++;
        }
        if (i < vals.size()) {
            if (vals[i] != "null") {
                curr->right = new TreeNode(stoi(vals[i]));
                q.push(curr->right);
            }
            i++;
        }
    }
    return root;
}

class CoutRedirector {
    stringstream buf;
    streambuf* old_buf;
    bool active;
public:
    CoutRedirector() : old_buf(cout.rdbuf(buf.rdbuf())), active(true) {}
    ~CoutRedirector() { restore(); }
    void restore() {
        if (active) {
            cout.rdbuf(old_buf);
            active = false;
        }
    }
    string str() const { return buf.str(); }
};

// ==========================================
// 2. SAFE JSON SERIALIZATION HELPERS (PHASE 4 CONTRACT)
// ==========================================
string escape_json_string(const string& s) {
    ostringstream oss;
    oss << '"';
    for (char c : s) {
        if (c == '"') oss << "\\\\\\\"";
        else if (c == '\\\\') oss << "\\\\\\\\";
        else if (c == '\\b') oss << "\\\\b";
        else if (c == '\\f') oss << "\\\\f";
        else if (c == '\\n') oss << "\\\\n";
        else if (c == '\\r') oss << "\\\\r";
        else if (c == '\\t') oss << "\\\\t";
        else oss << c;
    }
    oss << '"';
    return oss.str();
}

string serialize_int(int val) { return to_string(val); }
string serialize_double(double val) {
    ostringstream oss;
    oss << setprecision(6) << val;
    return oss.str();
}
string serialize_bool(bool val) { return val ? "true" : "false"; }
string serialize_str(const string& val) { return escape_json_string(val); }

template <typename T>
string serialize_1d_array(const vector<T>& arr) {
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < arr.size(); ++i) {
        if (i > 0) oss << ",";
        if constexpr (is_same_v<T, string>) oss << escape_json_string(arr[i]);
        else if constexpr (is_same_v<T, bool>) oss << (arr[i] ? "true" : "false");
        else oss << arr[i];
    }
    oss << "]";
    return oss.str();
}

template <typename T>
string serialize_2d_array(const vector<vector<T>>& mat) {
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < mat.size(); ++i) {
        if (i > 0) oss << ",";
        oss << serialize_1d_array(mat[i]);
    }
    oss << "]";
    return oss.str();
}

string serialize_list_node(ListNode* head) {
    if (!head) return "[]";
    ostringstream oss;
    oss << "[";
    ListNode* curr = head;
    set<ListNode*> visited;
    bool first = true;
    while (curr) {
        if (visited.count(curr)) throw runtime_error("CycleDetectedError: Cyclic reference in linked list");
        visited.insert(curr);
        if (!first) oss << ",";
        oss << curr->val;
        first = false;
        curr = curr->next;
    }
    oss << "]";
    return oss.str();
}

string serialize_tree_node(TreeNode* root) {
    if (!root) return "[]";
    vector<string> res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        if (curr) {
            res.push_back(to_string(curr->val));
            q.push(curr->left);
            q.push(curr->right);
        } else {
            res.push_back("null");
        }
    }
    while (!res.empty() && res.back() == "null") res.pop_back();
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        if (i > 0) oss << ",";
        oss << res[i];
    }
    oss << "]";
    return oss.str();
}

string serialize_random_list_node(Node* head) {
    if (!head) return "[]";
    vector<Node*> nodes;
    map<Node*, int> node_map;
    Node* curr = head;
    int idx = 0;
    while (curr && node_map.find(curr) == node_map.end()) {
        nodes.push_back(curr);
        node_map[curr] = idx++;
        curr = curr->next;
    }
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < nodes.size(); ++i) {
        if (i > 0) oss << ",";
        oss << "[" << nodes[i]->val << ",";
        if (nodes[i]->random && node_map.find(nodes[i]->random) != node_map.end()) {
            oss << node_map[nodes[i]->random];
        } else {
            oss << "null";
        }
        oss << "]";
    }
    oss << "]";
    return oss.str();
}

string serialize_graph_node(Node* node) {
    if (!node) return "[]";
    map<int, Node*> visited;
    queue<Node*> q;
    q.push(node);
    visited[node->val] = node;
    vector<Node*> all_nodes;
    all_nodes.push_back(node);
    while (!q.empty()) {
        Node* curr = q.front();
        q.pop();
        for (Node* neighbor : curr->neighbors) {
            if (neighbor && visited.find(neighbor->val) == visited.end()) {
                visited[neighbor->val] = neighbor;
                q.push(neighbor);
                all_nodes.push_back(neighbor);
            }
        }
    }
    sort(all_nodes.begin(), all_nodes.end(), [](Node* a, Node* b) { return a->val < b->val; });
    bool is_one_to_v = true;
    for (size_t i = 0; i < all_nodes.size(); ++i) {
        if (all_nodes[i]->val != (int)(i + 1)) { is_one_to_v = false; break; }
    }
    ostringstream oss;
    oss << "[";
    if (is_one_to_v) {
        for (size_t i = 0; i < all_nodes.size(); ++i) {
            if (i > 0) oss << ",";
            oss << "[";
            for (size_t j = 0; j < all_nodes[i]->neighbors.size(); ++j) {
                if (j > 0) oss << ",";
                oss << all_nodes[i]->neighbors[j]->val;
            }
            oss << "]";
        }
    } else {
        for (size_t i = 0; i < all_nodes.size(); ++i) {
            if (i > 0) oss << ",";
            oss << "{\\"val\\":" << all_nodes[i]->val << ",\\"neighbors\\":[";
            for (size_t j = 0; j < all_nodes[i]->neighbors.size(); ++j) {
                if (j > 0) oss << ",";
                oss << all_nodes[i]->neighbors[j]->val;
            }
            oss << "]}";
        }
    }
    oss << "]";
    return oss.str();
}

${validationHelpersCode}

// ==========================================
// 3. INJECTED STUDENT SOLUTION
// ==========================================
${studentCode}

// ==========================================
// 4. MAIN DRIVER & EXECUTION ENVELOPE
// ==========================================
int main() {
    try {
        Solution solution;
        cout << "{\\"status\\":\\"SUCCESS\\",\\"results\\":[" ;
        ${testCaseBlocks}
        cout << "]}" << endl;
    } catch (const exception& e) {
        cout << "{\\"status\\":\\"RUNTIME_ERROR\\",\\"testCaseIndex\\":0,\\"errorType\\":\\"std::exception\\",\\"message\\":" << escape_json_string(e.what()) << "}" << endl;
    }
    return 0;
}
`;
}
