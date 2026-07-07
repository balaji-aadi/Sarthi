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
const parentTaskId = "69e75052c05bf5f0580b8085";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #0369a1; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #bae6fd; padding-bottom: 6px; margin-top: 0;">📐 Monotonic Stack Identification Blueprint</h3>
  
  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0369a1; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Monotonic Stack Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.5;">
      Use a Monotonic Stack when you need to search for the nearest smaller or larger element relative to current elements in linear O(N) time. The stack elements are sorted: strictly increasing to find smaller bounds, or strictly decreasing to find larger bounds.
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Algorithm Templates</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Problem Class</th>
          <th style="padding: 6px 4px; font-weight: 700;">Stack Condition / Mechanism</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Next / Prev Greater</td>
          <td style="padding: 6px 4px;">Monotonic decreasing stack. Pop top while <code>x > stack[-1]</code>.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Next / Prev Smaller</td>
          <td style="padding: 6px 4px;">Monotonic increasing stack. Pop top while <code>x < stack[-1]</code>.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Largest Histogram Area</td>
          <td style="padding: 6px 4px;">Monotonic increasing stack of indices. Calculate area on pop boundaries.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Trapping Rain Water</td>
          <td style="padding: 6px 4px;">Monotonic decreasing stack. Trapped water is bounded by stack bounds.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #0369a1; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #bae6fd; padding-bottom: 6px; margin-top: 0;">📐 मोनोटोनिक स्टैक (Monotonic Stack) पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0369a1; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 मोनोटोनिक स्टैक समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.5;">
      जब आपको रैखिक O(N) समय में किसी तत्व के निकटतम छोटे या बड़े तत्व को खोजने की आवश्यकता हो, तो मोनोटोनिक स्टैक का उपयोग करें।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य श्रेणियां</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">समस्या श्रेणी</th>
          <th style="padding: 6px 4px; font-weight: 700;">स्टैक स्थिति / प्रक्रिया</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">अगला / पिछला बड़ा तत्व</td>
          <td style="padding: 6px 4px;">मोनोटोनिक घटता स्टैक। जब तक <code>x > stack[-1]</code> हो, पॉप करें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">अगला / पिछला छोटा तत्व</td>
          <td style="padding: 6px 4px;">मोनोटोनिक बढ़ता स्टैक। जब तक <code>x < stack[-1]</code> हो, पॉप करें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">हिस्टोग्राम में अधिकतम क्षेत्रफल</td>
          <td style="padding: 6px 4px;">इंडेक्सों का बढ़ता स्टैक। पॉप सीमाओं पर क्षेत्रफल मापें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">ट्रैपिंग रेन वॉटर</td>
          <td style="padding: 6px 4px;">घटता स्टैक। संचित पानी की मात्रा स्टैक सीमाओं द्वारा मापी जाती है।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Monotonic Stack Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Monotonic-Stack", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e75052c05bf5f0580b8087",
    title: "Next greater element i Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Nested Quadratic Searches</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">For each element, search forward in nums2 to locate next greater value. Extremely slow.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N1 * N2) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Monotonic Decreasing Stack on nums2)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Traverse nums2. While stack is not empty and current element > top of stack, pop from stack and map popped element's next greater to current value. Push current value. Construct result from map.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N1 + N2) | 🧠 Space: O(N2)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        stack = []
        mapping = {}
        for x in nums2:
            while stack and x > stack[-1]:
                mapping[stack.pop()] = x
            stack.append(x)
        return [mapping.get(x, -1) for x in nums1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - x = 1 -> stack = [1].<br/>
    - x = 3 -> 3 > 1 -> mapping[1] = 3. stack = [3].<br/>
    - x = 4 -> 4 > 3 -> mapping[3] = 4. stack = [4].<br/>
    - x = 2 -> 2 <= 4 -> stack = [4, 2].<br/>
    -construct output from mapping for nums1: mapping[4]=-1, mapping[1]=3, mapping[2]=-1. Returns [-1, 3, -1].
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and nextGreaterElement method signature.</li>
    <li><b>Line 3-4:</b> Initialize empty stack and mapping dictionary.</li>
    <li><b>Line 5:</b> Loop through nums2 array elements.</li>
    <li><b>Line 6-7:</b> While stack has items and current value is greater than top of stack, pop from stack and map popped value next greater to current value.</li>
    <li><b>Line 8:</b> Push current value to stack.</li>
    <li><b>Line 9:</b> Construct and return answers array from mapping.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 नेस्टेड लूप से रैखिक खोज</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक तत्व के लिए, nums2 में आगे जाकर बड़ा मान ढूंढना। अत्यंत धीमा।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N1 * N2) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (घटता हुआ मोनोटोनिक स्टैक)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">nums2 पर लूप चलाएं। यदि वर्तमान तत्व स्टैक के शीर्ष (top) से बड़ा है, तो स्टैक से पॉप करें और मैपिंग सहेजें। अंत में nums1 के लिए उत्तर बनाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N1 + N2) | 🧠 स्थान: O(N2)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        stack = []
        mapping = {}
        for x in nums2:
            while stack and x > stack[-1]:
                mapping[stack.pop()] = x
            stack.append(x)
        return [mapping.get(x, -1) for x in nums1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - x = 1 -> stack = [1]।<br/>
    - x = 3 -> 3 > 1 -> mapping[1] = 3 | stack = [3]।<br/>
    - x = 4 -> 4 > 3 -> mapping[3] = 4 | stack = [4]।<br/>
    - परिणाम: mapping[4]=-1, mapping[1]=3, mapping[2]=-1 -> [-1, 3, -1]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> खाली स्टैक और मैपिंग डिक्शनरी इनिशियलाइज़ करना।</li>
    <li><b>लाइन 5:</b> nums2 एरे के तत्वों पर लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> जब तक स्टैक खाली न हो और वर्तमान तत्व शीर्ष से बड़ा हो, पॉप करें और उसे मैपिंग में सहेजें।</li>
    <li><b>लाइन 8:</b> वर्तमान तत्व को स्टैक में धकेलना।</li>
    <li><b>लाइन 9:</b> मैपिंग का उपयोग करके nums1 के तत्वों के लिए परिणाम सूची बनाकर लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b8089",
    title: "Daily temperatures Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Monotonic Index Stack for Warmth Offset</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain a monotonic decreasing stack storing indices. When current temp is warmer than index temp at stack top, pop index and write distance offset to answers array: <code>i - popped_idx</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        ans = [0] * n
        stack = []
        for i, temp in enumerate(temperatures):
            while stack and temp > temperatures[stack[-1]]:
                prev_idx = stack.pop()
                ans[prev_idx] = i - prev_idx
            stack.append(i)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (temperatures = [73, 74, 75, 71, 69, 72, 76, 73])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 (73) -> stack = [0].<br/>
    - i = 1 (74) -> 74 > 73. pop 0. ans[0] = 1. stack = [1].<br/>
    - i = 2 (75) -> 75 > 74. pop 1. ans[1] = 1. stack = [2].<br/>
    - i = 3 (71), i = 4 (69) -> stack = [2, 3, 4].<br/>
    - i = 5 (72) -> 72 > 69. pop 4, ans[4] = 1. 72 > 71. pop 3, ans[3] = 2. stack = [2, 5].<br/>
    - Loops finish to populate remaining offsets. Returns [1, 1, 4, 2, 1, 1, 0, 0].
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and dailyTemperatures method declaration.</li>
    <li><b>Line 3-5:</b> Setup size, output answer list, and empty index stack.</li>
    <li><b>Line 6:</b> Loop temperatures with index and value using enumerate.</li>
    <li><b>Line 7-9:</b> While stack is not empty and current temperature is greater than top of stack temperature, pop index and save distance offset.</li>
    <li><b>Line 10:</b> Push current index.</li>
    <li><b>Line 11:</b> Return answers list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 इंडेक्स के मोनोटोनिक स्टैक नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्सों को सहेजने वाला एक घटता हुआ मोनोटोनिक स्टैक बनाए रखें। जब वर्तमान तापमान स्टैक के इंडेक्स के तापमान से अधिक गर्म हो, तो इंडेक्स पॉप करें और अंतर <code>i - popped_idx</code> उत्तर में दर्ज करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        ans = [0] * n
        stack = []
        for i, temp in enumerate(temperatures):
            while stack and temp > temperatures[stack[-1]]:
                prev_idx = stack.pop()
                ans[prev_idx] = i - prev_idx
            stack.append(i)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (temperatures = [73, 74, 75, 71, 69, 72, 76, 73])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 (73) -> stack = [0]।<br/>
    - i = 1 (74) -> 74 > 73 -> पॉप index 0 | ans[0] = 1 | stack = [1]।<br/>
    - i = 2 (75) -> 75 > 74 -> पॉप index 1 | ans[1] = 1 | stack = [2]।<br/>
    - i = 5 (72) -> stack = [2, 3, 4] से 4 और 3 पॉप करेगा | ans[4] = 1, ans[3] = 2 | stack = [2, 5]।<br/>
    - परिणाम: [1, 1, 4, 2, 1, 1, 0, 0]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> लंबाई, उत्तर सूची (ans) और खाली स्टैक (stack) घोषित करना।</li>
    <li><b>लाइन 6:</b> इंडेक्स और वैल्यू के साथ तापमानों पर लूप चलाना।</li>
    <li><b>लाइन 7-9:</b> जब तक स्टैक में इंडेक्स हैं और आज का तापमान अधिक गर्म है, पॉप करें और दिनों का अंतर दर्ज करें।</li>
    <li><b>लाइन 10:</b> वर्तमान इंडेक्स को स्टैक में जोड़ना।</li>
    <li><b>लाइन 11:</b> परिणाम सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b808b",
    title: "Stock span Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Pairs of Price & Span)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Monotonic decreasing stack storing <code>(price, span)</code>. When next price is queried, sum spans of all popped elements whose prices are <= current price.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(1) amortized per call | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class StockSpanner:
    def __init__(self):
        self.stack = []

    def next(self, price: int) -> int:
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Constructor initializes empty stack list.</li>
    <li><b>Line 5-6:</b> Span value starts at 1 for current price day.</li>
    <li><b>Line 7-8:</b> Pop all stack elements whose price coordinates are smaller than or equal to current price, accumulating their spans.</li>
    <li><b>Line 9:</b> Push current price and span pair.</li>
    <li><b>Line 10:</b> Return span.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (मूल्य और स्पैन के जोड़े)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;"><code>(price, span)</code> को सहेजने वाला मोनोटोनिक घटता स्टैक। जब अगला मूल्य पूछा जाए, तो उन सभी पॉप किए गए तत्वों के स्पैन का योग करें जिनका मूल्य वर्तमान से कम या बराबर है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(1) औसतन | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class StockSpanner:
    def __init__(self):
        self.stack = []

    def next(self, price: int) -> int:
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> कंस्ट्रक्टर घोषणा, खाली स्टैक सूची बनाना।</li>
    <li><b>लाइन 5-6:</b> स्पैन काउंट को 1 से शुरू करना।</li>
    <li><b>लाइन 7-8:</b> जब तक स्टैक खाली न हो और शीर्ष मूल्य आज के मूल्य से छोटा या बराबर हो, पॉप करें और उसके स्पैन को जोड़ें।</li>
    <li><b>लाइन 9:</b> वर्तमान मूल्य और संचित स्पैन को स्टैक में जोड़ना।</li>
    <li><b>लाइन 10:</b> कुल स्पैन लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b808d",
    title: "Largest rectangle in histogram Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Monotonic Increasing Index Stack with Zero Flush</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain a monotonic increasing stack storing indices. When current bar is shorter than top of stack, pop index. Popped index is the height limit. Width is current index if stack is empty, else index difference offset <code>i - stack[-1] - 1</code>. Append 0 to end of array to automatically flush stack.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []
        max_area = 0
        heights.append(0)
        for i, h in enumerate(heights):
            while stack and h < heights[stack[-1]]:
                height = heights[stack.pop()]
                width = i if not stack else i - stack[-1] - 1
                max_area = max(max_area, height * width)
            stack.append(i)
        heights.pop()
        return max_area</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (heights = [2, 1, 5, 6, 2, 3])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - heights becomes [2, 1, 5, 6, 2, 3, 0].<br/>
    - i = 0 (2) -> stack = [0].<br/>
    - i = 1 (1) -> 1 < 2 -> pop 0. height = 2, width = 1 -> area = 2. stack = [1].<br/>
    - i = 2 (5), i = 3 (6) -> stack = [1, 2, 3].<br/>
    - i = 4 (2) -> 2 < 6 -> pop 3. height = 6, width = 4 - 2 - 1 = 1 -> area = 6. stack = [1, 2].<br/>
    &nbsp;&nbsp;• 2 < 5 -> pop 2. height = 5, width = 4 - 1 - 1 = 2 -> area = 10. stack = [1].<br/>
    - Returns max area 10. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and largestRectangleArea method signature.</li>
    <li><b>Line 3-5:</b> Setup empty stack, max area, and append 0 boundary value to array.</li>
    <li><b>Line 6:</b> Loop heights list indices and values.</li>
    <li><b>Line 7:</b> While stack has indices and current height is smaller than top of stack height.</li>
    <li><b>Line 8:</b> Pop index to fetch height.</li>
    <li><b>Line 9-10:</b> Calculate width boundary offset. Maximize max area.</li>
    <li><b>Line 11:</b> Push current index to stack.</li>
    <li><b>Line 12-13:</b> Restore heights array and return max area.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 मोनोटोनिक बढ़ता हुआ स्टैक और फ्लश नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्सों को सहेजने वाला बढ़ता हुआ मोनोटोनिक स्टैक। जब वर्तमान बार छोटा हो, तो पॉप करें। पॉप किया गया इंडेक्स ऊंचाई है, और चौड़ाई <code>i - stack[-1] - 1</code> है। एरे के अंत में 0 जोड़ें ताकि स्टैक के बचे तत्व अंत में हल हो सकें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []
        max_area = 0
        heights.append(0)
        for i, h in enumerate(heights):
            while stack and h < heights[stack[-1]]:
                height = heights[stack.pop()]
                width = i if not stack else i - stack[-1] - 1
                max_area = max(max_area, height * width)
            stack.append(i)
        heights.pop()
        return max_area</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (heights = [2, 1, 5, 6, 2, 3])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - एरे [2, 1, 5, 6, 2, 3, 0] बनता है।<br/>
    - i = 0 (2) -> stack = [0]।<br/>
    - i = 1 (1) -> 1 < 2 -> पॉप 0 | height = 2, width = 1 -> area = 2 | stack = [1]।<br/>
    - i = 4 (2) -> 2 < 6 -> पॉप 3 | height = 6, width = 1 -> area = 6 | stack = [1, 2]।<br/>
    &nbsp;&nbsp;• 2 < 5 -> पॉप 2 | height = 5, width = 2 -> area = 10 | stack = [1]।<br/>
    - अधिकतम क्षेत्रफल 10 मिलता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> खाली स्टैक, अधिकतम क्षेत्रफल और अंत में 0 जोड़ना।</li>
    <li><b>लाइन 6:</b> इंडेक्स और मानों पर लूप चलाना।</li>
    <li><b>लाइन 7:</b> जब तक वर्तमान बार छोटा हो, लूप चलाकर स्टैक से मान पॉप करना।</li>
    <li><b>लाइन 8:</b> पॉप करके बार की ऊंचाई (height) ज्ञात करना।</li>
    <li><b>लाइन 9-10:</b> चौड़ाई (width) मापना और क्षेत्रफल को अधिकतम से अपडेट करना।</li>
    <li><b>लाइन 11:</b> वर्तमान इंडेक्स को स्टैक में धकेलना।</li>
    <li><b>लाइन 12-13:</b> एरे को मूल रूप में लाना और अधिकतम मान लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b808f",
    title: "Maximal rectangle Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Row Compression to 1D Histogram</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Convert 2D matrix to 1D largest rectangle in histogram problem. Track 1D <code>heights</code> array. Iterate rows: if matrix cell is '1', increment column height. If '0', reset column height to 0. Run largest histogram area code on heights array for each row.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(Rows * Cols) | 🧠 Space: O(Cols)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        if not matrix or not matrix[0]:
            return 0
        cols = len(matrix[0])
        heights = [0] * (cols + 1)
        max_area = 0
        for row in matrix:
            for c in range(cols):
                heights[c] = heights[c] + 1 if row[c] == '1' else 0
                
            stack = []
            for i, h in enumerate(heights):
                while stack and h < heights[stack[-1]]:
                    height = heights[stack.pop()]
                    width = i if not stack else i - stack[-1] - 1
                    max_area = max(max_area, height * width)
                stack.append(i)
        return max_area</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maximalRectangle method parameters.</li>
    <li><b>Line 3-6:</b> Validate matrix inputs, set cols, heights array of size cols+1, and max area.</li>
    <li><b>Line 7-8:</b> Loop row by row.</li>
    <li><b>Line 9-10:</b> For each column, if matrix character is '1', increment height. Otherwise, reset to 0.</li>
    <li><b>Line 12-18:</b> Standard monotonic stack to evaluate largest rectangle area over row heights.</li>
    <li><b>Line 19:</b> Return max area.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 पंक्ति संपीड़न नियम (Row Compression)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">2D बाइनरी मैट्रिक्स को 1D हिस्टोग्राम समस्या में बदलें। <code>heights</code> एरे बनाए रखें। रोवार लूप चलाएं: यदि सेल '1' है, तो कॉलम ऊंचाई 1 बढ़ाएं, यदि '0' है तो 0 पर रीसेट करें। फिर हिस्टोग्राम कोड चलाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(Rows * Cols) | 🧠 स्थान: O(Cols)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        if not matrix or not matrix[0]:
            return 0
        cols = len(matrix[0])
        heights = [0] * (cols + 1)
        max_area = 0
        for row in matrix:
            for c in range(cols):
                heights[c] = heights[c] + 1 if row[c] == '1' else 0
                
            stack = []
            for i, h in enumerate(heights):
                while stack and h < heights[stack[-1]]:
                    height = heights[stack.pop()]
                    width = i if not stack else i - stack[-1] - 1
                    max_area = max(max_area, height * width)
                stack.append(i)
        return max_area</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-6:</b> इनपुट का सत्यापन, चौड़ाई के अनुसार heights (cols+1) एरे और अधिकतम क्षेत्र वेरिएबल बनाना।</li>
    <li><b>लाइन 7-8:</b> मैट्रिक्स की पंक्तियों पर लूप चलाना।</li>
    <li><b>लाइन 9-10:</b> प्रत्येक पंक्ति में यदि मान '1' है तो एरे ऊंचाई 1 बढ़ाना, नहीं तो 0 करना।</li>
    <li><b>लाइन 12-18:</b> एरे ऊंचाई पर कडाने/हिस्टोग्राम तर्क का उपयोग करके अधिकतम आयत क्षेत्रफल मापना।</li>
    <li><b>लाइन 19:</b> अधिकतम क्षेत्रफल परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75053c05bf5f0580b8091",
    title: "Next smaller element Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Monotonic Increasing Stack)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain a monotonic increasing stack. Pop elements from stack that are greater than or equal to current element. If stack is empty, nearest smaller is -1. Otherwise, it is the top of the stack.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def prevSmallerElement(self, nums: List[int]) -> List[int]:
        stack = []
        ans = []
        for x in nums:
            while stack and stack[-1] >= x:
                stack.pop()
            if not stack:
                ans.append(-1)
            else:
                ans.append(stack[-1])
            stack.append(x)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and prevSmallerElement method parameters signature.</li>
    <li><b>Line 3-4:</b> Initialize stack and answers array lists.</li>
    <li><b>Line 5:</b> Loop through element values.</li>
    <li><b>Line 6-7:</b> While stack has elements and top of stack is greater than or equal to current element, pop from stack.</li>
    <li><b>Line 8-11:</b> If stack is empty, append -1, else append top of stack.</li>
    <li><b>Line 12:</b> Push current element.</li>
    <li><b>Line 13:</b> Return answers list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (बढ़ता हुआ मोनोटोनिक स्टैक)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">बढ़ता हुआ मोनोटोनिक स्टैक। जब तक स्टैक का शीर्ष मान वर्तमान मान से बड़ा या बराबर है, पॉप करें। यदि स्टैक खाली है, तो निकटतम छोटा मान -1 है, अन्यथा शीर्ष मान है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def prevSmallerElement(self, nums: List[int]) -> List[int]:
        stack = []
        ans = []
        for x in nums:
            while stack and stack[-1] >= x:
                stack.pop()
            if not stack:
                ans.append(-1)
            else:
                ans.append(stack[-1])
            stack.append(x)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> खाली स्टैक (stack) और परिणाम सूची (ans) घोषित करना।</li>
    <li><b>लाइन 5:</b> तत्वों पर लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> जब तक शीर्ष तत्व वर्तमान से बड़ा या बराबर है, पॉप करना।</li>
    <li><b>लाइन 8-11:</b> यदि स्टैक खाली हो जाता है तो -1 जोड़ना, अन्यथा स्टैक का शीर्ष मान जोड़ना।</li>
    <li><b>लाइन 12:</b> वर्तमान मान को स्टैक में जोड़ना।</li>
    <li><b>लाइन 13:</b> परिणामी सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75053c05bf5f0580b8093",
    title: "Sum of subarray minimums Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Find Previous and Next Smaller Indexes</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">For each element at <code>i</code>, find the previous smaller index <code>left[i]</code> and next smaller index <code>right[i]</code>. The count of subarrays where <code>arr[i]</code> is the minimum is <code>(i - left[i]) * (right[i] - i)</code>. Add <code>arr[i] * count</code> modulo 10^9+7.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        MOD = 10**9 + 7
        n = len(arr)
        left = [-1] * n
        right = [n] * n
        
        stack = []
        for i in range(n):
            while stack and arr[stack[-1]] >= arr[i]:
                stack.pop()
            if stack:
                left[i] = stack[-1]
            stack.append(i)
            
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and arr[stack[-1]] > arr[i]:
                stack.pop()
            if stack:
                right[i] = stack[-1]
            stack.append(i)
            
        ans = 0
        for i in range(n):
            ans = (ans + arr[i] * (i - left[i]) * (right[i] - i)) % MOD
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class definition, MOD constant setup.</li>
    <li><b>Line 4-7:</b> Initialize boundary lists.</li>
    <li><b>Line 9-16:</b> Loop forward using monotonic stack to find previous smaller element index (left boundary).</li>
    <li><b>Line 18-24:</b> Loop backward to find next smaller element index (right boundary).</li>
    <li><b>Line 26-28:</b> For each element, multiply its value by frequency of occurrences as subarray minimum and add to total sum modulo MOD.</li>
    <li><b>Line 29:</b> Return total sum.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 पिछला और अगला छोटा इंडेक्स ज्ञात करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक तत्व <code>i</code> के लिए, पिछला छोटा इंडेक्स <code>left[i]</code> और अगला छोटा इंडेक्स <code>right[i]</code> ज्ञात करें। ऐसे सबएरे की संख्या जहाँ <code>arr[i]</code> न्यूनतम है: <code>(i - left[i]) * (right[i] - i)</code> है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        MOD = 10**9 + 7
        n = len(arr)
        left = [-1] * n
        right = [n] * n
        
        stack = []
        for i in range(n):
            while stack and arr[stack[-1]] >= arr[i]:
                stack.pop()
            if stack:
                left[i] = stack[-1]
            stack.append(i)
            
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and arr[stack[-1]] > arr[i]:
                stack.pop()
            if stack:
                right[i] = stack[-1]
            stack.append(i)
            
        ans = 0
        for i in range(n):
            ans = (ans + arr[i] * (i - left[i]) * (right[i] - i)) % MOD
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> क्लास घोषणा, मोड नियतांक और लंबाई घोषित करना।</li>
    <li><b>लाइन 4-7:</b> सीमा एरे (left/right) का इनिशियलाइजेशन।</li>
    <li><b>लाइन 9-16:</b> मोनोटोनिक स्टैक से पिछले छोटे तत्वों के इंडेक्स (बाएं सीमा) खोजना।</li>
    <li><b>लाइन 18-24:</b> मोनोटोनिक स्टैक से अगले छोटे तत्वों के इंडेक्स (दाएं सीमा) खोजना।</li>
    <li><b>लाइन 26-28:</b> प्रत्येक तत्व के लिए, उसका मान और उसके सबएरे में न्यूनतम बनने की आवृत्ति गुणा करके उत्तर में संचित करना।</li>
    <li><b>लाइन 29:</b> परिणामी योग लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75053c05bf5f0580b8095",
    title: "Trapping rain water Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Monotonic Decreasing Stack for Water Gaps</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain a monotonic decreasing stack of indices. When current height is greater than height at stack top, pop. This represents the water bottom. The bounded height is <code>min(current_height, height[new_top]) - popped_height</code>. Width is <code>current_index - new_top - 1</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def trap(self, height: List[int]) -> int:
        stack = []
        water = 0
        for i in range(len(height)):
            while stack and height[i] > height[stack[-1]]:
                bottom = stack.pop()
                if not stack:
                    break
                width = i - stack[-1] - 1
                bounded_height = min(height[i], height[stack[-1]]) - height[bottom]
                water += width * bounded_height
            stack.append(i)
        return water</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-4:</b> Initialize empty stack and water counter.</li>
    <li><b>Line 5:</b> Loop through array indices.</li>
    <li><b>Line 6-7:</b> While stack has items and current height is greater than top of stack height, pop to get bottom height.</li>
    <li><b>Line 8-9:</b> If stack is empty (no left wall), break.</li>
    <li><b>Line 10-12:</b> Compute gap width and bounded height (min of left/right walls minus bottom), accumulate water.</li>
    <li><b>Line 13:</b> Push current index to stack.</li>
    <li><b>Line 14:</b> Return total water trapped.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 पानी के गैप के लिए मोनोटोनिक घटता स्टैक नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्सों का घटता मोनोटोनिक स्टैक। जब वर्तमान ऊंचाई शीर्ष ऊंचाई से बड़ी हो, तो पॉप करें (यह पानी के तल का प्रतिनिधित्व करता है)। सीमाबद्ध ऊंचाई <code>min(current_height, height[new_top]) - popped_height</code> है। चौड़ाई <code>current_index - new_top - 1</code> है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def trap(self, height: List[int]) -> int:
        stack = []
        water = 0
        for i in range(len(height)):
            while stack and height[i] > height[stack[-1]]:
                bottom = stack.pop()
                if not stack:
                    break
                width = i - stack[-1] - 1
                bounded_height = min(height[i], height[stack[-1]]) - height[bottom]
                water += width * bounded_height
            stack.append(i)
        return water</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> खाली स्टैक और संचित जल मात्रा वेरिएबल्स घोषित करना।</li>
    <li><b>लाइन 5:</b> ऊंचाई एरे के इंडेक्स पर लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> जब तक शीर्ष मान आज की ऊंचाई से छोटा है, पॉप करके तल की ऊंचाई (bottom) मापना।</li>
    <li><b>लाइन 8-9:</b> यदि स्टैक खाली हो जाता है (बाईं दीवार नहीं है), तो ब्रेक करना।</li>
    <li><b>लाइन 10-12:</b> चौड़ाई और सीमाबद्ध ऊंचाई मापना, और पानी जोड़ना।</li>
    <li><b>लाइन 13:</b> वर्तमान इंडेक्स को स्टैक में जोड़ना।</li>
    <li><b>लाइन 14:</b> कुल संचित पानी लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505cc05bf5f0580b8097",
    title: "Remove K digits Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Greedy Increasing Stack for Peak Digits</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use a monotonic increasing stack. Traverse digits: while stack has items, <code>k > 0</code>, and stack top > current digit, pop from stack and decrement <code>k</code>. Truncate remaining <code>k</code> digits from end, strip leading zeroes.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        stack = []
        for digit in num:
            while stack and k > 0 and stack[-1] > digit:
                stack.pop()
                k -= 1
            stack.append(digit)
            
        # If k is still > 0, remove from end
        if k > 0:
            stack = stack[:-k]
            
        ans = "".join(stack).lstrip(\'0\')
        return ans if ans else "0"</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (num = "1432219", k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - digit = 1 -> stack = [1].<br/>
    - digit = 4 -> stack = [1, 4].<br/>
    - digit = 3 -> 3 < 4, k=3 -> pop 4. k=2. stack = [1, 3].<br/>
    - digit = 2 -> 2 < 3, k=2 -> pop 3. k=1. stack = [1, 2].<br/>
    - digit = 2 -> stack = [1, 2, 2].<br/>
    - digit = 1 -> 1 < 2, k=1 -> pop 2. k=0. stack = [1, 2, 1].<br/>
    - digit = 9 -> stack = [1, 2, 1, 9].<br/>
    - Joins output to "1219". (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and removeKdigits parameters.</li>
    <li><b>Line 3-4:</b> Initialize stack, loop digits.</li>
    <li><b>Line 5-7:</b> While stack top is greater than current digit and k > 0, pop stack top. Decrement k.</li>
    <li><b>Line 8:</b> Push current digit.</li>
    <li><b>Line 11-12:</b> If k is still positive, slice off the last k elements from stack.</li>
    <li><b>Line 14-15:</b> Join stack characters, strip leading zeroes, and return (or return "0" if empty).</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 शीर्ष अंकों के लिए बढ़ते मोनोटोनिक स्टैक नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">बढ़ते मोनोटोनिक स्टैक का उपयोग करें। यदि वर्तमान अंक शीर्ष मान से छोटा है और <code>k > 0</code> है, तो पॉप करें और k घटाएं। अंत में बचे k अंकों को हटा दें और शुरुआत के 0 हटा दें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        stack = []
        for digit in num:
            while stack and k > 0 and stack[-1] > digit:
                stack.pop()
                k -= 1
            stack.append(digit)
            
        # If k is still > 0, remove from end
        if k > 0:
            stack = stack[:-k]
            
        ans = "".join(stack).lstrip(\'0\')
        return ans if ans else "0"</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (num = "1432219", k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - digit = 1 -> stack = [1]।<br/>
    - digit = 4 -> stack = [1, 4]।<br/>
    - digit = 3 -> 3 < 4 -> पॉप 4. k=2 | stack = [1, 3]।<br/>
    - digit = 2 -> 2 < 3 -> पॉप 3. k=1 | stack = [1, 2]।<br/>
    - digit = 1 -> 1 < 2 -> पॉप 2. k=0 | stack = [1, 2, 1]।<br/>
    - परिणाम: "1219"।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> खाली स्टैक बनाना, अंकों पर लूप चलाना।</li>
    <li><b>लाइन 5-7:</b> जब तक शीर्ष अंक वर्तमान से बड़ा है और k > 0 है, पॉप करें और k को 1 कम करें।</li>
    <li><b>लाइन 8:</b> वर्तमान अंक को स्टैक में धकेलना।</li>
    <li><b>लाइन 11-12:</b> यदि k अभी भी शून्य से बड़ा है, तो अंत से k तत्व हटाना।</li>
    <li><b>लाइन 14-15:</b> स्टैक को जोड़ना, आगे के शून्य हटाना, खाली होने पर "0" लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505ec05bf5f0580b8099",
    title: "Car fleet Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Sort by Start Position with Arrival Times Stack</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Sort cars by start position descending (closest to target first). Compute arrival time: <code>(target - position) / speed</code>. Maintain stack of fleet times: if current car arrival time is <= top of stack (arrives earlier/blocked by car in front), it joins front car's fleet. Stack size is final fleet count.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        cars = sorted(zip(position, speed), key=lambda x: x[0], reverse=True)
        stack = []
        for pos, spd in cars:
            time = (target - pos) / spd
            if not stack or time > stack[-1]:
                stack.append(time)
        return len(stack)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and carFleet method parameters.</li>
    <li><b>Line 3:</b> Zip positions and speeds, sort descending by position (closest car first).</li>
    <li><b>Line 4-5:</b> Stack initialization, loop sorted cars.</li>
    <li><b>Line 6:</b> Compute arrival time for current car.</li>
    <li><b>Line 7-8:</b> If stack is empty or current car takes longer than stack top car (not blocked, starts a new fleet), push arrival time to stack.</li>
    <li><b>Line 9:</b> Return stack size (total fleets count).</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 स्थिति से सॉर्ट और आगमन समय नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">कार्यों को शुरुआती स्थिति के अनुसार घटते क्रम में सॉर्ट करें (जो लक्ष्य के सबसे करीब है)। आगमन समय: <code>(target - position) / speed</code>। यदि वर्तमान कार का आगमन समय शीर्ष समय से कम या बराबर है, तो वह आगे वाली कार के बेड़े (fleet) में शामिल होगी।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        cars = sorted(zip(position, speed), key=lambda x: x[0], reverse=True)
        stack = []
        for pos, spd in cars:
            time = (target - pos) / spd
            if not stack or time > stack[-1]:
                stack.append(time)
        return len(stack)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> स्थिति और गति को मिलाकर स्थिति के अनुसार घटते क्रम (reverse=True) में सॉर्ट करना।</li>
    <li><b>लाइन 4-5:</b> खाली स्टैक घोषित करना, और कारों पर लूप चलाना।</li>
    <li><b>लाइन 6:</b> आज की कार का गंतव्य समय (time) मापना।</li>
    <li><b>लाइन 7-8:</b> यदि स्टैक खाली है या यह कार आगे वाली कार से धीमी है (नया बेड़ा शुरू करती है), तो समय को स्टैक में जोड़ना।</li>
    <li><b>लाइन 9:</b> स्टैक का आकार (कुल बेड़े संख्या) लौटाना।</li>
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
    
    console.log("Cleaning up old seeded Monotonic Stack notes...");
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
        tags: ["Monotonic-Stack", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed Monotonic Stack notes...`);
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
