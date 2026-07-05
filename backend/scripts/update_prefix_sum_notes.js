import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// Helper function to collapse HTML structure and eliminate raw newlines/indentation gaps
function compressHtml(html) {
  const parts = html.split(/(<pre[\s\S]*?<\/pre>)/g);
  return parts.map(part => {
    if (part.startsWith('<pre')) {
      return part; // keep pre block exactly as is
    } else {
      return part
        .replace(/\r?\n/g, '') // remove newlines
        .replace(/>\s+</g, '><') // collapse whitespace between tags
        .trim();
    }
  }).join('');
}

// Function to generate the bilingual tab structure for a note
function generateBilingualNote(taskId, enContent, hiContent) {
  return `<div class="note-root">
    <!-- Hidden Radio Inputs for Language Toggle -->
    <input type="radio" id="lang-en-${taskId}" name="lang-${taskId}" checked style="display: none;" />
    <input type="radio" id="lang-hi-${taskId}" name="lang-${taskId}" style="display: none;" />

    <!-- Language Selector Tab Bar -->
    <div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
      <label for="lang-en-${taskId}" id="lbl-en-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; user-select: none; transition: all 0.2s;">🇬🇧 English</label>
      <label for="lang-hi-${taskId}" id="lbl-hi-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; user-select: none; transition: all 0.2s;">🇮🇳 हिन्दी (Hindi)</label>
    </div>

    <style>
      #lang-en-${taskId}:checked ~ div #lbl-en-${taskId} {
        background-color: #3b82f6 !important;
        color: white !important;
        border-color: #3b82f6 !important;
      }
      #lang-hi-${taskId}:checked ~ div #lbl-hi-${taskId} {
        background-color: #3b82f6 !important;
        color: white !important;
        border-color: #3b82f6 !important;
      }
      #lang-en-${taskId}:checked ~ .lang-en-${taskId} {
        display: block !important;
      }
      #lang-en-${taskId}:checked ~ .lang-hi-${taskId} {
        display: none !important;
      }
      #lang-hi-${taskId}:checked ~ .lang-en-${taskId} {
        display: none !important;
      }
      #lang-hi-${taskId}:checked ~ .lang-hi-${taskId} {
        display: block !important;
      }
    </style>

    <!-- English Language Content Block -->
    <div class="lang-en-${taskId}" style="display: block;">
      ${enContent}
    </div>

    <!-- Hindi Language Content Block -->
    <div class="lang-hi-${taskId}" style="display: none;">
      ${hiContent}
    </div>
  </div>`;
}

const parentBlueprintHTML = compressHtml(generateBilingualNote("parent-blueprint", 
  `<div style="font-family: sans-serif;">
    <h3 style="color: #6b21a8; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e9d5ff; padding-bottom: 6px; margin-top: 0;">📐 Prefix Sum Identification Blueprint</h3>
    
    <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Prefix Sum Problems?</h4>
      <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
        You should think of Prefix Sum when the problem involves repeated range sum queries on an array that doesn't change (static array), finding subarrays that sum to a target value <code>K</code>, or tracking continuous/cumulative metrics (like product, frequency, parity counts).
      </p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
      <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Mathematical Formulas</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
        <thead>
          <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
            <th style="padding: 6px 4px; font-weight: 700;">Problem Type</th>
            <th style="padding: 6px 4px; font-weight: 700;">Formula / Key Idea</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Range Sum Query [L, R]</td>
            <td style="padding: 6px 4px;"><code>Sum(L, R) = Prefix[R + 1] - Prefix[L]</code> (Using padding/1-based indexing)</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Subarray Sum = K</td>
            <td style="padding: 6px 4px;">Find <code>Prefix[R] - Prefix[L-1] = K</code>, tracking <code>Prefix[R] - K</code> in a Hash Map.</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Divisible by K</td>
            <td style="padding: 6px 4px;">Modulo match: <code>Prefix[R] % K == Prefix[L-1] % K</code> (Normalizing remainders).</td>
          </tr>
          <tr>
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Range Updates [L, R]</td>
            <td style="padding: 6px 4px;">Diff Array: <code>Diff[L] += V</code> and <code>Diff[R + 1] -= V</code>. Rebuild with Prefix Sum.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`,
  `<div style="font-family: sans-serif;">
    <h3 style="color: #6b21a8; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e9d5ff; padding-bottom: 6px; margin-top: 0;">📐 प्रीफिक्स सम पैटर्न की पहचान</h3>
    
    <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 पैटर्न की पहचान कैसे करें?</h4>
      <p style="margin: 0; font-size: 13px; color: #6b21a8; line-height: 1.5;">
        प्रीफिक्स सम का उपयोग तब करें जब आपको किसी स्थिर (static) एरे पर बार-बार रेंज योग निकालना हो, या ऐसा सब-एरे ढूंढना हो जिसका योग <code>K</code> हो, या संचयी गणना (cumulative count) जैसे कि सम-विषम संख्या या प्रोडक्ट को ट्रैक करना हो।
      </p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
      <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य गणितीय सूत्र</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
        <thead>
          <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
            <th style="padding: 6px 4px; font-weight: 700;">समस्या का प्रकार</th>
            <th style="padding: 6px 4px; font-weight: 700;">सूत्र / मुख्य विचार</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">रेंज सम क्वेरी [L, R]</td>
            <td style="padding: 6px 4px;"><code>Sum(L, R) = Prefix[R + 1] - Prefix[L]</code> (पैडिंग/1-बेस्ड इंडेक्स का उपयोग)</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">सब-एरे योग = K</td>
            <td style="padding: 6px 4px;">खोजें <code>Prefix[R] - Prefix[L-1] = K</code>, हैश मैप में <code>Prefix[R] - K</code> को ट्रैक करें।</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">K से विभाज्य</td>
            <td style="padding: 6px 4px;">शेषफल मिलान: <code>Prefix[R] % K == Prefix[L-1] % K</code> (नकारात्मक शेषफल सामान्य करना)।</td>
          </tr>
          <tr>
            <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">रेंज अपडेट [L, R]</td>
            <td style="padding: 6px 4px;">डिफरेंस एरे: <code>Diff[L] += V</code> और <code>Diff[R + 1] -= V</code>। अंत में प्रीफिक्स सम लें।</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`
));

// Function to generate the bilingual tab structure for a note
function generateBilingualNoteDuplicate(taskId, enContent, hiContent) {
  return `<div class="note-root">
    <!-- Hidden Radio Inputs for Language Toggle -->
    <input type="radio" id="lang-en-${taskId}" name="lang-${taskId}" checked style="display: none;" />
    <input type="radio" id="lang-hi-${taskId}" name="lang-${taskId}" style="display: none;" />

    <!-- Language Selector Tab Bar -->
    <div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
      <label for="lang-en-${taskId}" id="lbl-en-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; user-select: none; transition: all 0.2s;">🇬🇧 English</label>
      <label for="lang-hi-${taskId}" id="lbl-hi-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; user-select: none; transition: all 0.2s;">🇮🇳 हिन्दी (Hindi)</label>
    </div>

    <style>
      #lang-en-${taskId}:checked ~ div #lbl-en-${taskId} {
        background-color: #3b82f6 !important;
        color: white !important;
        border-color: #3b82f6 !important;
      }
      #lang-hi-${taskId}:checked ~ div #lbl-hi-${taskId} {
        background-color: #3b82f6 !important;
        color: white !important;
        border-color: #3b82f6 !important;
      }
      #lang-en-${taskId}:checked ~ .lang-en-${taskId} {
        display: block !important;
      }
      #lang-en-${taskId}:checked ~ .lang-hi-${taskId} {
        display: none !important;
      }
      #lang-hi-${taskId}:checked ~ .lang-en-${taskId} {
        display: none !important;
      }
      #lang-hi-${taskId}:checked ~ .lang-hi-${taskId} {
        display: block !important;
      }
    </style>

    <!-- English Language Content Block -->
    <div class="lang-en-${taskId}" style="display: block;">
      ${enContent}
    </div>

    <!-- Hindi Language Content Block -->
    <div class="lang-hi-${taskId}" style="display: none;">
      ${hiContent}
    </div>
  </div>`;
}

// Child Notes Detailed Content Definitions
const childNotesList = [
  {
    taskId: "6a49011bb80dc9d6090441a8",
    title: "Range Sum Query - Prefix Sum",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches how to solve repetitive range sum queries on a static array. Creating a padded prefix sum array of size <code>N + 1</code> avoids manual index checks at the boundaries (e.g. <code>left == 0</code>) and queries range sum in O(1) time.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Loop from <code>left</code> to <code>right</code> for each query. Time: O(N) query, Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Prefix Sum):</span>
        <span style="color: #475569; font-size: 12px;">Precompute cumulative sums. Query: <code>prefix[right + 1] - prefix[left]</code>. Time: O(1) query, Space: O(N) preprocessing.</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class NumArray:
    def __init__(self, nums: List[int]):
        self.prefix = [0] * (len(nums) + 1)
        for i in range(len(nums)):
            self.prefix[i + 1] = self.prefix[i] + nums[i]

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [-2, 0, 3])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Padded array size = 4: <code>prefix = [0, 0, 0, 0]</code><br/>
        - i = 0 (nums[0]=-2): <code>prefix[1] = prefix[0] + nums[0] = 0 + (-2) = -2</code><br/>
        - i = 1 (nums[1]=0): <code>prefix[2] = prefix[1] + nums[1] = -2 + 0 = -2</code><br/>
        - i = 2 (nums[2]=3): <code>prefix[3] = prefix[2] + nums[2] = -2 + 3 = 1</code><br/>
        - Final Prefix array: <code>[0, -2, -2, 1]</code><br/>
        - Query <code>sumRange(0, 2)</code>: <code>prefix[3] - prefix[0] = 1 - 0 = 1</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class NumArray):</b> Defines a class to structure the precomputed sum values.</li>
        <li><b>Line 2 (def __init__):</b> Constructor initialized with the input array of integers.</li>
        <li><b>Line 3 (self.prefix = [0] * ...):</b> Allocates a prefix array size N+1 containing 0s.</li>
        <li><b>Line 4 (for i in range):</b> Loops over the indices from 0 to N-1.</li>
        <li><b>Line 5 (self.prefix[i + 1] = ...):</b> Computes cumulative sum at <code>i+1</code> using the previous index total plus the current element.</li>
        <li><b>Line 7 (def sumRange):</b> Function to calculate the range sum between left and right in O(1) time.</li>
        <li><b>Line 8 (return self.prefix...):</b> Subtracts the left boundary sum from the right boundary sum to calculate range sum.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह समस्या सिखाती है कि बार-बार पूछे जाने वाले रेंज योग को O(N) से O(1) में कैसे बदलें। 0-इंडेक्स की समस्या से बचने के लिए <code>N + 1</code> आकार का प्रीफिक्स एरे बनाते हैं।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">हर क्वेरी पर <code>left</code> से <code>right</code> तक लूप चलाकर योग निकालें। समय: O(N) प्रति क्वेरी, स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Prefix Sum):</span>
        <span style="color: #475569; font-size: 12px;">संचयी योग पहले से निकालें। क्वेरी परिणाम: <code>prefix[right + 1] - prefix[left]</code>। समय: O(1), स्पेस: O(N)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class NumArray:
    def __init__(self, nums: List[int]):
        self.prefix = [0] * (len(nums) + 1)
        for i in range(len(nums)):
            self.prefix[i + 1] = self.prefix[i] + nums[i]

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [-2, 0, 3])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - प्रीफिक्स एरे साइज = 4: <code>prefix = [0, 0, 0, 0]</code><br/>
        - i = 0 (nums[0]=-2): <code>prefix[1] = prefix[0] + nums[0] = 0 + (-2) = -2</code><br/>
        - i = 1 (nums[1]=0): <code>prefix[2] = prefix[1] + nums[1] = -2 + 0 = -2</code><br/>
        - i = 2 (nums[2]=3): <code>prefix[3] = prefix[2] + nums[2] = -2 + 3 = 1</code><br/>
        - अंतिम प्रीफिक्स एरे: <code>[0, -2, -2, 1]</code><br/>
        - क्वेरी <code>sumRange(0, 2)</code>: <code>prefix[3] - prefix[0] = 1 - 0 = 1</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class NumArray):</b> रेंज योग की गणना को व्यवस्थित करने के लिए क्लास को परिभाषित करती है।</li>
        <li><b>लाइन 2 (def __init__):</b> संख्याओं के इनपुट एरे के साथ क्लास को इनिशियलाइज़ करती है।</li>
        <li><b>लाइन 3 (self.prefix = [0] * ...):</b> N+1 साइज़ का प्रीफिक्स एरे 0 मानों के साथ बनाती है।</li>
        <li><b>लाइन 4 (for i in range):</b> एरे के 0 से N-1 तक के सभी इंडेक्स पर लूप चलाती है।</li>
        <li><b>लाइन 5 (self.prefix[i + 1] = ...):</b> पिछले मान में वर्तमान मान जोड़कर संचयी योग निकालती है।</li>
        <li><b>लाइन 7 (def sumRange):</b> रेंज [left, right] का योग O(1) समय में निकालने का फंक्शन।</li>
        <li><b>लाइन 8 (return self.prefix...):</b> दाहिनी सीमा में से बायीं सीमा का मान घटाकर परिणाम वापस करती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441a9",
    title: "Subarray Sum Equals K",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches the "Target Difference" pattern. If <code>Prefix[j] - Prefix[i] = K</code>, then <code>Prefix[i] = Prefix[j] - K</code>. We store prefix sum frequencies in a Hash Map to look up if the complement <code>Prefix[j] - K</code> occurred in the past, yielding an O(N) solution.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Nested loops to verify all subarrays. Time: O(N²), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Prefix Sum + Hash Map):</span>
        <span style="color: #475569; font-size: 12px;">Find <code>curr_sum - K</code> in map. Time: O(N), Space: O(N).</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = 0
        curr_sum = 0
        prefix_sums = {0: 1}
        for num in nums:
            curr_sum += num
            if curr_sum - k in prefix_sums:
                count += prefix_sums[curr_sum - k]
            prefix_sums[curr_sum] = prefix_sums.get(curr_sum, 0) + 1
        return count</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 1, 1], k = 2)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial: <code>count = 0, curr_sum = 0, prefix_sums = {0: 1}</code><br/>
        - Iteration 1 (num=1): <code>curr_sum = 1</code>. <code>curr_sum-k = 1-2 = -1</code> (not in map). Map: <code>{0: 1, 1: 1}</code><br/>
        - Iteration 2 (num=1): <code>curr_sum = 2</code>. <code>curr_sum-k = 2-2 = 0</code> (in map, count +1). <code>count = 1</code>. Map: <code>{0: 1, 1: 1, 2: 1}</code><br/>
        - Iteration 3 (num=1): <code>curr_sum = 3</code>. <code>curr_sum-k = 3-2 = 1</code> (in map, count +1). <code>count = 2</code>. Map: <code>{0: 1, 1: 2, 2: 1, 3: 1}</code><br/>
        - Result: <code>2</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Defines the Solution class container.</li>
        <li><b>Line 2 (def subarraySum):</b> Function taking numbers list and target K, returning total sub-arrays.</li>
        <li><b>Line 3 (count = 0):</b> Initializes total count of valid subarrays to 0.</li>
        <li><b>Line 4 (curr_sum = 0):</b> Running prefix sum initialized to 0.</li>
        <li><b>Line 5 (prefix_sums = {0: 1}):</b> Stores prefix sum frequencies. Handles arrays beginning at index 0.</li>
        <li><b>Line 6 (for num in nums):</b> Iterates through elements one by one.</li>
        <li><b>Line 7 (curr_sum += num):</b> Increments running prefix sum.</li>
        <li><b>Line 8 (if curr_sum - k in prefix_sums):</b> Checks if complement sum was recorded before.</li>
        <li><b>Line 9 (count += prefix_sums[...]):</b> Increments count with the frequency of complement.</li>
        <li><b>Line 10 (prefix_sums[curr_sum] = ...):</b> Registers/increments current prefix sum frequency in map.</li>
        <li><b>Line 11 (return count):</b> Returns total count.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह 'टारगेट डिफरेंस' (Target Difference) पैटर्न सिखाता है। यदि <code>Prefix[j] - Prefix[i] = K</code> है, तो <code>Prefix[i] = Prefix[j] - K</code> होगा। हम पुराने प्रीफिक्स योगों की आवृत्ति को हैश मैप में रखते हैं, जिससे O(N) समाधान मिलता है।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">सारे संभव सब-एरे चेक करने के लिए डबल लूप। समय: O(N²), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Hash Map):</span>
        <span style="color: #475569; font-size: 12px;">मैप में <code>curr_sum - K</code> ढूँढे। समय: O(N), स्पेस: O(N)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = 0
        curr_sum = 0
        prefix_sums = {0: 1}
        for num in nums:
            curr_sum += num
            if curr_sum - k in prefix_sums:
                count += prefix_sums[curr_sum - k]
            prefix_sums[curr_sum] = prefix_sums.get(curr_sum, 0) + 1
        return count</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 1, 1], k = 2)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती मान: <code>count = 0, curr_sum = 0, prefix_sums = {0: 1}</code><br/>
        - लूप 1 (num=1): <code>curr_sum = 1</code>. <code>curr_sum-k = 1-2 = -1</code> (मैप में नहीं है)। मैप: <code>{0: 1, 1: 1}</code><br/>
        - लूप 2 (num=1): <code>curr_sum = 2</code>. <code>curr_sum-k = 2-2 = 0</code> (मैप में है, काउंट +1)। <code>count = 1</code>। मैप: <code>{0: 1, 1: 1, 2: 1}</code><br/>
        - लूप 3 (num=1): <code>curr_sum = 3</code>. <code>curr_sum-k = 3-2 = 1</code> (मैप में है, काउंट +1)। <code>count = 2</code>। मैप: <code>{0: 1, 1: 2, 2: 1, 3: 1}</code><br/>
        - परिणाम: <code>2</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास को परिभाषित करती है।</li>
        <li><b>लाइन 2 (def subarraySum):</b> मुख्य फंक्शन जो एरे और टारगेट K लेकर काउंट रिटर्न करता है।</li>
        <li><b>लाइन 3 (count = 0):</b> कुल सब-एरे की गिनती स्टोर करने के लिए वेरिएबल 0 सेट करती है।</li>
        <li><b>लाइन 4 (curr_sum = 0):</b> चालू प्रीफिक्स योग (cumulative sum) को 0 सेट करती है।</li>
        <li><b>लाइन 5 (prefix_sums = {0: 1}):</b> प्रीफिक्स सम की आवृत्ति स्टोर करने के लिए मैप बनाती है (0: 1 जरूरी है)।</li>
        <li><b>लाइन 6 (for num in nums):</b> एरे के प्रत्येक नंबर पर एक-एक करके लूप चलाती है।</li>
        <li><b>लाइन 7 (curr_sum += num):</b> वर्तमान नंबर को कुल योग में जोड़ती है।</li>
        <li><b>लाइन 8 (if curr_sum - k in prefix_sums):</b> चेक करती है कि क्या आवश्यक अंतर योग (complement) पहले आ चुका है।</li>
        <li><b>लाइन 9 (count += ...):</b> यदि अंतर योग मैप में है, तो उसकी आवृत्ति को कुल काउंट में जोड़ती है।</li>
        <li><b>लाइन 10 (prefix_sums[curr_sum] = ...):</b> वर्तमान योग की आवृत्ति को हैश मैप में बढ़ाती है।</li>
        <li><b>लाइन 11 (return count):</b> अंतिम कुल काउंट को उत्तर के रूप में वापस करती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441aa",
    title: "Continuous Subarray Sum",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches the "Modulo Congruence" pattern. If <code>(Prefix[R] - Prefix[L]) % K == 0</code>, then <code>Prefix[R] % K == Prefix[L] % K</code>. We store the remainder's earliest index in a map to check if a subarray has a size of at least 2.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Validate sum % K == 0 for all subarrays size >= 2. Time: O(N²), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Modulo Index Map):</span>
        <span style="color: #475569; font-size: 12px;">Store earliest index of remainder. Time: O(N), Space: O(min(N, K)).</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def checkSubarraySum(self, nums: List[int], k: int) -> bool:
        rem_map = {0: -1}
        curr_sum = 0
        for i, num in enumerate(nums):
            curr_sum += num
            rem = curr_sum % k if k != 0 else curr_sum
            if rem in rem_map:
                if i - rem_map[rem] >= 2:
                    return True
            else:
                rem_map[rem] = i
        return False</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [23, 2, 4], k = 6)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial: <code>rem_map = {0: -1}, curr_sum = 0</code><br/>
        - i = 0 (num=23): <code>curr_sum=23</code>. <code>rem = 23 % 6 = 5</code>. Map: <code>{0: -1, 5: 0}</code><br/>
        - i = 1 (num=2): <code>curr_sum=25</code>. <code>rem = 25 % 6 = 1</code>. Map: <code>{0: -1, 5: 0, 1: 1}</code><br/>
        - i = 2 (num=4): <code>curr_sum=29</code>. <code>rem = 29 % 6 = 5</code>. Remainder 5 in map! Diff index: <code>2 - 0 = 2 >= 2</code>. Returns <code>True</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Class declaration container.</li>
        <li><b>Line 2 (def checkSubarraySum):</b> Function to find if contiguous subarray sum mod K is zero, size >= 2.</li>
        <li><b>Line 3 (rem_map = {0: -1}):</b> Remainder map initialized with remainder 0 mapped to index -1.</li>
        <li><b>Line 4 (curr_sum = 0):</b> Running sum initialized to 0.</li>
        <li><b>Line 5 (for i, num in enumerate):</b> Iterates index and element value.</li>
        <li><b>Line 6 (curr_sum += num):</b> Adds current element value to running sum.</li>
        <li><b>Line 7 (rem = curr_sum % k ...):</b> Checks divisor 0 safety, then computes remainder of sum mod K.</li>
        <li><b>Line 8 (if rem in rem_map):</b> Checks if this remainder has already occurred.</li>
        <li><b>Line 9 (if i - rem_map[rem] >= 2):</b> Checks if current index minus earliest index is at least 2 elements.</li>
        <li><b>Line 10 (return True):</b> Valid subarray found, returns True.</li>
        <li><b>Line 12 (rem_map[rem] = i):</b> Otherwise, stores current index as earliest index of remainder.</li>
        <li><b>Line 13 (return False):</b> Loop completes without finding any subarray, returns False.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह 'मॉड्यूलो कांग्रेएंस' (Modulo Congruence) पैटर्न सिखाता है। यदि <code>(Prefix[R] - Prefix[L]) % K == 0</code> है, तो <code>Prefix[R] % K == Prefix[L] % K</code> होगा। हम शेषफल के सबसे पहले आने वाले इंडेक्स को स्टोर करते हैं ताकि न्यूनतम लंबाई 2 होने की शर्त पूरी हो सके।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">सभी 2 या अधिक लंबाई वाले सब-एरे का सम निकालकर विभाज्यता जांचना। समय: O(N²), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Remainder Map):</span>
        <span style="color: #475569; font-size: 12px;">शेषफल का न्यूनतम इंडेक्स स्टोर करना। समय: O(N), स्पेस: O(min(N, K))।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def checkSubarraySum(self, nums: List[int], k: int) -> bool:
        rem_map = {0: -1}
        curr_sum = 0
        for i, num in enumerate(nums):
            curr_sum += num
            rem = curr_sum % k if k != 0 else curr_sum
            if rem in rem_map:
                if i - rem_map[rem] >= 2:
                    return True
            else:
                rem_map[rem] = i
        return False</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [23, 2, 4], k = 6)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती मान: <code>rem_map = {0: -1}, curr_sum = 0</code><br/>
        - i = 0 (num=23): <code>curr_sum=23</code>. <code>rem = 23 % 6 = 5</code>. मैप: <code>{0: -1, 5: 0}</code><br/>
        - i = 1 (num=2): <code>curr_sum=25</code>. <code>rem = 25 % 6 = 1</code>. मैप: <code>{0: -1, 5: 0, 1: 1}</code><br/>
        - i = 2 (num=4): <code>curr_sum=29</code>. <code>rem = 29 % 6 = 5</code>. शेषफल 5 पहले से है। दूरी: <code>2 - 0 = 2 >= 2</code>. <code>True</code> रिटर्न (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास को शुरू करती है।</li>
        <li><b>लाइन 2 (def checkSubarraySum):</b> सब-एरे खोजने के लिए फंक्शन को परिभाषित करती है।</li>
        <li><b>लाइन 3 (rem_map = {0: -1}):</b> शेषफल 0 को इंडेक्स -1 पर इनिशियलाइज़ करती है।</li>
        <li><b>लाइन 4 (curr_sum = 0):</b> चालू प्रीफिक्स सम को 0 सेट करती है।</li>
        <li><b>लाइन 5 (for i, num in enumerate):</b> इंडेक्स और वैल्यू पर लूप चलाती है।</li>
        <li><b>लाइन 6 (curr_sum += num):</b> रनिंग सम में करंट वैल्यू जोड़ती है।</li>
        <li><b>लाइन 7 (rem = curr_sum % k ...):</b> K से भाग देकर शेषफल निकालती है।</li>
        <li><b>लाइन 8 (if rem in rem_map):</b> चेक करती है कि यह शेषफल पहले आ चुका है या नहीं।</li>
        <li><b>लाइन 9 (if i - rem_map[rem] >= 2):</b> चेक करती है कि दूरी कम से कम 2 एलिमेंट्स की है या नहीं।</li>
        <li><b>लाइन 10 (return True):</b> यदि दूरी 2 या अधिक है, तो <code>True</code> वापस करती है।</li>
        <li><b>लाइन 12 (rem_map[rem] = i):</b> यदि नया शेषफल है, तो उसे पहली बार देखे गए इंडेक्स के साथ स्टोर करती है।</li>
        <li><b>लाइन 13 (return False):</b> यदि कोई सब-एरे शर्त पूरी नहीं करता, तो <code>False</code> वापस करती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441ab",
    title: "Subarrays Divisible by K",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches remainder frequency tracking. Like Continuous Subarray Sum, if two prefix sums have the same modulo remainder, the elements between them sum to a multiple of K. We maintain frequency counts to find all matching subarrays.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Calculate sum of all subarrays using nested loops. Time: O(N²), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Remainder Freq Map):</span>
        <span style="color: #475569; font-size: 12px;">Accumulate frequencies of remainders. Time: O(N), Space: O(K).</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def subarraysDivByK(self, nums: List[int], k: int) -> int:
        count = 0
        curr_sum = 0
        rem_freq = {0: 1}
        for num in nums:
            curr_sum += num
            rem = curr_sum % k
            if rem < 0:
                rem += k
            if rem in rem_freq:
                count += rem_freq[rem]
            rem_freq[rem] = rem_freq.get(rem, 0) + 1
        return count</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [4, 5], k = 5)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial: <code>count = 0, curr_sum = 0, rem_freq = {0: 1}</code><br/>
        - Iteration 1 (num=4): <code>curr_sum=4, rem=4</code>. Not in map. Map: <code>{0: 1, 4: 1}</code><br/>
        - Iteration 2 (num=5): <code>curr_sum=9, rem=4</code>. Remainder 4 seen before (freq=1). <code>count = 1</code>. Map: <code>{0: 1, 4: 2}</code><br/>
        - Result: <code>1</code> (Subarray [5]) (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Class declaration container.</li>
        <li><b>Line 2 (def subarraysDivByK):</b> Function to return total count of sub-arrays divisible by K.</li>
        <li><b>Line 3 (count = 0):</b> Initializes total count to 0.</li>
        <li><b>Line 4 (curr_sum = 0):</b> Running sum tracker initialized to 0.</li>
        <li><b>Line 5 (rem_freq = {0: 1}):</b> Mod remainder map initialized with {0: 1} for full divisions.</li>
        <li><b>Line 6 (for num in nums):</b> Iterates values.</li>
        <li><b>Line 7 (curr_sum += num):</b> Adds value to cumulative sum.</li>
        <li><b>Line 8 (rem = curr_sum % k):</b> Computes remainder of running sum modulo K.</li>
        <li><b>Line 9 (if rem < 0):</b> Check to handle negative remainders cleanly.</li>
        <li><b>Line 10 (rem += k):</b> Normalize remainder to be positive.</li>
        <li><b>Line 11 (if rem in rem_freq):</b> Checks if this remainder occurred before.</li>
        <li><b>Line 12 (count += rem_freq[rem]):</b> Increments count by its past frequency.</li>
        <li><b>Line 13 (rem_freq[rem] = ...):</b> Increments frequency counts in map.</li>
        <li><b>Line 14 (return count):</b> Returns answer.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह शेषफल आवृत्ति ट्रैकिंग सिखाता है। यदि दो प्रीफिक्स सम का मॉड्युलो शेषफल समान है, तो उनके बीच के तत्वों का योग K का गुणांक होता है। हम कुल सब-एरे गिनने के लिए मैप में आवृत्तियों को जोड़ते हैं।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">सभी सब-एरे का योग निकालकर 5 से विभाज्यता जांचना। समय: O(N²), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Remainder Frequency Map):</span>
        <span style="color: #475569; font-size: 12px;">शेषफल की आवृतियों को स्टोर करना। समय: O(N), स्पेस: O(K)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def subarraysDivByK(self, nums: List[int], k: int) -> int:
        count = 0
        curr_sum = 0
        rem_freq = {0: 1}
        for num in nums:
            curr_sum += num
            rem = curr_sum % k
            if rem < 0:
                rem += k
            if rem in rem_freq:
                count += rem_freq[rem]
            rem_freq[rem] = rem_freq.get(rem, 0) + 1
        return count</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [4, 5], k = 5)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती मान: <code>count = 0, curr_sum = 0, rem_freq = {0: 1}</code><br/>
        - लूप 1 (num=4): <code>curr_sum=4, rem=4</code>. मैप में नहीं है। मैप: <code>{0: 1, 4: 1}</code><br/>
        - लूप 2 (num=5): <code>curr_sum=9, rem=4</code>. शेषफल 4 पहले से मौजूद है (freq=1). <code>count = 1</code>. मैप: <code>{0: 1, 4: 2}</code><br/>
        - परिणाम: <code>1</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास को घोषित करती है।</li>
        <li><b>लाइन 2 (def subarraysDivByK):</b> विभाज्य सब-एरे की कुल संख्या गिनने के लिए फंक्शन।</li>
        <li><b>लाइन 3 (count = 0):</b> कुल काउंट को 0 से शुरू करती है।</li>
        <li><b>लाइन 4 (curr_sum = 0):</b> चालू प्रीफिक्स सम को 0 सेट करती है।</li>
        <li><b>लाइन 5 (rem_freq = {0: 1}):</b> शेषफल आवृतियों का मैप {0:1} से इनिशियलाइज़ करती है।</li>
        <li><b>लाइन 6 (for num in nums):</b> सभी संख्याओं पर लूप चलाती है।</li>
        <li><b>लाइन 7 (curr_sum += num):</b> चालू योग में नंबर जोड़ती है।</li>
        <li><b>लाइन 8 (rem = curr_sum % k):</b> चालू योग का K से शेषफल निकालती है।</li>
        <li><b>लाइन 9 (if rem < 0):</b> चेक करती है कि शेषफल नकारात्मक तो नहीं है।</li>
        <li><b>लाइन 10 (rem += k):</b> नकारात्मक शेषफल को सकारात्मक में बदलती है।</li>
        <li><b>लाइन 11 (if rem in rem_freq):</b> चेक करती है कि यह शेषफल पहले आ चुका है।</li>
        <li><b>लाइन 12 (count += ...):</b> पहले आए शेषफल की आवृत्ति को कुल काउंट में जोड़ती है।</li>
        <li><b>लाइन 13 (rem_freq[rem] = ...):</b> मैप में इस शेषफल की आवृत्ति बढ़ाती है।</li>
        <li><b>लाइन 14 (return count):</b> कुल विभाजित काउंट को उत्तर के रूप में वापस भेजती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441ac",
    title: "Count Subarrays with Equal 0 and 1",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches the binary conversion technique. If we map 0 to -1, a subarray with equal 0s and 1s will have a sum of exactly 0. The problem simplifies to finding subarrays whose cumulative balance sum repeats.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Check all subarrays and count 0s and 1s manually. Time: O(N²), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Zero-Mapping + Hash Map):</span>
        <span style="color: #475569; font-size: 12px;">Map 0 to -1, count balance occurrences. Time: O(N), Space: O(N).</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def findMaxLengthSubarrays(self, nums: List[int]) -> int:
        count = 0
        curr_sum = 0
        prefix_sums = {0: 1}
        for num in nums:
            curr_sum += 1 if num == 1 else -1
            if curr_sum in prefix_sums:
                count += prefix_sums[curr_sum]
            prefix_sums[curr_sum] = prefix_sums.get(curr_sum, 0) + 1
        return count</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [0, 1])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial: <code>count = 0, curr_sum = 0, prefix_sums = {0: 1}</code><br/>
        - Iteration 1 (num=0): <code>curr_sum = -1</code> (not in map). Map: <code>{0: 1, -1: 1}</code><br/>
        - Iteration 2 (num=1): <code>curr_sum = 0</code> (in map, freq=1). <code>count = 1</code>. Map: <code>{0: 2, -1: 1}</code><br/>
        - Result: <code>1</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Class declaration container.</li>
        <li><b>Line 2 (def findMaxLengthSubarrays):</b> Function taking binary numbers list and returning subarray count.</li>
        <li><b>Line 3 (count = 0):</b> Initializes total count to 0.</li>
        <li><b>Line 4 (curr_sum = 0):</b> Tracks prefix balance sum.</li>
        <li><b>Line 5 (prefix_sums = {0: 1}):</b> Stores prefix balance sum frequencies.</li>
        <li><b>Line 6 (for num in nums):</b> Loops over the input array elements.</li>
        <li><b>Line 7 (curr_sum += 1 if num == 1 else -1):</b> Balance check: add 1 for '1', subtract 1 for '0'.</li>
        <li><b>Line 8 (if curr_sum in prefix_sums):</b> Checks if this balance has occurred before.</li>
        <li><b>Line 9 (count += prefix_sums[curr_sum]):</b> Adds occurrence counts to total count.</li>
        <li><b>Line 10 (prefix_sums[curr_sum] = ...):</b> Records current balance frequency.</li>
        <li><b>Line 11 (return count):</b> Returns total count.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह बाइनरी परिवर्तन तकनीक सिखाता है। यदि हम 0 को -1 मान लें, तो समान 0 और 1 वाले सब-एरे का योग ठीक 0 होगा। यह समस्या 0 योग वाले सब-एरे गिनने जैसी सरल हो जाती है।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">सभी सब-एरे में मैन्युअल रूप से 0 और 1 की संख्या गिनना। समय: O(N²), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (0 to -1 Map):</span>
        <span style="color: #475569; font-size: 12px;">0 को -1 में बदलना, संचयी बैलेंस को मैप में ट्रैक करना। समय: O(N), स्पेस: O(N)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def findMaxLengthSubarrays(self, nums: List[int]) -> int:
        count = 0
        curr_sum = 0
        prefix_sums = {0: 1}
        for num in nums:
            curr_sum += 1 if num == 1 else -1
            if curr_sum in prefix_sums:
                count += prefix_sums[curr_sum]
            prefix_sums[curr_sum] = prefix_sums.get(curr_sum, 0) + 1
        return count</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [0, 1])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती मान: <code>count = 0, curr_sum = 0, prefix_sums = {0: 1}</code><br/>
        - लूप 1 (num=0): <code>curr_sum = -1</code> (मैप में नहीं है)। मैप: <code>{0: 1, -1: 1}</code><br/>
        - लूप 2 (num=1): <code>curr_sum = 0</code> (मैप में मौजूद है, freq=1). <code>count = 1</code>. मैप: <code>{0: 2, -1: 1}</code><br/>
        - परिणाम: <code>1</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास घोषित करती है।</li>
        <li><b>लाइन 2 (def findMaxLengthSubarrays):</b> फंक्शन जो एरे लेकर समान संख्या वाले सब-एरे का काउंट देता है।</li>
        <li><b>लाइन 3 (count = 0):</b> कुल काउंट को 0 से शुरू करती है।</li>
        <li><b>लाइन 4 (curr_sum = 0):</b> चालू बैलेंस योग को 0 रखती है।</li>
        <li><b>लाइन 5 (prefix_sums = {0: 1}):</b> संचयी बैलेंस की आवृतियों को स्टोर करने का मैप बनाती है।</li>
        <li><b>लाइन 6 (for num in nums):</b> बाइनरी एरे के तत्वों पर लूप चलाती है।</li>
        <li><b>लाइन 7 (curr_sum += 1 if ...):</b> अंक 1 होने पर +1 जोड़ती है, 0 होने पर -1 घटाती है।</li>
        <li><b>लाइन 8 (if curr_sum in prefix_sums):</b> चेक करती है कि यह बैलेंस सम पहले आ चुका है।</li>
        <li><b>लाइन 9 (count += prefix_sums[curr_sum]):</b> मिले हुए योग की पिछली आवृतियों को जोड़ती है।</li>
        <li><b>लाइन 10 (prefix_sums[curr_sum] = ...):</b> वर्तमान बैलेंस की फ्रीक्वेंसी मैप में बढ़ाती है।</li>
        <li><b>लाइन 11 (return count):</b> कुल काउंट उत्तर के रूप में भेजती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441ad",
    title: "Max Size Subarray Sum Equals K",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches distance maximization. To find the longest subarray, we only store the index of the <i>first</i> time a prefix sum is seen. This keeps the left index boundary as far left as possible.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Nested loops to check all subarrays and record max length. Time: O(N²), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Earliest Index Map):</span>
        <span style="color: #475569; font-size: 12px;">Store earliest index of prefix sum. If <code>curr_sum - K</code> is found, distance is <code>i - map[curr_sum - K]</code>. Time: O(N), Space: O(N).</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def maxSubArrayLen(self, nums: List[int], k: int) -> int:
        max_len = 0
        curr_sum = 0
        first_occur = {0: -1}
        for i, num in enumerate(nums):
            curr_sum += num
            if curr_sum - k in first_occur:
                max_len = max(max_len, i - first_occur[curr_sum - k])
            if curr_sum not in first_occur:
                first_occur[curr_sum] = i
        return max_len</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, -1, 5], k = 0)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial: <code>max_len = 0, curr_sum = 0, first_occur = {0: -1}</code><br/>
        - i = 0 (num=1): <code>curr_sum=1</code>. Map: <code>{0: -1, 1: 0}</code><br/>
        - i = 1 (num=-1): <code>curr_sum=0</code>. <code>curr_sum-k = 0</code> (seen at index -1). <code>max_len = max(0, 1 - (-1)) = 2</code>. Map keeps index -1 for sum 0.<br/>
        - i = 2 (num=5): <code>curr_sum=5</code>. Map: <code>{0: -1, 1: 0, 5: 2}</code><br/>
        - Result: <code>2</code> (Subarray [1, -1]) (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Class declaration container.</li>
        <li><b>Line 2 (def maxSubArrayLen):</b> Function taking nums and target K, returning longest subarray length.</li>
        <li><b>Line 3 (max_len = 0):</b> Tracks maximum length found.</li>
        <li><b>Line 4 (curr_sum = 0):</b> Stores running prefix sum.</li>
        <li><b>Line 5 (first_occur = {0: -1}):</b> Map recording first index. Sum 0 starts at index -1.</li>
        <li><b>Line 6 (for i, num in enumerate):</b> Iterates index and value.</li>
        <li><b>Line 7 (curr_sum += num):</b> Adds value to prefix sum.</li>
        <li><b>Line 8 (if curr_sum - k in first_occur):</b> Checks if complement was seen.</li>
        <li><b>Line 9 (max_len = max(...)):</b> Updates max length using current index minus earliest index.</li>
        <li><b>Line 10 (if curr_sum not in first_occur):</b> Checks if current prefix sum is new.</li>
        <li><b>Line 11 (first_occur[curr_sum] = i):</b> Records current index as earliest index.</li>
        <li><b>Line 12 (return max_len):</b> Returns maximum length.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह दूरी को अधिकतम करना सिखाता है। सबसे लंबा सब-एरे खोजने के लिए हम केवल पहली बार देखे गए प्रीफिक्स सम का इंडेक्स स्टोर करते हैं। इससे बाएं छोर की सीमा अधिक से अधिक पीछे बनी रहती है।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">सभी सब-एरे की जांच करना और सबसे बड़े सब-एरे का आकार दर्ज करना। समय: O(N²), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Earliest Index):</span>
        <span style="color: #475569; font-size: 12px;">प्रीफिक्स योग का पहला इंडेक्स स्टोर करना। दूरी = <code>i - map[curr_sum - K]</code>। समय: O(N), स्पेस: O(N)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def maxSubArrayLen(self, nums: List[int], k: int) -> int:
        max_len = 0
        curr_sum = 0
        first_occur = {0: -1}
        for i, num in enumerate(nums):
            curr_sum += num
            if curr_sum - k in first_occur:
                max_len = max(max_len, i - first_occur[curr_sum - k])
            if curr_sum not in first_occur:
                first_occur[curr_sum] = i
        return max_len</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, -1, 5], k = 0)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती मान: <code>max_len = 0, curr_sum = 0, first_occur = {0: -1}</code><br/>
        - i = 0 (num=1): <code>curr_sum=1</code>. मैप: <code>{0: -1, 1: 0}</code><br/>
        - i = 1 (num=-1): <code>curr_sum=0</code>. <code>curr_sum-k = 0</code> (इंडेक्स -1 पर देखा गया)। <code>max_len = max(0, 1 - (-1)) = 2</code>. मैप में 0: -1 ही बचा रहेगा।<br/>
        - i = 2 (num=5): <code>curr_sum=5</code>. मैप: <code>{0: -1, 1: 0, 5: 2}</code><br/>
        - परिणाम: <code>2</code> (सब-एरे [1, -1]) (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास को घोषित करती है।</li>
        <li><b>लाइन 2 (def maxSubArrayLen):</b> एरे और टारगेट K लेकर सबसे लम्बे सब-एरे की लंबाई निकालने का फंक्शन।</li>
        <li><b>लाइन 3 (max_len = 0):</b> अधिकतम लंबाई को 0 सेट करती है।</li>
        <li><b>लाइन 4 (curr_sum = 0):</b> चालू योग को 0 सेट करती है।</li>
        <li><b>लाइन 5 (first_occur = {0: -1}):</b> प्रत्येक योग के पहली बार देखे गए इंडेक्स को स्टोर करने का मैप (-1 आवश्यक है)।</li>
        <li><b>लाइन 6 (for i, num in enumerate):</b> इंडेक्स और अंक पर लूप चलाती है।</li>
        <li><b>लाइन 7 (curr_sum += num):</b> चालू योग में अंक जोड़ती है।</li>
        <li><b>लाइन 8 (if curr_sum - k in first_occur):</b> चेक करती है कि आवश्यक अंतर योग (complement) मैप में है या नहीं।</li>
        <li><b>लाइन 9 (max_len = max(...)):</b> वर्तमान और पुराने इंडेक्स के अंतर से अधिकतम लंबाई को अपडेट करती है।</li>
        <li><b>लाइन 10 (if curr_sum not in first_occur):</b> चेक करती है कि यह प्रीफिक्स सम नया है।</li>
        <li><b>लाइन 11 (first_occur[curr_sum] = i):</b> यदि नया है, तो उसके पहली बार दिखने के इंडेक्स को रिकॉर्ड करती है।</li>
        <li><b>लाइन 12 (return max_len):</b> अंतिम अधिकतम लंबाई को उत्तर के रूप में लौटाती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441ae",
    title: "Difference Array Basics",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches range update optimization. Instead of updating an entire subarray <code>[L, R]</code> element-by-element in O(N) time, a difference array tracks boundary changes in O(1) time: add <code>+val</code> at index <code>L</code>, and subtract <code>-val</code> at index <code>R + 1</code>. Running a prefix sum recovers the final values in O(N) time.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Loop over range [L, R] to increment each element. Time: O(Q × N), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Difference Array):</span>
        <span style="color: #475569; font-size: 12px;">Mark boundaries in O(1). Rebuild using prefix sum. Time: O(Q + N), Space: O(N).</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class DifferenceArray:
    def __init__(self, arr: List[int]):
        self.diff = [0] * len(arr)
        self.diff[0] = arr[0]
        for i in range(1, len(arr)):
            self.diff[i] = arr[i] - arr[i-1]

    def update(self, l: int, r: int, val: int):
        self.diff[l] += val
        if r + 1 < len(self.diff):
            self.diff[r + 1] -= val

    def get_result(self) -> List[int]:
        res = [0] * len(self.diff)
        res[0] = self.diff[0]
        for i in range(1, len(self.diff)):
            res[i] = res[i-1] + self.diff[i]
        return res</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (arr = [1, 3, 5], query: update [0, 1] by +2)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial Diff: <code>diff = [1, 2, 2]</code> (adjacent differences)<br/>
        - Update <code>[0, 1]</code>: <code>diff[0] += 2</code> -> <code>diff = [3, 2, 2]</code>; <code>diff[2] -= 2</code> -> <code>diff = [3, 2, 0]</code><br/>
        - Reconstruct:<br/>
        &nbsp;&nbsp;- <code>res[0] = diff[0] = 3</code><br/>
        &nbsp;&nbsp;- <code>res[1] = res[0] + diff[1] = 3 + 2 = 5</code><br/>
        &nbsp;&nbsp;- <code>res[2] = res[1] + diff[2] = 5 + 0 = 5</code><br/>
        - Result Array: <code>[3, 5, 5]</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class DifferenceArray):</b> Class container to manage range updates.</li>
        <li><b>Line 2 (def __init__):</b> Constructor taking original array.</li>
        <li><b>Line 3 (self.diff = ...):</b> Allocates memory for difference array.</li>
        <li><b>Line 4 (self.diff[0] = arr[0]):</b> Sets base index element.</li>
        <li><b>Line 5 (for i in range):</b> Loops adjacent index values.</li>
        <li><b>Line 6 (self.diff[i] = ...):</b> Calculates initial element differences.</li>
        <li><b>Line 8 (def update):</b> Range update method.</li>
        <li><b>Line 9 (self.diff[l] += val):</b> Adds val at starting index <code>L</code>.</li>
        <li><b>Line 10 (if r + 1 < ...):</b> Prevents index out of bounds exception.</li>
        <li><b>Line 11 (self.diff[r + 1] -= val):</b> Subtracts val at index <code>R + 1</code>.</li>
        <li><b>Line 13 (def get_result):</b> Prefix sum builder to retrieve final array.</li>
        <li><b>Line 14 (res = ...):</b> Allocates memory for output list.</li>
        <li><b>Line 15 (res[0] = self.diff[0]):</b> Seeds first element.</li>
        <li><b>Line 16 (for i in range):</b> Iterates from index 1 to N-1.</li>
        <li><b>Line 17 (res[i] = ...):</b> Reconstructs element values using prefix sum.</li>
        <li><b>Line 18 (return res):</b> Returns final modified list.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह रेंज अपडेट के इष्टतमीकरण को सिखाता है। पूरे सब-एरे <code>[L, R]</code> में लूप चलाकर $O(N)$ समय बर्बाद करने के बजाय, डिफरेंस एरे सीमाओं पर परिवर्तन दर्ज करता है: <code>L</code> पर <code>+val</code> और <code>R + 1</code> पर <code>-val</code>। अंत में प्रीफिक्स सम लेकर पूरा एरे $O(N)$ में वापस मिल जाता है।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">हर क्वेरी पर <code>L</code> से <code>R</code> तक लूप चलाकर मान बढ़ाना। समय: O(Q × N), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Difference Array):</span>
        <span style="color: #475569; font-size: 12px;">सीमाओं को O(1) में चिन्हित करें और अंत में प्रीफिक्स सम लें। समय: O(Q + N), स्पेस: O(N)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class DifferenceArray:
    def __init__(self, arr: List[int]):
        self.diff = [0] * len(arr)
        self.diff[0] = arr[0]
        for i in range(1, len(arr)):
            self.diff[i] = arr[i] - arr[i-1]

    def update(self, l: int, r: int, val: int):
        self.diff[l] += val
        if r + 1 < len(self.diff):
            self.diff[r + 1] -= val

    def get_result(self) -> List[int]:
        res = [0] * len(self.diff)
        res[0] = self.diff[0]
        for i in range(1, len(self.diff)):
            res[i] = res[i-1] + self.diff[i]
        return res</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (arr = [1, 3, 5], क्वेरी: update [0, 1] by +2)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती डिफरेंस एरे: <code>diff = [1, 2, 2]</code><br/>
        - अपडेट <code>[0, 1]</code>: <code>diff[0] += 2</code> -> <code>diff = [3, 2, 2]</code>; <code>diff[2] -= 2</code> -> <code>diff = [3, 2, 0]</code><br/>
        - पुनर्निर्माण:<br/>
        &nbsp;&nbsp;- <code>res[0] = diff[0] = 3</code><br/>
        &nbsp;&nbsp;- <code>res[1] = res[0] + diff[1] = 3 + 2 = 5</code><br/>
        &nbsp;&nbsp;- <code>res[2] = res[1] + diff[2] = 5 + 0 = 5</code><br/>
        - परिणामी एरे: <code>[3, 5, 5]</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class DifferenceArray):</b> डिफरेंस एरे की व्यवस्था के लिए क्लास घोषित करती है।</li>
        <li><b>लाइन 2 (def __init__):</b> एरे से डिफरेंस एरे बनाने के लिए कंस्ट्रक्टर फंक्शन।</li>
        <li><b>लाइन 3 (self.diff = ...):</b> डिफरेंस एरे बनाने के लिए स्पेस आवंटित करती है।</li>
        <li><b>लाइन 4 (self.diff[0] = arr[0]):</b> पहले तत्व को डिफरेंस एरे के पहले तत्व पर सेट करती है।</li>
        <li><b>लाइन 5 (for i in range):</b> 1 से N-1 तक लूप चलाती है।</li>
        <li><b>लाइन 6 (self.diff[i] = ...):</b> दो पास वाले तत्वों का अंतर लेकर डिफरेंस एरे भरती है।</li>
        <li><b>लाइन 8 (def update):</b> रेंज को अपडेट करने के लिए फंक्शन।</li>
        <li><b>लाइन 9 (self.diff[l] += val):</b> शुरुआती बिंदु <code>L</code> पर वैल्यू जोड़ती है।</li>
        <li><b>लाइन 10 (if r + 1 < ...):</b> आउट ऑफ़ बाउंड्स एरर से बचने के लिए जाँच करती है।</li>
        <li><b>लाइन 11 (self.diff[r + 1] -= val):</b> अंत बिंदु <code>R + 1</code> पर वैल्यू घटाती है।</li>
        <li><b>लाइन 13 (def get_result):</b> अंतिम एरे को प्रीफिक्स सम से पुनर्निर्मित करने का फंक्शन।</li>
        <li><b>लाइन 14 (res = ...):</b> परिणामी एरे के लिए स्पेस बनाती है।</li>
        <li><b>लाइन 15 (res[0] = ...):</b> एरे का पहला तत्व सेट करती है।</li>
        <li><b>लाइन 16 (for i in range):</b> 1 से N-1 तक पुनः लूप चलाती है।</li>
        <li><b>लाइन 17 (res[i] = ...):</b> संचयी योग (Prefix Sum) से परिणामी मान बनाती है।</li>
        <li><b>लाइन 18 (return res):</b> अंतिम अपडेटेड एरे को रिटर्न करती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441af",
    title: "Car Pooling - Diff Array",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches timeline sweep-line simulation using a Difference Array. Since stops are absolute coordinates (0 to 1000), stops serve as indices. We increment passengers at boarding stop and decrement at drop-off stop, then run a prefix sum to verify capacity thresholds.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Increment passenger load for every mile in trip range. Time: O(Trips × Distance), Space: O(Distance).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Timeline Diff Array):</span>
        <span style="color: #475569; font-size: 12px;">Mark boarding changes, then prefix sum. Time: O(Trips + Distance), Space: O(Distance).</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:
        timeline = [0] * 1001
        for num, start, end in trips:
            timeline[start] += num
            timeline[end] -= num
        curr_passengers = 0
        for change in timeline:
            curr_passengers += change
            if curr_passengers > capacity:
                return False
        return True</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (trips = [[2, 1, 5]], capacity = 4)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Timeline stops: <code>timeline = [0]*1001</code><br/>
        - Stop 1: <code>timeline[1] += 2</code>; Stop 5: <code>timeline[5] -= 2</code><br/>
        - Sweep Timeline:<br/>
        &nbsp;&nbsp;- stop 1: <code>curr_passengers = 2</code> (valid)<br/>
        &nbsp;&nbsp;- stop 5: <code>curr_passengers = 0</code> (valid)<br/>
        - Result: <code>True</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Class declaration container.</li>
        <li><b>Line 2 (def carPooling):</b> Function taking trips list and car capacity limit.</li>
        <li><b>Line 3 (timeline = [0] * 1001):</b> Creates coordinate timeline of size 1001 to handle stops.</li>
        <li><b>Line 4 (for num, start, end in trips):</b> Iterates over each trip info.</li>
        <li><b>Line 5 (timeline[start] += num):</b> Boarding: adds passenger load at starting stop.</li>
        <li><b>Line 6 (timeline[end] -= num):</b> Deboarding: subtracts passenger load at destination stop.</li>
        <li><b>Line 7 (curr_passengers = 0):</b> Running count of passengers initialized to 0.</li>
        <li><b>Line 8 (for change in timeline):</b> Iterates chronologically through the timeline.</li>
        <li><b>Line 9 (curr_passengers += change):</b> Applies passenger changes to running count.</li>
        <li><b>Line 10 (if curr_passengers > capacity):</b> Checks if vehicle capacity is exceeded.</li>
        <li><b>Line 11 (return False):</b> Vehicle overloaded, returns False.</li>
        <li><b>Line 12 (return True):</b> Safe journey, returns True.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह समस्या डिफरेंस एरे के द्वारा टाइमलाइन या स्वीप-लाइन सिमुलेशन सिखाती है। चूंकि स्टॉप निश्चित कोऑर्डिनेट्स हैं (0 से 1000), ये इंडेक्स का काम करते हैं। हम चढ़ने वाले स्टॉप पर लोड बढ़ाते हैं और उतरने वाले स्टॉप पर घटाते हैं। अंत में क्षमता जांचने के लिए प्रीफिक्स सम लेते हैं।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">सफर के प्रत्येक मील पर जाकर यात्री लोड को अपडेट करना। समय: O(Trips × Distance), स्पेस: O(Distance)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Difference Array Timeline):</span>
        <span style="color: #475569; font-size: 12px;">चढ़ने-उतरने के बिंदुओं को चिन्हित करना और संचयी योग लेना। समय: O(Trips + Distance), स्पेस: O(Distance)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:
        timeline = [0] * 1001
        for num, start, end in trips:
            timeline[start] += num
            timeline[end] -= num
        curr_passengers = 0
        for change in timeline:
            curr_passengers += change
            if curr_passengers > capacity:
                return False
        return True</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (trips = [[2, 1, 5]], capacity = 4)</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - टाइमलाइन स्टॉप्स: <code>timeline = [0]*1001</code><br/>
        - स्टॉप 1: <code>timeline[1] += 2</code>; स्टॉप 5: <code>timeline[5] -= 2</code><br/>
        - स्वीप टाइमलाइन:<br/>
        &nbsp;&nbsp;- स्टॉप 1: <code>curr_passengers = 2</code> (सही है)<br/>
        &nbsp;&nbsp;- स्टॉप 5: <code>curr_passengers = 0</code> (सही है)<br/>
        - परिणाम: <code>True</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास को घोषित करती है।</li>
        <li><b>लाइन 2 (def carPooling):</b> यात्रा सूची और क्षमता लिमिट लेकर चलने वाला फंक्शन।</li>
        <li><b>लाइन 3 (timeline = [0] * 1001):</b> सभी स्टॉप्स के लिए 1001 साइज का टाइमलाइन एरे बनाती है।</li>
        <li><b>लाइन 4 (for num, start, end in trips):</b> प्रत्येक यात्रा की जानकारी पर लूप चलाती है।</li>
        <li><b>लाइन 5 (timeline[start] += num):</b> चढ़ने वाले स्टॉप पर यात्रियों की संख्या बढ़ाती है।</li>
        <li><b>लाइन 6 (timeline[end] -= num):</b> उतरने वाले स्टॉप पर यात्रियों की संख्या घटाती है।</li>
        <li><b>लाइन 7 (curr_passengers = 0):</b> गाड़ी में वर्तमान यात्रियों की संख्या 0 सेट करती है।</li>
        <li><b>लाइन 8 (for change in timeline):</b> टाइमलाइन पर शुरुआत से अंत तक लूप चलाती है।</li>
        <li><b>लाइन 9 (curr_passengers += change):</b> वर्तमान स्टॉप पर यात्रियों का कुल लोड जोड़ती है।</li>
        <li><b>लाइन 10 (if curr_passengers > capacity):</b> जाँच करती है कि कहीं यात्री क्षमता से ज्यादा तो नहीं हुए।</li>
        <li><b>लाइन 11 (return False):</b> क्षमता से अधिक होने पर गाड़ी आगे नहीं चल सकती, <code>False</code> वापस करती है।</li>
        <li><b>लाइन 12 (return True):</b> यात्रा सफलतापूर्वक पूरी होने पर <code>True</code> वापस करती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441b0",
    title: "Range Addition - Diff Array",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches standard interval modifications on a zero-initialized array. By applying <code>+val</code> at <code>start</code> index, and <code>-val</code> at index <code>end + 1</code>, we construct queries in O(1) time and reconstruct the array using a running prefix sum at the end.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Add updates element-by-element across the target range. Time: O(Q × N), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Difference Array):</span>
        <span style="color: #475569; font-size: 12px;">Record changes at range ends, apply prefix sum at the end. Time: O(Q + N), Space: O(1) auxiliary.</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def getModifiedArray(self, length: int, updates: List[List[int]]) -> List[int]:
        res = [0] * length
        for start, end, val in updates:
            res[start] += val
            if end + 1 < length:
                res[end + 1] -= val
        for i in range(1, length):
            res[i] += res[i-1]
        return res</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (length = 5, updates = [[1, 3, 2]])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial: <code>res = [0, 0, 0, 0, 0]</code><br/>
        - Apply Updates: <code>res[1] += 2</code>; <code>res[4] -= 2</code> -> <code>res = [0, 2, 0, 0, -2]</code><br/>
        - Reconstruct:<br/>
        &nbsp;&nbsp;- <code>res[1] = 0 + 2 = 2</code>; <code>res[2] = 2 + 0 = 2</code>; <code>res[3] = 2 + 0 = 2</code>; <code>res[4] = 2 - 2 = 0</code><br/>
        - Result Array: <code>[0, 2, 2, 2, 0]</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Class declaration container.</li>
        <li><b>Line 2 (def getModifiedArray):</b> Function taking array length and updates list, returning final array.</li>
        <li><b>Line 3 (res = [0] * length):</b> Creates output array populated with 0s.</li>
        <li><b>Line 4 (for start, end, val in updates):</b> Loops through each update range request.</li>
        <li><b>Line 5 (res[start] += val):</b> Adds value at starting boundary.</li>
        <li><b>Line 6 (if end + 1 < length):</b> Checks boundary limits.</li>
        <li><b>Line 7 (res[end + 1] -= val):</b> Subtracts value at end boundary offset.</li>
        <li><b>Line 8 (for i in range):</b> Loops indices to run prefix sum calculation.</li>
        <li><b>Line 9 (res[i] += res[i-1]):</b> Reconstructs element values using prefix sum.</li>
        <li><b>Line 10 (return res):</b> Returns final modified list.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह शून्य से इनिशियलाइज़ किए गए एरे पर रेंज अपडेट करना सिखाता है। प्रारंभ इंडेक्स पर <code>+val</code> और <code>end + 1</code> इंडेक्स पर <code>-val</code> जोड़कर O(1) में मार्किंग करते हैं और अंत में संचयी योग से पूरा एरे पुनर्गठित करते हैं।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">क्वेरी रेंज में प्रत्येक इंडेक्स पर जाकर मान को जोड़ना। समय: O(Q × N), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Difference Array):</span>
        <span style="color: #475569; font-size: 12px;">सीमाओं को अपडेट करना और अंत में O(N) में योग निकालना। समय: O(Q + N), स्पेस: O(1)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def getModifiedArray(self, length: int, updates: List[List[int]]) -> List[int]:
        res = [0] * length
        for start, end, val in updates:
            res[start] += val
            if end + 1 < length:
                res[end + 1] -= val
        for i in range(1, length):
            res[i] += res[i-1]
        return res</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (length = 5, updates = [[1, 3, 2]])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती मान: <code>res = [0, 0, 0, 0, 0]</code><br/>
        - सीमाएँ चिन्हित करें: <code>res[1] += 2</code>; <code>res[4] -= 2</code> -> <code>res = [0, 2, 0, 0, -2]</code><br/>
        - पुनर्निर्माण:<br/>
        &nbsp;&nbsp;- <code>res[1] = 0 + 2 = 2</code>; <code>res[2] = 2 + 0 = 2</code>; <code>res[3] = 2 + 0 = 2</code>; <code>res[4] = 2 - 2 = 0</code><br/>
        - परिणामी एरे: <code>[0, 2, 2, 2, 0]</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास को घोषित करती है।</li>
        <li><b>लाइन 2 (def getModifiedArray):</b> लंबाई और अपडेट्स की लिस्ट लेकर अंतिम परिणामी एरे देने वाला मुख्य फंक्शन।</li>
        <li><b>लाइन 3 (res = [0] * length):</b> कुल लंबाई का एरे 0 मानों के साथ बनाती है।</li>
        <li><b>लाइन 4 (for start, end, val in updates):</b> प्रत्येक अपडेट रेंज रिक्वेस्ट पर लूप चलाती है।</li>
        <li><b>लाइन 5 (res[start] += val):</b> शुरुआत सीमा के इंडेक्स पर वैल्यू जोड़ती है।</li>
        <li><b>लाइन 6 (if end + 1 < length):</b> सीमा से बाहर की एरर से बचने के लिए सुरक्षा जाँच।</li>
        <li><b>लाइन 7 (res[end + 1] -= val):</b> अंत सीमा के आगे वाले इंडेक्स पर वैल्यू घटाती है।</li>
        <li><b>लाइन 8 (for i in range):</b> संचयी योग (Prefix Sum) चलाने के लिए लूप चलाती है।</li>
        <li><b>लाइन 9 (res[i] += res[i-1]):</b> पिछले मानों को जोड़कर मूल मानों को वापस निकालती है।</li>
        <li><b>लाइन 10 (return res):</b> अपडेटेड एरे को रिटर्न करती है।</li>
      </ul>
    `
  },
  {
    taskId: "6a49011bb80dc9d6090441b1",
    title: "Product of Array Except Self",
    color: "#fef08a",
    en: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        This problem teaches prefix/suffix product accumulation. To calculate cumulative values without using the division operator, precompute the product of elements to the left (prefix), then multiply with running products from the right (suffix). This avoids division and handles zero cases cleanly.
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 Approaches</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 Brute Force:</span>
        <span style="color: #475569; font-size: 12px;">Nested loops to multiply all elements except self. Time: O(N²), Space: O(1).</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 Optimal (Prefix & Suffix Array):</span>
        <span style="color: #475569; font-size: 12px;">Accumulate cumulative product from both sides. Time: O(N), Space: O(1) auxiliary.</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 Code</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [1] * n
        for i in range(1, n):
            res[i] = res[i-1] * nums[i-1]
        right_prod = 1
        for i in range(n-1, -1, -1):
            res[i] *= right_prod
            right_prod *= nums[i]
        return res</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 2, 3, 4])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - Initial: <code>res = [1, 1, 1, 1]</code><br/>
        - Prefix loop:<br/>
        &nbsp;&nbsp;- i=1: <code>res[1] = res[0] * nums[0] = 1 * 1 = 1</code><br/>
        &nbsp;&nbsp;- i=2: <code>res[2] = res[1] * nums[1] = 1 * 2 = 2</code><br/>
        &nbsp;&nbsp;- i=3: <code>res[3] = res[2] * nums[2] = 2 * 3 = 6</code> (Prefix array res = <code>[1, 1, 2, 6]</code>)<br/>
        - Suffix loop (right_prod starts at 1):<br/>
        &nbsp;&nbsp;- i=3: <code>res[3] *= 1</code> -> 6. <code>right_prod *= 4</code> -> 4<br/>
        &nbsp;&nbsp;- i=2: <code>res[2] *= 4</code> -> 8. <code>right_prod *= 3</code> -> 12<br/>
        &nbsp;&nbsp;- i=1: <code>res[1] *= 12</code> -> 12. <code>right_prod *= 2</code> -> 24<br/>
        &nbsp;&nbsp;- i=0: <code>res[0] *= 24</code> -> 24. <code>right_prod *= 1</code> -> 24<br/>
        - Result Array: <code>[24, 12, 8, 6]</code> (Correct!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Line-by-Line Code Explanation</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>Line 1 (class Solution):</b> Class declaration container.</li>
        <li><b>Line 2 (def productExceptSelf):</b> Function taking nums, returning array of products except self.</li>
        <li><b>Line 3 (n = len(nums)):</b> Finds array length.</li>
        <li><b>Line 4 (res = [1] * n):</b> Allocates memory with array of size N initialized to 1.</li>
        <li><b>Line 5 (for i in range(1, n)):</b> Loops indices from 1 to N-1 (prefix products).</li>
        <li><b>Line 6 (res[i] = res[i-1] * nums[i-1]):</b> Stores product of all elements to the left of <code>i</code>.</li>
        <li><b>Line 7 (right_prod = 1):</b> Tracks cumulative suffix product from right.</li>
        <li><b>Line 8 (for i in range(n-1, -1, -1)):</b> Loops backward from N-1 down to 0 (suffix products).</li>
        <li><b>Line 9 (res[i] *= right_prod):</b> Multiplies prefix product at <code>i</code> by suffix product to get total product.</li>
        <li><b>Line 10 (right_prod *= nums[i]):</b> Multiplies current element to suffix product accumulator.</li>
        <li><b>Line 11 (return res):</b> Returns final result array.</li>
      </ul>
    `,
    hi: `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 महत्वपूर्ण सीख</h3>
      <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
        यह बाएं/दाएं संचयी उत्पाद (prefix/suffix product) के पैटर्न को सिखाता है। बिना भाग (division) ऑपरेटर का उपयोग किए परिणाम निकालने के लिए, हम पहले किसी तत्व के बाईं ओर के सभी अंकों का गुणनफल निकालते हैं (prefix), और फिर दाहिनी ओर से गुणनफलों (suffix) को संचित करके गुणा करते हैं। इससे 0 वाले मामलों में भी त्रुटि नहीं होती।
      </p>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">💡 तरीके</h3>
      <div style="margin-bottom: 8px;">
        <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">🔴 ब्रूट फ़ोर्स:</span>
        <span style="color: #475569; font-size: 12px;">हर इंडेक्स पर लूप चलाकर स्वयं को छोड़ बाकी सबका गुणा करना। समय: O(N²), स्पेस: O(1)।</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #15803d; font-size: 12px; font-weight: 700;">🟢 इष्टतम (Prefix & Suffix Accumulator):</span>
        <span style="color: #475569; font-size: 12px;">एक ही रिजल्ट एरे में दोनों दिशाओं का प्रोडक्ट संचित करना। समय: O(N), स्पेस: O(1) (बिना आउटपुट स्पेस गिने)।</span>
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px;">🐍 Python 3 कोड</h3>
      <pre style="background-color: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [1] * n
        for i in range(1, n):
            res[i] = res[i-1] * nums[i-1]
        right_prod = 1
        for i in range(n-1, -1, -1):
            res[i] *= right_prod
            right_prod *= nums[i]
        return res</pre>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 2, 3, 4])</h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
        - शुरुआती मान: <code>res = [1, 1, 1, 1]</code><br/>
        - बाएं से लूप (Prefix Product):<br/>
        &nbsp;&nbsp;- i=1: <code>res[1] = res[0] * nums[0] = 1 * 1 = 1</code><br/>
        &nbsp;&nbsp;- i=2: <code>res[2] = res[1] * nums[1] = 1 * 2 = 2</code><br/>
        &nbsp;&nbsp;- i=3: <code>res[3] = res[2] * nums[2] = 2 * 3 = 6</code> (बाएं से बना एरे: <code>[1, 1, 2, 6]</code>)<br/>
        - दाएं से लूप (Suffix Product, right_prod=1 से शुरू):<br/>
        &nbsp;&nbsp;- i=3: <code>res[3] *= 1</code> -> 6. <code>right_prod *= 4</code> -> 4<br/>
        &nbsp;&nbsp;- i=2: <code>res[2] *= 4</code> -> 8. <code>right_prod *= 3</code> -> 12<br/>
        &nbsp;&nbsp;- i=1: <code>res[1] *= 12</code> -> 12. <code>right_prod *= 2</code> -> 24<br/>
        &nbsp;&nbsp;- i=0: <code>res[0] *= 24</code> -> 24. <code>right_prod *= 1</code> -> 24<br/>
        - परिणामी एरे: <code>[24, 12, 8, 6]</code> (सही है!)
      </div>

      <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
      <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
        <li><b>लाइन 1 (class Solution):</b> Solution क्लास को घोषित करती है।</li>
        <li><b>लाइन 2 (def productExceptSelf):</b> मुख्य फंक्शन जो एरे लेता है और खुद को छोड़कर प्रोडक्ट एरे देता है।</li>
        <li><b>लाइन 3 (n = len(nums)):</b> इनपुट एरे की लंबाई मापती है।</li>
        <li><b>लाइन 4 (res = [1] * n):</b> N साइज का एरे बनाकर उसे 1 से भरती है।</li>
        <li><b>लाइन 5 (for i in range(1, n)):</b> 1 से N-1 तक बाएं से आगे की ओर लूप चलाती है।</li>
        <li><b>लाइन 6 (res[i] = res[i-1] * nums[i-1]):</b> तत्व <code>i</code> के बाईं ओर के सभी अंकों का गुणनफल स्टोर करती है।</li>
        <li><b>लाइन 7 (right_prod = 1):</b> दाहिनी ओर के संचयी गुणनफल (suffix product) को 1 सेट करती है।</li>
        <li><b>लाइन 8 (for i in range(n-1, -1, -1)):</b> N-1 से 0 तक पीछे की ओर लूप चलाती है।</li>
        <li><b>लाइन 9 (res[i] *= right_prod):</b> बाएं प्रोडक्ट को वर्तमान दाएं प्रोडक्ट से गुणा करती है।</li>
        <li><b>लाइन 10 (right_prod *= nums[i]):</b> वर्तमान अंक को दाएं उत्पाद के गुणांक में शामिल करती है।</li>
        <li><b>लाइन 11 (return res):</b> अंतिम गुणनफल एरे को परिणाम के रूप में लौटाती है।</li>
      </ul>
    `
  }
];

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const Note = mongoose.connection.collection('notes');
    const userId = new mongoose.Types.ObjectId("6993047f16e85ff3e4efd9a3");

    // Update parent blueprint note
    await Note.updateOne(
      { title: "Blueprint to Identify Prefix Sum Problems", userId },
      {
        $set: {
          content: parentBlueprintHTML,
          color: "#d8b4fe",
          position: { x: 300, y: 2500 },
          size: { width: 380, height: 350 },
          updatedAt: new Date()
        }
      }
    );
    console.log("Updated parent blueprint note.");

    // Update each child note with bilingual tabs, dry runs, and line-by-line explanations
    let index = 0;
    for (const note of childNotesList) {
      const childTaskId = new mongoose.Types.ObjectId(note.taskId);
      
      const xOffset = 100 + (index % 4) * 480;
      const yOffset = 2950 + Math.floor(index / 4) * 520;

      // Wrap in unique bilingual tabs for this note
      const tabbedContent = generateBilingualNote(note.taskId, note.en, note.hi);
      const compressedContent = compressHtml(tabbedContent);

      await Note.updateOne(
        { taskId: childTaskId, userId },
        {
          $set: {
            content: compressedContent,
            color: note.color,
            position: { x: xOffset, y: yOffset },
            size: { width: 380, height: 420 }, // slightly larger height to accommodate tabs cleanly
            updatedAt: new Date()
          }
        }
      );
      console.log(`Updated child note for task ID: ${note.taskId}`);
      index++;
    }

    console.log("Database update completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating database:", error);
    process.exit(1);
  }
}

run();
