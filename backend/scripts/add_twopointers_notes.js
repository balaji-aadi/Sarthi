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
const parentTaskId = "69e75046c05bf5f0580b8001";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 Two Pointers Identification Blueprint</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Two Pointers Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      Apply Two Pointers when the input is sorted (or can be sorted), and the problem requires searching for pairs, triplets, or elements satisfying sum bounds or constraints. Pointers can meet in the middle (left/right ends) or move in the same direction at different speeds.
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
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Meet in the Middle</td>
          <td style="padding: 6px 4px;">Pointers start at <code>left = 0</code> and <code>right = n - 1</code>. Converge based on comparison sum.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Read / Write Pointers</td>
          <td style="padding: 6px 4px;">Fast reader pointer scans elements. Slow writer pointer records updates in-place.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Boundary Container Bounds</td>
          <td style="padding: 6px 4px;">Track boundaries from both ends. Move the pointer pointing to the smaller element to maximize potential space.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Trapping Rain Water</td>
          <td style="padding: 6px 4px;">Keep two pointers converging. Bounded by left max and right max heights respectively.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 टू पॉइंटर्स पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 टू पॉइंटर्स समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      टू पॉइंटर्स का उपयोग तब करें जब इनपुट सॉर्टेड हो (या सॉर्ट किया जा सके), और समस्या में ऐसे जोड़ों, त्रिकों या तत्वों की खोज हो जो योग सीमाओं या शर्तों को पूरा करते हों।
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
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">मध्य में मिलें (Meet in the Middle)</td>
          <td style="padding: 6px 4px;">पॉइंटर्स <code>left = 0</code> और <code>right = n - 1</code> से शुरू होते हैं। योग के आधार पर पास आते हैं।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">रीड / राइट पॉइंटर्स</td>
          <td style="padding: 6px 4px;">तेज़ रीडर पॉइंटर स्कैन करता है। धीमा राइटर पॉइंटर इन-प्लेस मान सहेजता है।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">सीमा कंटेनर सीमाएं</td>
          <td style="padding: 6px 4px;">दोनों छोरों से सीमाओं को ट्रैक करें। संभावित जगह बढ़ाने के लिए छोटे तत्व के पॉइंटर को खिसकाएं।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">ट्रैपिंग रेन वॉटर</td>
          <td style="padding: 6px 4px;">दो पॉइंटर्स को पास लाएं। क्रमशः बाएं अधिकतम (left max) और दाएं अधिकतम (right max) ऊंचाई द्वारा सीमित।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Two Pointer Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Two-Pointers", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e75046c05bf5f0580b8003",
    title: "Two Sum II (sorted) Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Hash Map Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use a hash map. Requires extra space for key storage.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers meet-in-the-middle)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers at both ends (<code>left = 0</code>, <code>right = n - 1</code>). If sum is smaller than target, increment left. If sum is larger, decrement right.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1
        while left < right:
            current_sum = numbers[left] + numbers[right]
            if current_sum == target:
                return [left + 1, right + 1]
            elif current_sum < target:
                left += 1
            else:
                right -= 1
        return []</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (numbers = [2, 7, 11, 15], target = 9)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0 (2), right = 3 (15). sum = 17 > 9 -> right = 2.<br/>
    - left = 0 (2), right = 2 (11). sum = 13 > 9 -> right = 1.<br/>
    - left = 0 (2), right = 1 (7). sum = 9 == 9. Returns 1-indexed [1, 2]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and twoSum method definition.</li>
    <li><b>Line 3:</b> Set pointers at start and end indices.</li>
    <li><b>Line 4:</b> Loop while left pointer is smaller than right.</li>
    <li><b>Line 5-7:</b> Add elements. Return 1-indexed positions on target match.</li>
    <li><b>Line 8-9:</b> Sum is too small. Shift left pointer rightward (left += 1).</li>
    <li><b>Line 10-11:</b> Sum is too large. Shift right pointer leftward (right -= 1).</li>
    <li><b>Line 12:</b> Fallback return.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 हैश मैप दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">हैश मैप का उपयोग करें। कुंजी भंडारण (key storage) के लिए अतिरिक्त स्थान की आवश्यकता होती है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दोनों छोरों पर पॉइंटर्स रखें (<code>left = 0</code>, <code>right = n - 1</code>)। यदि योग लक्ष्य से कम है, तो बाएं पॉइंटर को आगे बढ़ाएं। यदि योग अधिक है, तो दाएं पॉइंटर को पीछे खिसकाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1
        while left < right:
            current_sum = numbers[left] + numbers[right]
            if current_sum == target:
                return [left + 1, right + 1]
            elif current_sum < target:
                left += 1
            else:
                right -= 1
        return []</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (numbers = [2, 7, 11, 15], target = 9)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0 (2), right = 3 (15)। योग = 17 > 9 -> right = 2।<br/>
    - left = 0 (2), right = 2 (11)। योग = 13 > 9 -> right = 1।<br/>
    - left = 0 (2), right = 1 (7)। योग = 9 == 9। 1-आधारित इंडेक्स [1, 2] लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> पॉइंटर्स बाएं और दाएं छोर पर बनाना।</li>
    <li><b>लाइन 4:</b> लूप चलाना जब तक <code>left < right</code> हो।</li>
    <li><b>लाइन 5-7:</b> योग की गणना। लक्ष्य पूरा होने पर 1 जोड़कर (1-indexed) इंडेक्स लौटाना।</li>
    <li><b>लाइन 8-9:</b> योग कम होने पर बाएं पॉइंटर को आगे बढ़ाना (left += 1)।</li>
    <li><b>लाइन 10-11:</b> योग अधिक होने पर दाएं पॉइंटर को पीछे खिसकाना (right -= 1)।</li>
    <li><b>लाइन 12:</b> खाली एरे का डिफ़ॉल्ट रिटर्न।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75046c05bf5f0580b8005",
    title: "Remove duplicates from sorted array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Extra Array Storage</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Create a new array, copy unique elements. Uses extra memory space.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers Read/Write in-place)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep a <code>write</code> pointer at index 1. Traverse array with <code>read</code> pointer. If current element differs from previous, write to <code>write</code> index and increment <code>write</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        if not nums:
            return 0
        write = 1
        for read in range(1, len(nums)):
            if nums[read] != nums[read - 1]:
                nums[write] = nums[read]
                write += 1
        return write</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 1, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - write = 1.<br/>
    - read = 1: nums[1] == nums[0] (1 == 1) -> skip.<br/>
    - read = 2: nums[2] != nums[1] (2 != 1) -> nums[write] = nums[2] (nums[1] = 2). write = 2.<br/>
    - nums becomes [1, 2, 2]. Returns unique size 2. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and method declaration.</li>
    <li><b>Line 3-4:</b> Return 0 if array is empty.</li>
    <li><b>Line 5:</b> Writer pointer starts at index 1.</li>
    <li><b>Line 6:</b> Scan array with reader pointer starting from index 1.</li>
    <li><b>Line 7-9:</b> If current element differs from previous, write value to write pointer index and increment write pointer.</li>
    <li><b>Line 10:</b> Return total unique elements count (write index).</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 अतिरिक्त एरे संग्रहण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">एक नया एरे बनाएं, उसमें केवल विशिष्ट तत्वों को कॉपी करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers in-place)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्स 1 पर एक <code>write</code> पॉइंटर रखें। एरे पर <code>read</code> पॉइंटर से स्कैन करें। यदि वर्तमान अंक पिछले अंक से भिन्न है, तो उसे <code>write</code> स्थान पर कॉपी करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        if not nums:
            return 0
        write = 1
        for read in range(1, len(nums)):
            if nums[read] != nums[read - 1]:
                nums[write] = nums[read]
                write += 1
        return write</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 1, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - write = 1।<br/>
    - read = 1: nums[1] == nums[0] (1 == 1) -> स्किप।<br/>
    - read = 2: nums[2] != nums[1] (2 != 1) -> nums[write] = nums[2] (nums[1] = 2) | write = 2।<br/>
    - एरे [1, 2, 2] बनता है। अनोखे अंकों की संख्या 2 मिली।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> एरे खाली होने पर 0 लौटाना।</li>
    <li><b>लाइन 5:</b> राइटर पॉइंटर (write) को इंडेक्स 1 से शुरू करना।</li>
    <li><b>लाइन 6:</b> रीडर पॉइंटर (read) से इंडेक्स 1 से अंत तक लूप चलाना।</li>
    <li><b>लाइन 7-9:</b> यदि वर्तमान अंक पिछले अंक से भिन्न है, तो उसे write इंडेक्स पर कॉपी करें और write को 1 बढ़ाएं।</li>
    <li><b>लाइन 10:</b> कुल अनूठे तत्वों की संख्या लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75047c05bf5f0580b8007",
    title: "Container with most water Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Converging Pointers Height Rule</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers at ends. Calculate area: <code>min(height[left], height[right]) * (right - left)</code>. To find a larger area, shift the pointer pointing to the smaller line inward.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        max_water = 0
        while left < right:
            width = right - left
            current_height = min(height[left], height[right])
            max_water = max(max_water, width * current_height)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_water</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (height = [1, 8, 6, 2, 5, 4, 8, 3, 7])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0 (1), right = 8 (7). width = 8, min_height = 1. area = 8. max_water = 8.<br/>
    - height[0] < height[8] (1 < 7) -> left = 1.<br/>
    - left = 1 (8), right = 8 (7). width = 7, min_height = 7. area = 49. max_water = max(8, 49) = 49.<br/>
    - height[1] >= height[8] (8 >= 7) -> right = 7.<br/>
    - Converges through pointer shifts to return max area 49. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maxArea method definition.</li>
    <li><b>Line 3-4:</b> Pointers setup at both ends, initialize max water tracker.</li>
    <li><b>Line 5:</b> Loop until pointers cross.</li>
    <li><b>Line 6-8:</b> Calculate container width, bottleneck height, and area. Save max area.</li>
    <li><b>Line 9-12:</b> Shift left pointer if left line is smaller, otherwise shift right pointer.</li>
    <li><b>Line 13:</b> Return max water area.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 अभिसरण पॉइंटर्स नियम (Bottleneck Height)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">पॉइंटर्स को दोनों छोरों पर रखें। क्षेत्रफल की गणना करें: <code>min(height[left], height[right]) * (right - left)</code>। बड़ी सीमा खोजने के लिए छोटे मान वाले पॉइंटर को भीतर की तरफ खिसकाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        max_water = 0
        while left < right:
            width = right - left
            current_height = min(height[left], height[right])
            max_water = max(max_water, width * current_height)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_water</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (height = [1, 8, 6, 2, 5, 4, 8, 3, 7])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0 (1), right = 8 (7)। width = 8, min_height = 1। area = 8। max_water = 8।<br/>
    - height[0] < height[8] (1 < 7) -> left = 1।<br/>
    - left = 1 (8), right = 8 (7)। width = 7, min_height = 7। area = 49। max_water = 49।<br/>
    - अंत में अधिकतम क्षेत्रफल 49 मिलता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> पॉइंटर्स को शुरू और अंत में रखना, अधिकतम पानी क्षेत्रफल वेरिएबल घोषित करना।</li>
    <li><b>लाइन 5:</b> लूप चलाना जब तक पॉइंटर्स पार न करें।</li>
    <li><b>लाइन 6-8:</b> चौड़ाई, न्यूनतम ऊंचाई और क्षेत्रफल मापना। अधिकतम क्षेत्रफल अपडेट करना।</li>
    <li><b>लाइन 9-12:</b> यदि बाईं ऊंचाई छोटी है, तो बाएं पॉइंटर को आगे बढ़ाएं, अन्यथा दाएं पॉइंटर को पीछे खिसकाएं।</li>
    <li><b>लाइन 13:</b> अधिकतम पानी का मान लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75047c05bf5f0580b8009",
    title: "3Sum Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Nested Triplet Checks</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use three nested loops to verify every possible combination. Extremely slow.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N³) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Sorted target with Two Sum II)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Sort array. Loop through elements, treating current element <code>nums[i]</code> as target sum. Use two pointers on remaining subarray to find pairs adding up to <code>-nums[i]</code>. Skip duplicate elements at all levels.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N²) | 🧠 Space: O(sorting space)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        ans = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            left, right = i + 1, len(nums) - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total == 0:
                    ans.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [-1, 0, 1, 2, -1, -4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Sorted array: [-4, -1, -1, 0, 1, 2].<br/>
    - i = 0 (-4) -> target sum = 4. left = 1 (-1), right = 5 (2). sum = -3 < 0 -> left = 2. sum = -3. left = 3. No match.<br/>
    - i = 1 (-1) -> target sum = 1. left = 2 (-1), right = 5 (2). sum = 0 == 0! ans = [[-1, -1, 2]]. Skip duplicates: left = 3, right = 4.<br/>
    - Returns unique triplets: [[-1, -1, 2], [-1, 0, 1]]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and threeSum method declaration.</li>
    <li><b>Line 3-4:</b> Sort array (essential for target two sum matching) and initialize result list.</li>
    <li><b>Line 5:</b> Loop through array up to third last element.</li>
    <li><b>Line 6-7:</b> Skip duplicate target numbers to avoid duplicate triplets in answer.</li>
    <li><b>Line 8-9:</b> Set two pointers left and right on remaining subarray and start search.</li>
    <li><b>Line 10-13:</b> On total sum matching 0, append triplet.</li>
    <li><b>Line 14-17:</b> Skip duplicate values at left and right positions, then shift pointers inward.</li>
    <li><b>Line 18-21:</b> Shift pointers according to whether sum is smaller or larger.</li>
    <li><b>Line 22:</b> Return triplets.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 नेस्टेड त्रिक (Triplet) जाँच</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक संभावित संयोजन को सत्यापित करने के लिए तीन नेस्टेड लूप का उपयोग करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N³) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Sorting and Two Pointers)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">एरे को सॉर्ट करें। तत्वों पर लूप करें, वर्तमान संख्या <code>nums[i]</code> को लक्ष्य मानते हुए। शेष सबएरे में <code>-nums[i]</code> योग खोजने के लिए दो पॉइंटर्स का उपयोग करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N²) | 🧠 स्थान: O(sorting)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        ans = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            left, right = i + 1, len(nums) - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total == 0:
                    ans.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [-1, 0, 1, 2, -1, -4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सॉर्टेड एरे: [-4, -1, -1, 0, 1, 2]।<br/>
    - i = 0 (-4) -> योग 4 चाहिए। left=1 (-1), right=5 (2) -> sum = -3। (कोई मेल नहीं)।<br/>
    - i = 1 (-1) -> योग 1 चाहिए। left=2 (-1), right=5 (2) -> sum = 0 (मैच हुआ)। ans = [[-1, -1, 2]]। डुप्लिकेट छोड़ें: left=3, right=4।<br/>
    - परिणाम: [[-1, -1, 2], [-1, 0, 1]]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> एरे सॉर्ट करना (टू पॉइंटर के लिए आवश्यक) और परिणाम सूची घोषित करना।</li>
    <li><b>लाइन 5:</b> एरे में तीसरे अंतिम अंक तक लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> यदि लक्ष्य अंक पहले अंक जैसा ही है, तो स्किप करना (डुप्लिकेट से बचने के लिए)।</li>
    <li><b>लाइन 8-9:</b> बाएं और दाएं पॉइंटर्स को शेष सबएरे पर सेट करना और खोजना।</li>
    <li><b>लाइन 10-13:</b> यदि योग 0 है, तो त्रिक को परिणाम सूची में जोड़ना।</li>
    <li><b>लाइन 14-17:</b> बाएं और दाएं पॉइंटर्स पर रिपीट होने वाले अंक छोड़ना, और पॉइंटर्स खिसकाना।</li>
    <li><b>लाइन 18-21:</b> योग कम या अधिक होने के अनुसार पॉइंटर्स खिसकाना।</li>
    <li><b>लाइन 22:</b> परिणामी त्रिक सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75047c05bf5f0580b800b",
    title: "4Sum Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Nested Loops with Two Pointers</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Extension of 3Sum. Sort array. Use two nested loops to select first two elements <code>nums[i]</code> and <code>nums[j]</code>. Use two pointers on remaining subarray to find pairs adding up to <code>target - nums[i] - nums[j]</code>. Skip duplicates at all levels.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N³) | 🧠 Space: O(sorting)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        nums.sort()
        ans = []
        n = len(nums)
        for i in range(n - 3):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            for j in range(i + 1, n - 2):
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue
                left, right = j + 1, n - 1
                while left < right:
                    total = nums[i] + nums[j] + nums[left] + nums[right]
                    if total == target:
                        ans.append([nums[i], nums[j], nums[left], nums[right]])
                        while left < right and nums[left] == nums[left + 1]:
                            left += 1
                        while left < right and nums[right] == nums[right - 1]:
                            right -= 1
                        left += 1
                        right -= 1
                    elif total < target:
                        left += 1
                    else:
                        right -= 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 0, -1, 0, -2, 2], target = 0)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Sorted array: [-2, -1, 0, 0, 1, 2]. n = 6.<br/>
    - Nested loops iterate first target i = 0 (-2) and second target j = 1 (-1). target sum = 3.<br/>
    - left = 2 (0), right = 5 (2). sum = -2 + -1 + 0 + 2 = -1 < 0 -> left = 3.<br/>
    - left = 3 (0), right = 5 (2). sum = -1 < 0 -> left = 4.<br/>
    - left = 4 (1), right = 5 (2). sum = 0 == 0! Match! ans = [[-2, -1, 1, 2]].<br/>
    - Returns: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and fourSum method signature.</li>
    <li><b>Line 3-5:</b> Sort elements, initialize list and length variables.</li>
    <li><b>Line 6-8:</b> Loop target pointer i. Skip duplicates to avoid redundant quadruplets.</li>
    <li><b>Line 9-11:</b> Loop target pointer j. Skip duplicates.</li>
    <li><b>Line 12:</b> Set left and right pointers.</li>
    <li><b>Line 13-25:</b> Standard Two Pointers search logic, appending solutions and skipping duplicate elements at left and right positions.</li>
    <li><b>Line 26:</b> Return answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 दो नेस्टेड लूप और टू पॉइंटर्स</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">3Sum का विस्तार। एरे सॉर्ट करें। प्रथम दो तत्वों <code>nums[i]</code> और <code>nums[j]</code> को चुनने के लिए नेस्टेड लूप का उपयोग करें। शेष में <code>target - nums[i] - nums[j]</code> खोजने के लिए टू पॉइंटर्स लगाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N³) | 🧠 स्थान: O(sorting)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        nums.sort()
        ans = []
        n = len(nums)
        for i in range(n - 3):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            for j in range(i + 1, n - 2):
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue
                left, right = j + 1, n - 1
                while left < right:
                    total = nums[i] + nums[j] + nums[left] + nums[right]
                    if total == target:
                        ans.append([nums[i], nums[j], nums[left], nums[right]])
                        while left < right and nums[left] == nums[left + 1]:
                            left += 1
                        while left < right and nums[right] == nums[right - 1]:
                            right -= 1
                        left += 1
                        right -= 1
                    elif total < target:
                        left += 1
                    else:
                        right -= 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 0, -1, 0, -2, 2], target = 0)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सॉर्टेड एरे: [-2, -1, 0, 0, 1, 2]।<br/>
    - i = 0 (-2) और j = 1 (-1) के लिए: लक्ष्य योग = 3 चाहिए।<br/>
    - left = 4 (1), right = 5 (2) पर: sum = -2 + -1 + 1 + 2 = 0 (मैच हुआ)। ans = [[-2, -1, 1, 2]]।<br/>
    - परिणाम: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> अंकों को सॉर्ट करना, लिस्ट और लंबाई वेरिएबल्स घोषित करना।</li>
    <li><b>लाइन 6-8:</b> प्रथम लक्ष्य i पर लूप चलाना। डुप्लिकेट छोड़ना।</li>
    <li><b>लाइन 9-11:</b> द्वितीय लक्ष्य j पर लूप चलाना। डुप्लिकेट छोड़ना।</li>
    <li><b>लाइन 12:</b> पॉइंटर्स बाएं और दाएं घोषित करना।</li>
    <li><b>लाइन 13-25:</b> बाइनरी तुलना लूप, परिणाम जोड़ना और डुप्लिकेट तत्वों को स्किप करना।</li>
    <li><b>लाइन 26:</b> परिणाम सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75047c05bf5f0580b800d",
    title: "Move zeroes Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Copying Non-Zeros to New List</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Create a new array, copy non-zero elements, fill remaining spaces with 0. Requires extra storage.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers Swap in-place)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep a <code>write</code> pointer at index 0. Traverse array with <code>read</code> pointer. If current element is non-zero, swap it with the element at the <code>write</code> index, and increment <code>write</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        write = 0
        for read in range(len(nums)):
            if nums[read] != 0:
                nums[write], nums[read] = nums[read], nums[write]
                write += 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [0, 1, 0, 3, 12])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - write = 0.<br/>
    - read = 0 (0) -> skip.<br/>
    - read = 1 (1) -> swap nums[write](nums[0]=0) & nums[read](nums[1]=1). array = [1, 0, 0, 3, 12]. write = 1.<br/>
    - read = 2 (0) -> skip.<br/>
    - read = 3 (3) -> swap nums[1](0) & nums[3](3). array = [1, 3, 0, 0, 12]. write = 2.<br/>
    - read = 4 (12) -> swap nums[2](0) & nums[4](12). array = [1, 3, 12, 0, 0]. write = 3.<br/>
    - Returns array [1, 3, 12, 0, 0]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and moveZeroes method parameters signature.</li>
    <li><b>Line 3:</b> Set write index pointer to 0.</li>
    <li><b>Line 4:</b> Scan array elements with read pointer.</li>
    <li><b>Line 5-7:</b> If non-zero element is found, swap it with write pointer index and increment write pointer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 नए एरे में कॉपी करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">एक नया खाली एरे बनाएं, गैर-शून्य अंकों को कॉपी करें और बाकी बचे इंडेक्स को 0 से भरें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers in-place Swap)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्स 0 पर <code>write</code> पॉइंटर रखें। <code>read</code> पॉइंटर से एरे स्कैन करें। यदि अंक शून्य नहीं है, तो उसे <code>write</code> पॉइंटर के अंक से बदलें (swap) और write को 1 बढ़ाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        write = 0
        for read in range(len(nums)):
            if nums[read] != 0:
                nums[write], nums[read] = nums[read], nums[write]
                write += 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [0, 1, 0, 3, 12])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - write = 0।<br/>
    - read = 0 (0) -> स्किप।<br/>
    - read = 1 (1) -> swap (nums[0], nums[1]) | array = [1, 0, 0, 3, 12] | write = 1।<br/>
    - read = 2 (0) -> स्किप।<br/>
    - read = 3 (3) -> swap (nums[1], nums[3]) | array = [1, 3, 0, 0, 12] | write = 2।<br/>
    - read = 4 (12) -> swap (nums[2], nums[4]) | array = [1, 3, 12, 0, 0] | write = 3।<br/>
    - परिणाम: [1, 3, 12, 0, 0]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> राइटर पॉइंटर (write) को 0 सेट करना।</li>
    <li><b>लाइन 4:</b> रीडर पॉइंटर (read) से एरे पर लूप चलाना।</li>
    <li><b>लाइन 5-7:</b> यदि अंक शून्य नहीं है, तो उसे write इंडेक्स के अंक से बदलें और write को 1 बढ़ाएं।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75047c05bf5f0580b800f",
    title: "Valid palindrome Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Pointers Squeeze with Alphanumeric Checks</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers at both ends. Shift pointers inward past spaces or non-alphanumeric characters. Compare lowercased values. If any mismatch, return False.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        while left < right:
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "A man, a plan, a canal: Panama")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0, right = 29.<br/>
    - Skip non-alphanumeric. Pointers compare: s[0] ('A') lower vs s[29] ('a') lower. Match.<br/>
    - left = 1 (' '), shifts left = 2 ('m'). right = 28 ('a'), shifts right = 27 ('m'). s[2] ('m') lower vs s[27] ('m') lower. Match.<br/>
    - Loop continues to compare all valid character bounds. Returns True. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and isPalindrome method signature.</li>
    <li><b>Line 3:</b> Pointers initialized at start and end of string s.</li>
    <li><b>Line 4:</b> Loop runs while pointers left < right.</li>
    <li><b>Line 5-6:</b> Shift left pointer past any non-alphanumeric character.</li>
    <li><b>Line 7-8:</b> Shift right pointer past any non-alphanumeric character.</li>
    <li><b>Line 9-10:</b> Compare lowercased character values. If mismatch, return False.</li>
    <li><b>Line 11-12:</b> Move pointers inward.</li>
    <li><b>Line 13:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 टू पॉइंटर्स कैरेक्टर फ़िल्टरिंग नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">पॉइंटर्स को दोनों छोरों पर रखें। गैर-अक्षरों (non-alphanumeric) को स्किप करें। लोअरकेस मानों की तुलना करें। विषम होने पर सीधे False लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        while left < right:
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "A man, a plan, a canal: Panama")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0, right = 29।<br/>
    - स्पेस और कॉमा स्किप करने के बाद: s[0] ('A') lower vs s[29] ('a') lower (मैच)।<br/>
    - left = 2 ('m') vs right = 27 ('m') (मैच)।<br/>
    - इसी प्रकार तुलना जारी रहती है। परिणाम True मिलता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> पॉइंटर्स को स्ट्रिंग s के शुरू और अंत पर रखना।</li>
    <li><b>लाइन 4:</b> लूप चलाना जब तक <code>left < right</code> हो।</li>
    <li><b>लाइन 5-6:</b> बाएं पॉइंटर से गैर-अक्षर तत्वों को छोड़ना।</li>
    <li><b>लाइन 7-8:</b> दाएं पॉइंटर से गैर-अक्षर तत्वों को छोड़ना।</li>
    <li><b>लाइन 9-10:</b> अक्षरों को लोअरकेस में तुलना करना। मेल न खाने पर False लौटाना।</li>
    <li><b>लाइन 11-12:</b> पॉइंटर्स को अंदर की ओर खिसकाना।</li>
    <li><b>लाइन 13:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75047c05bf5f0580b8011",
    title: "Squares of sorted array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Square and Sort</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Square every element, sort output array. Does not utilize sorting structure of inputs.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N log N) | 🧠 Space: O(sorting space)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers extreme bounds)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Since input is sorted, the largest squared values must lie at either end (due to negative values). Pointers at both ends. Compare absolute values, write square of larger value to the end of output array, shift pointer.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N) for output array</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans = [0] * n
        left, right = 0, n - 1
        for i in range(n - 1, -1, -1):
            if abs(nums[left]) > abs(nums[right]):
                ans[i] = nums[left] ** 2
                left += 1
            else:
                ans[i] = nums[right] ** 2
                right -= 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [-4, -1, 0, 3, 10])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0 (-4), right = 4 (10). ans size = 5.<br/>
    - i = 4: abs(-4) < abs(10) -> ans[4] = 100, right = 3.<br/>
    - i = 3: abs(-4) > abs(3) -> ans[3] = 16, left = 1.<br/>
    - i = 2: abs(-1) < abs(3) -> ans[2] = 9, right = 2.<br/>
    - i = 1: abs(-1) > abs(0) -> ans[1] = 1, left = 2.<br/>
    - i = 0: abs(0) == abs(0) -> ans[0] = 0. right = 1.<br/>
    - Returns [0, 1, 9, 16, 100]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and sortedSquares function signature.</li>
    <li><b>Line 3-5:</b> Setup length, empty answer array, and pointers.</li>
    <li><b>Line 6:</b> Loop backwards from n-1 index to 0.</li>
    <li><b>Line 7-9:</b> If absolute value at left is larger, square it and assign to index i, shift left.</li>
    <li><b>Line 10-12:</b> Otherwise, square value at right pointer and assign, shift right.</li>
    <li><b>Line 13:</b> Return squares array.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 वर्ग करके सॉर्ट करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी तत्वों का वर्ग करें, और आउटपुट एरे को सॉर्ट करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N log N) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers चरम सीमाएं)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इनपुट सॉर्टेड होने के कारण, अधिकतम वर्ग मान हमेशा दोनों छोरों पर स्थित होंगे (ऋणात्मक संख्याओं के कारण)। पॉइंटर्स को दोनों सिरों पर रखें। निरपेक्ष (absolute) मानों की तुलना करें, बड़े वर्ग को आउटपुट के अंत में लिखें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans = [0] * n
        left, right = 0, n - 1
        for i in range(n - 1, -1, -1):
            if abs(nums[left]) > abs(nums[right]):
                ans[i] = nums[left] ** 2
                left += 1
            else:
                ans[i] = nums[right] ** 2
                right -= 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [-4, -1, 0, 3, 10])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0 (-4), right = 4 (10)। ans = [0,0,0,0,0]।<br/>
    - i = 4: abs(-4) < abs(10) -> ans[4] = 100 | right = 3।<br/>
    - i = 3: abs(-4) > abs(3) -> ans[3] = 16 | left = 1।<br/>
    - i = 2: abs(-1) < abs(3) -> ans[2] = 9 | right = 2।<br/>
    - परिणाम एरे [0, 1, 9, 16, 100] मिला।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> लंबाई, खाली एरे और बाएं/दाएं पॉइंटर्स घोषित करना।</li>
    <li><b>लाइन 6:</b> आउटपुट एरे में पीछे की ओर (n-1 से 0) लूप चलाना।</li>
    <li><b>लाइन 7-9:</b> यदि बाएं अंक का निरपेक्ष मान दाएं से बड़ा है, तो उसका वर्ग इंडेक्स i पर रखें और left पॉइंटर आगे बढ़ाएं।</li>
    <li><b>लाइन 10-12:</b> अन्यथा, दाएं अंक का वर्ग सहेजें और right पॉइंटर पीछे खिसकाएं।</li>
    <li><b>लाइन 13:</b> परिणामी वर्ग सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504ac05bf5f0580b8013",
    title: "Partition array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers Partitioning)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Two pointers from ends. Shift left past elements smaller than pivot K. Shift right past elements greater than or equal to K. Swap values when pointers stop and satisfy bounds.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def partitionArray(self, nums: List[int], k: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            while left <= right and nums[left] < k:
                left += 1
            while left <= right and nums[right] >= k:
                right -= 1
            if left <= right:
                nums[left], nums[right] = nums[right], nums[left]
                left += 1
                right -= 1
        return left</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [9, 12, 5, 10, 14, 3, 10], k = 10)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0, right = 6.<br/>
    - Shift left: nums[0](9) < 10 -> left = 1. nums[1](12) >= 10 -> stop left = 1.<br/>
    - Shift right: nums[6](10) >= 10 -> right = 5. nums[5](3) < 10 -> stop right = 5.<br/>
    - Swap nums[1] (12) & nums[5] (3). Array = [9, 3, 5, 10, 14, 12, 10]. left = 2, right = 4.<br/>
    - Shift left: nums[2](5) < 10 -> left = 3. nums[3](10) >= 10 -> stop left = 3.<br/>
    - Shift right: nums[4](14) >= 10 -> right = 3. nums[3](10) >= 10 -> right = 2. stop right = 2.<br/>
    - Loop ends (left(3) > right(2)). Returns partition index 3. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and partition method parameters.</li>
    <li><b>Line 3:</b> Set pointers at start and end indices.</li>
    <li><b>Line 4:</b> Loop while pointers do not cross.</li>
    <li><b>Line 5-6:</b> Increment left pointer while values are smaller than pivot.</li>
    <li><b>Line 7-8:</b> Decrement right pointer while values are >= pivot.</li>
    <li><b>Line 9-12:</b> If pointers are valid, swap mismatching elements and adjust pointers.</li>
    <li><b>Line 13:</b> Return left partition boundary index.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers Partitioning)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दोनों सिरों से दो पॉइंटर्स रखें। बाएं पॉइंटर को तब तक बढ़ाएं जब तक अंक लक्ष्य K से कम हों। दाएं पॉइंटर को पीछे खिसकाएं जब तक अंक K से अधिक या बराबर हों। पॉइंटर्स रुकने पर स्वैप करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def partitionArray(self, nums: List[int], k: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            while left <= right and nums[left] < k:
                left += 1
            while left <= right and nums[right] >= k:
                right -= 1
            if left <= right:
                nums[left], nums[right] = nums[right], nums[left]
                left += 1
                right -= 1
        return left</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [9, 12, 5, 10, 14, 3, 10], k = 10)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0, right = 6।<br/>
    - बाएं खिसकाएं: nums[0](9) < 10 -> left = 1. (nums[1]=12 >= 10, रुकें)।<br/>
    - दाएं खिसकाएं: nums[6](10) >= 10 -> right = 5. (nums[5]=3 < 10, रुकें)।<br/>
    - स्वैप (nums[1], nums[5]) -> एरे = [9, 3, 5, 10, 14, 12, 10]। left = 2, right = 4।<br/>
    - लूप समाप्त (left(3) > right(2))। विभाजन इंडेक्स 3 लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> पॉइंटर्स बाएं और दाएं घोषित करना।</li>
    <li><b>लाइन 4:</b> लूप चलाना जब तक पॉइंटर्स पार न करें।</li>
    <li><b>लाइन 5-6:</b> बाएं पॉइंटर को आगे बढ़ाना जब तक मान K से कम हो।</li>
    <li><b>लाइन 7-8:</b> दाएं पॉइंटर को पीछे खिसकाना जब तक मान K से अधिक या बराबर हो।</li>
    <li><b>लाइन 9-12:</b> यदि दोनों पॉइंटर्स वैध स्थान पर हैं, तो तत्वों को बदलें और पॉइंटर्स खिसकाएं।</li>
    <li><b>लाइन 13:</b> विभाजन इंडेक्स सीमा लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7504dc05bf5f0580b8015",
    title: "Trapping rain water Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Converging max heights rule</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers at both ends. Keep track of <code>left_max</code> and <code>right_max</code> heights. If <code>height[left] < height[right]</code>, the water level is bounded by left_max. Trap <code>left_max - height[left]</code> and increment left. Otherwise, trap from right.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def trap(self, height: List[int]) -> int:
        if not height:
            return 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
        while left < right:
            if height[left] < height[right]:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
        return water</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0, right = 11. left_max = 0, right_max = 1. water = 0.<br/>
    - height[0] < height[11] (0 < 1) -> left = 1. left_max = max(0, 1) = 1. water += 1 - 1 = 0.<br/>
    - height[1] == height[11] (1 == 1) -> right = 10. right_max = max(1, 2) = 2. water += 2 - 2 = 0.<br/>
    - height[1] < height[10] (1 < 2) -> left = 2. left_max = max(1, 0) = 1. water += 1 - 0 = 1.<br/>
    - Converges through pointer checks to yield total trapped water 6. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and trap method parameters signature.</li>
    <li><b>Line 3-4:</b> Verify if elevation list is empty.</li>
    <li><b>Line 5:</b> Set left and right pointers at both ends.</li>
    <li><b>Line 6-7:</b> Initialize left_max and right_max bounds trackers.</li>
    <li><b>Line 9:</b> Loop until pointers meet.</li>
    <li><b>Line 10-13:</b> If height at left is smaller, shift left pointer, update left max boundary, add trapped water difference.</li>
    <li><b>Line 14-17:</b> Otherwise, shift right pointer, update right max boundary, add trapped water difference.</li>
    <li><b>Line 18:</b> Return accumulated water.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 अभिसरण अधिकतम ऊंचाई नियम (Max Heights)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">पॉइंटर्स को दोनों छोरों पर रखें। <code>left_max</code> और <code>right_max</code> को ट्रैक करें। यदि <code>height[left] < height[right]</code> है, तो पानी का स्तर left_max द्वारा सीमित है। तदनुसार पानी जोड़ें और पॉइंटर्स खिसकाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def trap(self, height: List[int]) -> int:
        if not height:
            return 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
        while left < right:
            if height[left] < height[right]:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
        return water</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left = 0, right = 11। left_max = 0, right_max = 1। water = 0।<br/>
    - height[0] < height[11] -> left = 1। left_max = 1। water += 1-1 = 0।<br/>
    - height[1] == height[11] -> right = 10। right_max = 2। water += 2-2 = 0।<br/>
    - left=2 पर: left_max=1। water += 1-0 = 1।<br/>
    - कुल संचित पानी 6 प्राप्त होता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> ऊंचाई सूची खाली होने पर 0 लौटाना।</li>
    <li><b>लाइन 5:</b> पॉइंटर्स को बाएं और दाएं छोर पर स्थापित करना।</li>
    <li><b>लाइन 6-7:</b> बाएं और दाएं अधिकतम ऊंचाई सीमा ट्रैकर्स (left_max/right_max) इनिशियलाइज़ करना।</li>
    <li><b>लाइन 9:</b> लूप चलाना जब तक पॉइंटर्स आपस में न मिलें।</li>
    <li><b>लाइन 10-13:</b> यदि बाईं ऊंचाई छोटी है, तो बाएं पॉइंटर को आगे बढ़ाएं, अधिकतम सीमा अपडेट करें, और जल स्तर अंतर जोड़ें।</li>
    <li><b>लाइन 14-17:</b> अन्यथा, दाएं पॉइंटर को पीछे खिसकाएं, दाएं अधिकतम सीमा को अपडेट करें, और जल स्तर अंतर जोड़ें।</li>
    <li><b>लाइन 18:</b> कुल संचित पानी लौटाना।</li>
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
    
    console.log("Cleaning up old seeded two pointers notes...");
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
        tags: ["Two-Pointers", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed two pointers notes...`);
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
