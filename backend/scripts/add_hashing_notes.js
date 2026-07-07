import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";

const uri = process.env.MONGODB_URI;

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
  return `<div class="note-root"><input type="radio" id="lang-en-${taskId}" name="lang-${taskId}" checked style="display: none;" /><input type="radio" id="lang-hi-${taskId}" name="lang-${taskId}" style="display: none;" /><div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;"><label for="lang-en-${taskId}" id="lbl-en-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; user-select: none; transition: all 0.2s;">🇬🇧 English</label><label for="lang-hi-${taskId}" id="lbl-hi-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; user-select: none; transition: all 0.2s;">🇮🇳 हिन्दी (Hindi)</label></div><style>#lang-en-${taskId}:checked ~ div #lbl-en-${taskId} { background-color: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; } #lang-hi-${taskId}:checked ~ div #lbl-hi-${taskId} { background-color: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; } #lang-en-${taskId}:checked ~ .lang-en-${taskId} { display: block !important; } #lang-en-${taskId}:checked ~ .lang-hi-${taskId} { display: none !important; } #lang-hi-${taskId}:checked ~ .lang-en-${taskId} { display: none !important; } #lang-hi-${taskId}:checked ~ .lang-hi-${taskId} { display: block !important; }</style><div class="lang-en-${taskId}" style="display: block;">${enContent}</div><div class="lang-hi-${taskId}" style="display: none;">${hiContent}</div></div>`;
}

// ----------------------------------------------------
// 1. Parent Blueprint Content (Bilingual)
// ----------------------------------------------------
const parentTaskId = "69e7504ec05bf5f0580b8017";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 Hashing Identification Blueprint</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Hashing Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      You should apply Hashing when the problem involves checking existence of elements in constant O(1) time, tracking counts or frequencies of entries, mapping relationships between keys and values, or tracking prefix mathematical constraints.
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Algorithm Categories</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Problem Class</th>
          <th style="padding: 6px 4px; font-weight: 700;">Key Mechanism / Loop</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Existence Check (Set)</td>
          <td style="padding: 6px 4px;">Convert array to hash set to retrieve and check elements in constant <code>O(1)</code> lookup time.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Frequencies / Bucket Sort</td>
          <td style="padding: 6px 4px;">Map elements to counts. Use buckets index as frequencies to retrieve values in linear time.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Prefix Sum Mapping</td>
          <td style="padding: 6px 4px;">Store prefix sums frequencies inside map to look up <code>prefix_sum - target</code> matches dynamically.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Bi-directional Mappings</td>
          <td style="padding: 6px 4px;">Maintain two separate maps to validate unique matching character sets.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 हैशिंग पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 हैशिंग समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      आपको हैशिंग लागू करना चाहिए जब समस्या में निरंतर O(1) समय में तत्वों के अस्तित्व की जाँच करना, प्रविष्टियों की संख्या या आवृत्तियों को ट्रैक करना, कुंजियों और मानों के बीच संबंधों को मैप करना शामिल हो।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य श्रेणियां</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">समस्या श्रेणी</th>
          <th style="padding: 6px 4px; font-weight: 700;">मुख्य प्रक्रिया</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">अस्तित्व की जाँच (Set)</td>
          <td style="padding: 6px 4px;">निरंतर <code>O(1)</code> लुकअप समय में तत्वों को खोजने के लिए एरे को हैश सेट में बदलें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">आवृत्ति / बाल्टी क्रम (Bucket)</td>
          <td style="padding: 6px 4px;">तत्वों को आवृत्तियों से मैप करें। रैखिक समय में मान प्राप्त करने के लिए बाल्टी सूचकांक का उपयोग करें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">प्रिफिक्स सम मैपिंग</td>
          <td style="padding: 6px 4px;"><code>prefix_sum - target</code> मिलानों को खोजने के लिए प्रिफिक्स सम आवृत्ति को मैप में सहेजें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">द्वि-दिशात्मक मैपिंग</td>
          <td style="padding: 6px 4px;">समान मिलान वाले अक्षरों को सत्यापित करने के लिए दो अलग-अलग मैप्स बनाए रखें।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Hashing Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Hashing", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e7504ec05bf5f0580b8019",
    title: "Two Sum Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use nested loops to check sum of every pair of elements. Inefficient.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N²) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Complement Hash Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Loop elements, compute remaining target value <code>remaining = target - num</code>. If complement exists inside map, return complement's index and current index. Otherwise store element index.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            remaining = target - num
            if remaining in seen:
                return [seen[remaining], i]
            seen[num] = i
        return []</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [2, 7, 11, 15], target = 9)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 (2) -> remaining = 9 - 2 = 7. Not in seen. map = {2: 0}.<br/>
    - i = 1 (7) -> remaining = 9 - 7 = 2. Present in seen! seen[2] = 0.<br/>
    - Returns index indices [0, 1]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and main method definition.</li>
    <li><b>Line 3:</b> Set map dictionary variable tracking seen elements.</li>
    <li><b>Line 4:</b> Loop index and number.</li>
    <li><b>Line 5-7:</b> If subtraction value of current target is in map, return indices pair.</li>
    <li><b>Line 8:</b> Record current element index.</li>
    <li><b>Line 9:</b> Fallback empty returns.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 ब्रूट फ़ोर्स दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक जोड़े के योग की जाँच करने के लिए नेस्टेड लूप का उपयोग करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N²) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Complement Hash Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">तत्वों पर लूप करें, शेष लक्ष्य मान <code>remaining = target - num</code> की गणना करें। यदि यह मैप में मौजूद है, तो इंडेक्स वापस करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            remaining = target - num
            if remaining in seen:
                return [seen[remaining], i]
            seen[num] = i
        return []</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [2, 7, 11, 15], target = 9)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 (2) -> remaining = 9 - 2 = 7। seen में नहीं है। map = {2: 0}।<br/>
    - i = 1 (7) -> remaining = 9 - 7 = 2। seen में है! seen[2] = 0।<br/>
    - इंडेक्स [0, 1] लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> देखे गए अंकों का हैश मैप (seen) बनाना।</li>
    <li><b>लाइन 4:</b> इंडेक्स और अंक पर लूप चलाना।</li>
    <li><b>लाइन 5-7:</b> यदि शेष अंतर (target - num) मैप में पहले से है, तो दोनों इंडेक्स लौटाना।</li>
    <li><b>लाइन 8:</b> वर्तमान अंक का इंडेक्स मैप में सहेजना।</li>
    <li><b>लाइन 9:</b> खाली एरे का डिफ़ॉल्ट रिटर्न।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504ec05bf5f0580b801b",
    title: "Group Anagrams Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Quadratic Comparisons</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Compare each word with every other word to check if they are anagrams. Extremely slow.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N² * L) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Sorted Word Key Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use a hash map. For each word, sort its characters to build a unique key. Append the original word to the list corresponding to its sorted key.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N * L log L) | 🧠 Space: O(N * L)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        anagram_map = {}
        for s in strs:
            sorted_s = "".join(sorted(s))
            if sorted_s not in anagram_map:
                anagram_map[sorted_s] = []
            anagram_map[sorted_s].append(s)
        return list(anagram_map.values())</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (strs = ["eat", "tea", "tan", "ate", "nat", "bat"])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - s = "eat" -> sorted_s = "aet". map = {"aet": ["eat"]}.<br/>
    - s = "tea" -> sorted_s = "aet". map = {"aet": ["eat", "tea"]}.<br/>
    - s = "tan" -> sorted_s = "ant". map = {"aet": ["eat", "tea"], "ant": ["tan"]}.<br/>
    - s = "ate" -> sorted_s = "aet". map = {"aet": ["eat", "tea", "ate"], "ant": ["tan"]}.<br/>
    - Returns grouped values list. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and groupAnagrams function signature.</li>
    <li><b>Line 3:</b> Initialize anagram_map tracker map.</li>
    <li><b>Line 4-5:</b> Loop strings. Sort characters to create standard key.</li>
    <li><b>Line 6-7:</b> Initialize empty list if sorted key is new in map.</li>
    <li><b>Line 8:</b> Append original string s to mapped key array.</li>
    <li><b>Line 9:</b> Return values lists representing groups of anagrams.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 द्विघातीय तुलना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक शब्द की हर दूसरे शब्द से तुलना करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N² * L) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Sorted Word Key Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">हैश मैप का उपयोग करें। प्रत्येक शब्द के अक्षरों को सॉर्ट करके एक विशिष्ट कुंजी (key) बनाएं। मूल शब्द को सॉर्ट की गई कुंजी वाली सूची में जोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N * L log L) | 🧠 स्थान: O(N * L)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        anagram_map = {}
        for s in strs:
            sorted_s = "".join(sorted(s))
            if sorted_s not in anagram_map:
                anagram_map[sorted_s] = []
            anagram_map[sorted_s].append(s)
        return list(anagram_map.values())</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (strs = ["eat", "tea", "tan", "ate", "nat", "bat"])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - s = "eat" -> sorted_s = "aet" | map = {"aet": ["eat"]}।<br/>
    - s = "tea" -> sorted_s = "aet" | map = {"aet": ["eat", "tea"]}।<br/>
    - s = "tan" -> sorted_s = "ant" | map = {"aet": ["eat", "tea"], "ant": ["tan"]}।<br/>
    - समूहीकृत मानों की सूची लौटाई।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> परिणामी समूह मैप (anagram_map) घोषित करना।</li>
    <li><b>लाइन 4-5:</b> एरे के शब्दों पर लूप और अक्षरों को सॉर्ट कर कुंजी बनाना।</li>
    <li><b>लाइन 6-7:</b> यदि सॉर्ट की गई कुंजी मैप में नहीं है, तो खाली सूची घोषित करना।</li>
    <li><b>लाइन 8:</b> मूल शब्द <code>s</code> को कुंजी वाली सूची में जोड़ना।</li>
    <li><b>लाइन 9:</b> समूहीकृत वैल्यूज को लिस्ट में बदलकर लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504ec05bf5f0580b801d",
    title: "Top K frequent elements Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Sorting Count Values</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies using dictionary, sort unique items by value. Complexity dominated by sorting step.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N log N) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Bucket Sort Frequency Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies. Build an array of buckets where the index represents frequency. Iterate the buckets backwards (descending frequencies) to collect the top K elements in linear time.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = {}
        for num in nums:
            count[num] = count.get(num, 0) + 1
            
        buckets = [[] for _ in range(len(nums) + 1)]
        for num, freq in count.items():
            buckets[freq].append(num)
            
        ans = []
        for i in range(len(buckets) - 1, 0, -1):
            for num in buckets[i]:
                ans.append(num)
                if len(ans) == k:
                    return ans
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 1, 1, 2, 2, 3], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - count = {1: 3, 2: 2, 3: 1}.<br/>
    - buckets = [[], [3], [2], [1], [], [], []]. Size: 7.<br/>
    - Loop backwards from index 6 down to 1:<br/>
    &nbsp;&nbsp;• Index 3: elements [1] -> ans = [1]. ans size is 1.<br/>
    &nbsp;&nbsp;• Index 2: elements [2] -> ans = [1, 2]. ans size reaches k (2). Returns [1, 2]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and topKFrequent method declaration.</li>
    <li><b>Line 3-5:</b> Count number occurrences inside dictionary map.</li>
    <li><b>Line 7-9:</b> Initialize bucket lists (index represents frequency). Map numbers to their frequency buckets.</li>
    <li><b>Line 11-12:</b> Set answer variable. Loop buckets from maximum frequency downwards.</li>
    <li><b>Line 13-16:</b> Append elements. Return answer lists if length matches k.</li>
    <li><b>Line 17:</b> Return fallback answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 सॉर्टिंग दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">डिक्शनरी के मानों (frequencies) को सॉर्ट करें और अंतिम k तत्वों को चुनें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N log N) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Bucket Sort Frequency Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">तत्वों की आवृत्ति गिनें। एक बाल्टी एरे (Bucket Array) बनाएं, जहां एरे इंडेक्स आवृत्ति को दर्शाता है। शीर्ष K तत्वों को एकत्र करने के लिए पीछे की ओर से लूप चलाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = {}
        for num in nums:
            count[num] = count.get(num, 0) + 1
            
        buckets = [[] for _ in range(len(nums) + 1)]
        for num, freq in count.items():
            buckets[freq].append(num)
            
        ans = []
        for i in range(len(buckets) - 1, 0, -1):
            for num in buckets[i]:
                ans.append(num)
                if len(ans) == k:
                    return ans
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 1, 1, 2, 2, 3], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - count = {1: 3, 2: 2, 3: 1}।<br/>
    - buckets = [[], [3], [2], [1], [], [], []] (आकार 7)।<br/>
    - इंडेक्स 6 से 1 की ओर पीछे की लूप:<br/>
    &nbsp;&nbsp;• इंडेक्स 3: मान [1] -> ans = [1]।<br/>
    &nbsp;&nbsp;• इंडेक्स 2: मान [2] -> ans = [1, 2]। (ans का आकार k = 2 के समान हुआ -> परिणाम [1, 2] लौटाया)।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> एरे में अंकों की आवृत्तियाँ गिनना।</li>
    <li><b>लाइन 7-9:</b> बकेट लिस्ट बनाना (जहाँ इंडेक्स ही फ्रीक्वेंसी है)। अंकों को उनकी बकेट में डालना।</li>
    <li><b>लाइन 11-12:</b> परिणाम एरे घोषित करना। बकेट में पीछे से (अधिक आवृत्ति से कम आवृत्ति) लूप चलाना।</li>
    <li><b>लाइन 13-16:</b> अंकों को जोड़ना। काउंट K होने पर एरे लौटाना।</li>
    <li><b>लाइन 17:</b> डिफ़ॉल्ट परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504ec05bf5f0580b801f",
    title: "Longest consecutive sequence Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Hash Set Sequence Start Rule</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Convert array to hash set for O(1) searches. A number starts a sequence only if <code>num - 1</code> is not in the set. If it starts a sequence, count consecutive numbers onwards.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        max_len = 0
        for num in num_set:
            if (num - 1) not in num_set:
                current_num = num
                current_len = 1
                while (current_num + 1) in num_set:
                    current_num += 1
                    current_len += 1
                max_len = max(max_len, current_len)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [100, 4, 200, 1, 3, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - num_set = {100, 4, 200, 1, 3, 2}. max_len = 0.<br/>
    - num = 100 -> 99 not in set. Sequence starts! current_len = 1. 101 not in set. max_len = max(0, 1) = 1.<br/>
    - num = 4 -> 3 is in set. Skip (not start of sequence).<br/>
    - num = 1 -> 0 not in set. Sequence starts! Loop checks 2, 3, 4. current_len = 4. max_len = max(1, 4) = 4.<br/>
    - Returns longest consecutive size 4. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-4:</b> Populate hash set from nums list, set max_len = 0.</li>
    <li><b>Line 5-6:</b> Iterate set. Check if current number starts a sequence (num - 1 not in set).</li>
    <li><b>Line 7-8:</b> Initialize sequence trackers (length = 1).</li>
    <li><b>Line 9-11:</b> Increment number and length while consecutive digits are in set.</li>
    <li><b>Line 12:</b> Update max sequence size tracker.</li>
    <li><b>Line 13:</b> Return max length.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 हैश सेट सीक्वेंस नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">निरंतर O(1) लुकअप के लिए एरे को हैश सेट में बदलें। कोई भी नंबर सीक्वेंस की शुरुआत तभी हो सकता है जब <code>num - 1</code> सेट में मौजूद न हो।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        max_len = 0
        for num in num_set:
            if (num - 1) not in num_set:
                current_num = num
                current_len = 1
                while (current_num + 1) in num_set:
                    current_num += 1
                    current_len += 1
                max_len = max(max_len, current_len)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [100, 4, 200, 1, 3, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - num_set = {100, 4, 200, 1, 3, 2}।<br/>
    - num = 100 -> 99 सेट में नहीं है (सीक्वेंस की शुरुआत है)। max_len = 1।<br/>
    - num = 4 -> 3 सेट में मौजूद है। (स्किप करें)।<br/>
    - num = 1 -> 0 सेट में नहीं है (शुरुआत है)। लूप 2, 3, 4 को चेक करता है। current_len = 4। max_len = max(1, 4) = 4।<br/>
    - अधिकतम लंबाई 4 मिली।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> अंकों को हैश सेट में बदलना और अधिकतम लंबाई 0 रखना।</li>
    <li><b>लाइन 5:</b> सेट के अंकों पर लूप चलाना।</li>
    <li><b>लाइन 6:</b> जांचना कि क्या अंक सीक्वेंस की शुरुआत है (num - 1 सेट में नहीं होना चाहिए)।</li>
    <li><b>लाइन 7-8:</b> सीक्वेंस का साइज वेरिएबल (1) और रनिंग अंक ट्रैक करना।</li>
    <li><b>लाइन 9-11:</b> लगातार आने वाले अंकों को खोजना और आकार बढ़ाना।</li>
    <li><b>लाइन 12:</b> अधिकतम लंबाई अपडेट करना।</li>
    <li><b>लाइन 13:</b> परिणामी लंबाई लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504ec05bf5f0580b8021",
    title: "Subarray sum equals K Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Prefix Sum Difference Mapping</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">If sum of subarray <code>[i...j]</code> equals K, then <code>prefix_sum[j] - prefix_sum[i-1] = K</code>, which means <code>prefix_sum[i-1] = prefix_sum[j] - K</code>. Store prefix sums frequencies in a map.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefix_map = {0: 1}
        current_sum = 0
        count = 0
        for num in nums:
            current_sum += num
            if (current_sum - k) in prefix_map:
                count += prefix_map[current_sum - k]
            prefix_map[current_sum] = prefix_map.get(current_sum, 0) + 1
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 1, 1], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - prefix_map = {0: 1}, current_sum = 0, count = 0.<br/>
    - num = 1 -> current_sum = 1. (1 - 2 = -1) not in map. map = {0: 1, 1: 1}.<br/>
    - num = 1 -> current_sum = 2. (2 - 2 = 0) present in map (frequency 1). count = 1. map = {0: 1, 1: 1, 2: 1}.<br/>
    - num = 1 -> current_sum = 3. (3 - 2 = 1) present in map (frequency 1). count = 2. map = {0: 1, 1: 1, 2: 1, 3: 1}.<br/>
    - Returns total count 2. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3:</b> Set prefix_map containing base prefix sum 0 mapped to frequency 1.</li>
    <li><b>Line 4-5:</b> Set trackers variables current_sum and count = 0.</li>
    <li><b>Line 6-7:</b> Loop nums and accumulate sum.</li>
    <li><b>Line 8-9:</b> If value (current_sum - k) was seen, add its recorded count frequency.</li>
    <li><b>Line 10:</b> Add current_sum frequency count inside map dictionary.</li>
    <li><b>Line 11:</b> Return count.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 प्रिफिक्स सम डिफरेंस मैपिंग</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">यदि सबएरे <code>[i...j]</code> का योग K है, तो <code>prefix_sum[j] - prefix_sum[i-1] = K</code>, जिसका अर्थ है <code>prefix_sum[i-1] = prefix_sum[j] - K</code>। प्रिफिक्स सम की आवृत्ति को डिक्शनरी में संग्रहीत करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefix_map = {0: 1}
        current_sum = 0
        count = 0
        for num in nums:
            current_sum += num
            if (current_sum - k) in prefix_map:
                count += prefix_map[current_sum - k]
            prefix_map[current_sum] = prefix_map.get(current_sum, 0) + 1
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 1, 1], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - prefix_map = {0: 1}।<br/>
    - num = 1 -> sum = 1। (1 - 2 = -1) मैप में नहीं है। map = {0: 1, 1: 1}।<br/>
    - num = 1 -> sum = 2। (2 - 2 = 0) मैप में है। count = 1। map = {0: 1, 1: 1, 2: 1}।<br/>
    - num = 1 -> sum = 3। (3 - 2 = 1) मैप में है। count = 2।<br/>
    - कुल काउंट 2 मिला।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> बेस प्रिफिक्स सम 0 को आवृत्ति 1 से मैप करना (ताकि 0 से शुरू होने वाले सबएरे गिने जा सकें)।</li>
    <li><b>लाइन 4-5:</b> योग और सबएरे काउंट वेरिएबल घोषित करना।</li>
    <li><b>लाइन 6-7:</b> एरे के तत्वों को जोड़ना।</li>
    <li><b>लाइन 8-9:</b> यदि (current_sum - k) का प्रिफिक्स सम पहले देखा जा चुका है, तो उसकी आवृत्ति को काउंट में जोड़ना।</li>
    <li><b>लाइन 10:</b> वर्तमान योग की आवृत्ति को हैश मैप में बढ़ाना।</li>
    <li><b>लाइन 11:</b> परिणाम काउंट लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504ec05bf5f0580b8023",
    title: "Happy number Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Cycle Detection with Set</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Repeatedly calculate sum of squares of digits. To detect loops, record visited values in a set. If we see a value again, we are in a cycle (return False). If value becomes 1, return True.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(log N) | 🧠 Space: O(log N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            n = sum(int(digit) ** 2 for digit in str(n))
        return n == 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (n = 19)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - n = 19 -> not in seen. seen = {19}. n = 1² + 9² = 82.<br/>
    - n = 82 -> not in seen. seen = {19, 82}. n = 8² + 2² = 68.<br/>
    - n = 68 -> not in seen. seen = {19, 82, 68}. n = 6² + 8² = 100.<br/>
    - n = 100 -> not in seen. seen = {19, 82, 68, 100}. n = 1² + 0² + 0² = 1.<br/>
    - Loop ends. n = 1. Returns True. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and isHappy function declaration.</li>
    <li><b>Line 3:</b> Initialize set to track numbers we have visited.</li>
    <li><b>Line 4:</b> Loop while n is not 1 and hasn't looped back to a visited value.</li>
    <li><b>Line 5:</b> Add number to set.</li>
    <li><b>Line 6:</b> Square digits of n and assign sum to n.</li>
    <li><b>Line 7:</b> Return check if n reached 1.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 सेट द्वारा लूप डिटेक्शन (Cycle Detection)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अंकों के वर्गों के योग की गणना बार-बार करें। लूप का पता लगाने के लिए विज़िट किए गए मानों को हैश सेट में जोड़ें। यदि अंक रिपीट हो तो वह हैप्पी नंबर नहीं है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(log N) | 🧠 स्थान: O(log N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            n = sum(int(digit) ** 2 for digit in str(n))
        return n == 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (n = 19)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - n = 19 -> seen = {19}। n = 1 + 81 = 82।<br/>
    - n = 82 -> seen = {19, 82}। n = 64 + 4 = 68।<br/>
    - n = 68 -> seen = {19, 82, 68}। n = 36 + 64 = 100।<br/>
    - n = 100 -> seen = {19, 82, 68, 100}। n = 1।<br/>
    - लूप समाप्त। परिणाम True।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> विज़िट किए गए नंबरों को ट्रैक करने के लिए हैश सेट बनाना।</li>
    <li><b>लाइन 4:</b> लूप चलाना जब तक मान 1 न हो या दोबारा रिपीट न हो।</li>
    <li><b>लाइन 5:</b> संख्या को सेट में जोड़ना।</li>
    <li><b>लाइन 6:</b> संख्या को स्ट्रिंग में बदलकर उसके अंकों के वर्गों के योग की गणना करना।</li>
    <li><b>लाइन 7:</b> मान 1 होने पर True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504ec05bf5f0580b8025",
    title: "Isomorphic strings Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Bi-directional Character Mapping</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain two dictionaries. If a mapping exists from s to t but conflicts with current character, or map from t to s conflicts, return False. Otherwise record mappings.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1) (limited by unique alphabet characters)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        map_s, map_t = {}, {}
        for char_s, char_t in zip(s, t):
            if char_s in map_s and map_s[char_s] != char_t:
                return False
            if char_t in map_t and map_t[char_t] != char_s:
                return False
            map_s[char_s] = char_t
            map_t[char_t] = char_s
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "egg", t = "add")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Loop 1: char_s='e', char_t='a'. Map s={'e': 'a'}, t={'a': 'e'}.<br/>
    - Loop 2: char_s='g', char_t='d'. Map s={'e': 'a', 'g': 'd'}, t={'a': 'e', 'd': 'g'}.<br/>
    - Loop 3: char_s='g', char_t='d'. char_s in map_s ('g' in map) and map_s['g'] == 'd'. Same for map_t['d']. Valid.<br/>
    - Returns True. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and isomorphic checks method parameters.</li>
    <li><b>Line 3:</b> Set two map helpers maps.</li>
    <li><b>Line 4:</b> Zip strings and loop character pairs.</li>
    <li><b>Line 5-8:</b> Check map constraints. If mapping differs from previously stored values, return False.</li>
    <li><b>Line 9-10:</b> Update mapping keys on both directions.</li>
    <li><b>Line 11:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 द्वि-दिशात्मक कैरेक्टर मैपिंग (Bi-directional Mapping)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दो डिक्शनरी बनाए रखें। यदि s से t या t से s के चरित्र में कोई मैपिंग विवाद है, तो False लौटाएं। अन्यथा मैपिंग दर्ज करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        map_s, map_t = {}, {}
        for char_s, char_t in zip(s, t):
            if char_s in map_s and map_s[char_s] != char_t:
                return False
            if char_t in map_t and map_t[char_t] != char_s:
                return False
            map_s[char_s] = char_t
            map_t[char_t] = char_s
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "egg", t = "add")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Loop 1: char_s='e', char_t='a' -> s={'e': 'a'}, t={'a': 'e'}।<br/>
    - Loop 2: char_s='g', char_t='d' -> s={'e': 'a', 'g': 'd'}, t={'a': 'e', 'd': 'g'}।<br/>
    - Loop 3: char_s='g', char_t='d' -> s['g'] == 'd' और t['d'] == 'g' (मैच हुआ)।<br/>
    - परिणाम True।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> दोनों दिशाओं की मैपिंग डिक्शनरी घोषित करना।</li>
    <li><b>लाइन 4:</b> zip का उपयोग कर दोनों स्ट्रिंग्स के अक्षरों को जोड़कर लूप चलाना।</li>
    <li><b>लाइन 5-8:</b> यदि s का अक्षर t के पुराने अक्षर से मेल नहीं खाता, या विपरीत संबंध विवादित है, तो False लौटाना।</li>
    <li><b>लाइन 9-10:</b> एक-दूसरे की आवृत्ति मान दर्ज करना।</li>
    <li><b>लाइन 11:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504fc05bf5f0580b8027",
    title: "Find duplicate Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Sorting Array</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Sort elements, scan for duplicate values at index i and i-1. Modifies the array structure.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N log N) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Hash Set existence checks)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use a hash set to store elements we encounter. For each number, check if it's already in the set. If yes, it is the duplicate.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        seen = set()
        for num in nums:
            if num in seen:
                return num
            seen.add(num)
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 3, 4, 2, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - num = 1 -> not in seen. seen = {1}.<br/>
    - num = 3 -> not in seen. seen = {1, 3}.<br/>
    - num = 4 -> not in seen. seen = {1, 3, 4}.<br/>
    - num = 2 -> not in seen. seen = {1, 3, 4, 2}.<br/>
    - num = 2 -> present in seen! Returns 2. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and findDuplicate function signature.</li>
    <li><b>Line 3:</b> Initialize set seen.</li>
    <li><b>Line 4:</b> Iterate through numbers.</li>
    <li><b>Line 5-6:</b> If current value is in set, return value.</li>
    <li><b>Line 7:</b> Add value to set.</li>
    <li><b>Line 8:</b> Return fallback -1.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 सॉर्टिंग दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">एरे को सॉर्ट करें और लगातार दो समान इंडेक्स मानों की जांच करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N log N) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Hash Set check)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">विज़िट किए गए नंबरों को ट्रैक करने के लिए एक हैश सेट बनाएं। यदि कोई संख्या सेट में पहले से मौजूद है, तो वह डुप्लिकेट है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        seen = set()
        for num in nums:
            if num in seen:
                return num
            seen.add(num)
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 3, 4, 2, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - num = 1 -> seen = {1}।<br/>
    - num = 3 -> seen = {1, 3}।<br/>
    - num = 4 -> seen = {1, 3, 4}।<br/>
    - num = 2 -> seen = {1, 3, 4, 2}।<br/>
    - num = 2 -> seen में पहले से है! परिणाम 2 लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> हैश सेट (seen) बनाना।</li>
    <li><b>लाइन 4:</b> एरे के तत्वों पर लूप चलाना।</li>
    <li><b>लाइन 5-6:</b> यदि संख्या सेट में पहले से देखी जा चुकी है, तो उसे लौटाना।</li>
    <li><b>लाइन 7:</b> संख्या को सेट में जोड़ना।</li>
    <li><b>लाइन 8:</b> डिफ़ॉल्ट रिटर्न -1।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504fc05bf5f0580b8029",
    title: "Majority element Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Quadratic Counts</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">For each element, loop again and count occurrences. Inefficient.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N²) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Hash Map frequency tracker)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Map values to counts. Check if count exceeds <code>len(nums) // 2</code> during iteration. Return early if threshold satisfied.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count = {}
        threshold = len(nums) // 2
        for num in nums:
            count[num] = count.get(num, 0) + 1
            if count[num] > threshold:
                return num
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [3, 2, 3])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - threshold = 3 // 2 = 1.<br/>
    - num = 3 -> count = {3: 1}. count[3] not > 1.<br/>
    - num = 2 -> count = {3: 1, 2: 1}. count[2] not > 1.<br/>
    - num = 3 -> count = {3: 2}. count[3] = 2 > 1. Returns 3. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and majorityElement method signature.</li>
    <li><b>Line 3-4:</b> Track counts map, threshold value = size / 2.</li>
    <li><b>Line 5:</b> Loop values.</li>
    <li><b>Line 6-7:</b> Increment frequency. If frequency exceeds majority threshold, return number.</li>
    <li><b>Line 8:</b> Return fallback -1.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 ब्रूट फ़ोर्स दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक संख्या के लिए फिर से लूप चलाएं और उसकी उपस्थिति गिनें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N²) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Hash Map frequency tracker)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">संख्याओं की आवृत्तियों को मैप में सहेजें। लूप में यदि आवृत्ति <code>len(nums) // 2</code> से अधिक हो, तो सीधे वह संख्या लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count = {}
        threshold = len(nums) // 2
        for num in nums:
            count[num] = count.get(num, 0) + 1
            if count[num] > threshold:
                return num
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [3, 2, 3])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सीमा (threshold) = 3 // 2 = 1।<br/>
    - num = 3 -> count = {3: 1}।<br/>
    - num = 2 -> count = {3: 1, 2: 1}।<br/>
    - num = 3 -> count = {3: 2}। (2 > 1) -> 3 लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> आवृत्ति काउंटर और बहुमत सीमा (len/2) घोषित करना।</li>
    <li><b>लाइन 5:</b> एरे के तत्वों पर लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> डिक्शनरी में अंक की आवृत्ति जोड़ना। यदि आवृत्ति सीमा से अधिक है, तो उसे लौटाना।</li>
    <li><b>लाइन 8:</b> डिफ़ॉल्ट रिटर्न -1।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504fc05bf5f0580b802b",
    title: "Contains duplicate II Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Last Seen Map Distance Rule</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain a map mapping values to their last seen indices. Iterate the array. If the current number is already in the map and the distance <code>current_index - last_seen_index <= K</code>, return True. Otherwise update its last seen index in the map.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        seen = {}
        for i, num in enumerate(nums):
            if num in seen and i - seen[num] <= k:
                return True
            seen[num] = i
        return False</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 2, 3, 1], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 (1) -> not in seen. map = {1: 0}.<br/>
    - i = 1 (2) -> not in seen. map = {1: 0, 2: 1}.<br/>
    - i = 2 (3) -> not in seen. map = {1: 0, 2: 1, 3: 2}.<br/>
    - i = 3 (1) -> 1 is in seen, index diff = 3 - 0 = 3 <= k(3). Returns True. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and containsNearbyDuplicate method parameter signature.</li>
    <li><b>Line 3:</b> Initialize seen map mapping values to index.</li>
    <li><b>Line 4:</b> Iterate index and elements.</li>
    <li><b>Line 5-6:</b> If current element has been seen previously and index distance <= k, return True.</li>
    <li><b>Line 7:</b> Save/update number's last index.</li>
    <li><b>Line 8:</b> Return false if loop finishes without matches.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 अंतिम देखा गया इंडेक्स नियम (Last Seen Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">एक हैश मैप में अंकों के अंतिम देखे गए इंडेक्स को सहेजें। यदि संख्या पहले आ चुकी है और वर्तमान इंडेक्स तथा पुराने इंडेक्स का अंतर <= K है, तो True लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        seen = {}
        for i, num in enumerate(nums):
            if num in seen and i - seen[num] <= k:
                return True
            seen[num] = i
        return False</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 2, 3, 1], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 (1) -> seen = {1: 0}।<br/>
    - i = 1 (2) -> seen = {1: 0, 2: 1}।<br/>
    - i = 2 (3) -> seen = {1: 0, 2: 1, 3: 2}।<br/>
    - i = 3 (1) -> 1 पहले से देखा जा चुका है, दूरी = 3 - 0 = 3 <= k(3)। परिणाम True।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> अंतिम देखे गए स्थान का मैप (seen) बनाना।</li>
    <li><b>लाइन 4:</b> इंडेक्स और अंक पर लूप चलाना।</li>
    <li><b>लाइन 5-6:</b> यदि अंक पहले मैप में आ चुका है और दोनों के इंडेक्स का अंतर <code>k</code> के बराबर या कम है, तो True लौटाना।</li>
    <li><b>लाइन 7:</b> अंक का वर्तमान स्थान अपडेट करना।</li>
    <li><b>लाइन 8:</b> परिणाम False लौटाना।</li>
  </ul>
</div>`
  }
];

// ----------------------------------------------------
// 3. Database Seeding Execution
// ----------------------------------------------------
async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("Connected successfully.");

    const Note = mongoose.connection.collection('notes');

    // Clean up any old seeded notes to avoid duplication
    const parentId = new mongoose.Types.ObjectId(parentTaskId);
    const childIds = rawNotes.map(raw => new mongoose.Types.ObjectId(raw.taskId));
    const allIds = [parentId, ...childIds];
    
    console.log("Cleaning up old seeded hashing notes...");
    await Note.deleteMany({ taskId: { $in: allIds } });

    // Prepare all notes with timestamps and userId
    const now = new Date();
    const userId = new mongoose.Types.ObjectId('6993047f16e85ff3e4efd9a3');
    const notesToInsert = [
      {
        ...parentBlueprintNote,
        userId: userId,
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const raw of rawNotes) {
      const note = {
        taskId: new mongoose.Types.ObjectId(raw.taskId),
        userId: userId,
        title: raw.title,
        color: raw.color,
        isPinned: false,
        content: compressHtml(generateBilingualNote(raw.taskId, raw.en, raw.hi)),
        tags: ["Hashing", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed hashing notes...`);
    const result = await Note.insertMany(notesToInsert);
    console.log(`Successfully inserted ${result.insertedCount} detailed notes.`);

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

seed();
