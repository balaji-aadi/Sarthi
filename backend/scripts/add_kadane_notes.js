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
const parentTaskId = "69e75050c05bf5f0580b8043";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 Kadane's Algorithm Identification Blueprint</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Kadane's Algorithm Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      Apply Kadane's Algorithm when the problem asks for the maximum/minimum sum, product, or difference of a <b>contiguous subarray</b>. It involves a single pass where we make a binary choice at each index: "Extend the current subarray or start a new one?"
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Algorithm States</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Problem Class</th>
          <th style="padding: 6px 4px; font-weight: 700;">State Formula</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Maximum Subarray Sum</td>
          <td style="padding: 6px 4px;"><code>curr = max(x, curr + x)</code></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Maximum Subarray Product</td>
          <td style="padding: 6px 4px;">Track both min and max: swap them when multiplying by a negative number.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Circular Subarray</td>
          <td style="padding: 6px 4px;">Compare standard Kadane max against <code>total_sum - Kadane_min</code>.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">State Deletions / Signs</td>
          <td style="padding: 6px 4px;">Maintain two transition state variables (e.g. <code>no_deletion</code> and <code>one_deletion</code>).</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 कडाने एल्गोरिथ्म (Kadane's Algorithm) पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 कडाने एल्गोरिथ्म समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      कडाने एल्गोरिथ्म का उपयोग तब करें जब समस्या में किसी **लगातार (contiguous) सबएरे** के अधिकतम/न्यूनतम योग, गुणनफल, या अंतर की मांग हो। इसमें प्रत्येक इंडेक्स पर निर्णय लिया जाता है: "क्या मौजूदा सबएरे को बढ़ाएं या नया शुरू करें?"
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य अवस्थाएं</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">समस्या श्रेणी</th>
          <th style="padding: 6px 4px; font-weight: 700;">अवस्था सूत्र</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">अधिकतम सबएरे योग</td>
          <td style="padding: 6px 4px;"><code>curr = max(x, curr + x)</code></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">अधिकतम सबएरे गुणनफल</td>
          <td style="padding: 6px 4px;">न्यूनतम और अधिकतम दोनों को ट्रैक करें: ऋणात्मक मान आने पर उन्हें आपस में बदलें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">वृत्ताकार (Circular) सबएरे</td>
          <td style="padding: 6px 4px;">मानक कडाने अधिकतम की तुलना <code>total_sum - Kadane_min</code> से करें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">हटाने / चिह्न बदलने की अवस्था</td>
          <td style="padding: 6px 4px;">दो संक्रमण अवस्था वेरिएबल्स (जैसे <code>no_deletion</code> और <code>one_deletion</code>) का प्रबंधन करें।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Kadane's Algorithm Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Kadanes-Algorithm", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e75050c05bf5f0580b8045",
    title: "Maximum subarray Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Brute Force Cubic Combinations</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Compute sum of every possible subarray using nested loops. Extremely slow.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N³) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Kadane's Algorithm)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">At each index, decide whether to continue the existing subarray or start a new subarray: <code>curr_sum = max(num, curr_sum + num)</code>. Track global maximum.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        curr_sum = nums[0]
        max_sum = nums[0]
        for num in nums[1:]:
            curr_sum = max(num, curr_sum + num)
            max_sum = max(max_sum, curr_sum)
        return max_sum</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - curr_sum = -2, max_sum = -2.<br/>
    - num = 1 -> curr_sum = max(1, -1) = 1. max_sum = max(-2, 1) = 1.<br/>
    - num = -3 -> curr_sum = max(-3, -2) = -2. max_sum = 1.<br/>
    - num = 4 -> curr_sum = max(4, 2) = 4. max_sum = 4.<br/>
    - num = -1 -> curr_sum = max(-1, 3) = 3. max_sum = 4.<br/>
    - num = 2 -> curr_sum = max(2, 5) = 5. max_sum = 5.<br/>
    - num = 1 -> curr_sum = max(1, 6) = 6. max_sum = 6.<br/>
    - Returns max sum 6. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maxSubArray method parameters signature.</li>
    <li><b>Line 3-4:</b> Initialize trackers with first element.</li>
    <li><b>Line 5:</b> Iterate rest of elements.</li>
    <li><b>Line 6-7:</b> Update local sum by choosing whether to extend or reset. Maximize global sum.</li>
    <li><b>Line 8:</b> Return max sum.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 बलपूर्वक त्रिघातीय (Cubic) जांच</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">नेस्टेड लूप का उपयोग करके प्रत्येक संभावित सबएरे के योग की गणना करना। अत्यंत धीमा।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N³) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (कडाने एल्गोरिथ्म)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक इंडेक्स पर निर्णय लें कि क्या पिछले सबएरे को बढ़ाया जाए या नया शुरू किया जाए: <code>curr_sum = max(num, curr_sum + num)</code>। वैश्विक अधिकतम ट्रैक करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        curr_sum = nums[0]
        max_sum = nums[0]
        for num in nums[1:]:
            curr_sum = max(num, curr_sum + num)
            max_sum = max(max_sum, curr_sum)
        return max_sum</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - curr_sum = -2, max_sum = -2।<br/>
    - num = 1 -> curr_sum = max(1, -1) = 1 | max_sum = 1।<br/>
    - num = -3 -> curr_sum = max(-3, -2) = -2 | max_sum = 1।<br/>
    - num = 4 -> curr_sum = max(4, 2) = 4 | max_sum = 4।<br/>
    - num = 2 -> curr_sum = max(2, 5) = 5 | max_sum = 5।<br/>
    - num = 1 -> curr_sum = max(1, 6) = 6 | max_sum = 6।<br/>
    - अधिकतम योग 6 मिलता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> प्रथम तत्व से स्थानीय (curr_sum) और वैश्विक (max_sum) योग को इनिशियलाइज़ करना।</li>
    <li><b>लाइन 5:</b> दूसरे तत्व से लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> स्थानीय योग को अपडेट करना (या तो आगे बढ़ें या नया शुरू करें)। वैश्विक योग को अपडेट करना।</li>
    <li><b>लाइन 8:</b> अधिकतम योग लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75050c05bf5f0580b8047",
    title: "Maximum sum circular subarray Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Standard vs Wrapped Maximums</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">The maximum circular sum can either be:
      1. A standard subarray sum (Kadane's max).
      2. A wrapped subarray sum: <code>total_sum - minimum_subarray_sum</code>.
      Compare both. If standard max is negative (all numbers are negative), return standard max directly.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxSubarraySumCircular(self, nums: List[int]) -> int:
        total = 0
        max_sum = nums[0]
        curr_max = 0
        min_sum = nums[0]
        curr_min = 0
        for x in nums:
            curr_max = max(x, curr_max + x)
            max_sum = max(max_sum, curr_max)
            curr_min = min(x, curr_min + x)
            min_sum = min(min_sum, curr_min)
            total += x
        return max_sum if max_sum < 0 else max(max_sum, total - min_sum)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [5, -3, 5])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - standard max_sum = 5, total = 7.<br/>
    - min_sum = -3.<br/>
    - wrapped sum = total - min_sum = 7 - (-3) = 10.<br/>
    - Returns max(5, 10) = 10. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and method declaration.</li>
    <li><b>Line 3-7:</b> Initialize total sum, max trackers, and min trackers.</li>
    <li><b>Line 8:</b> Loop elements.</li>
    <li><b>Line 9-10:</b> Update standard Kadane max sum.</li>
    <li><b>Line 11-12:</b> Update standard Kadane min sum.</li>
    <li><b>Line 13:</b> Accumulate total array elements sum.</li>
    <li><b>Line 14:</b> If max_sum < 0 (all numbers negative), return max_sum. Otherwise return max of max_sum and total-min_sum.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 मानक बनाम वृत्ताकार (Circular) अधिकतम योग</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अधिकतम वृत्ताकार योग दो में से एक हो सकता है:
      1. मानक सबएरे योग (कडाने अधिकतम)।
      2. वृत्ताकार लपेटा गया योग: <code>total_sum - minimum_subarray_sum</code>।
      तुलना करें। यदि सभी अंक ऋणात्मक हैं, तो मानक अधिकतम लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxSubarraySumCircular(self, nums: List[int]) -> int:
        total = 0
        max_sum = nums[0]
        curr_max = 0
        min_sum = nums[0]
        curr_min = 0
        for x in nums:
            curr_max = max(x, curr_max + x)
            max_sum = max(max_sum, curr_max)
            curr_min = min(x, curr_min + x)
            min_sum = min(min_sum, curr_min)
            total += x
        return max_sum if max_sum < 0 else max(max_sum, total - min_sum)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [5, -3, 5])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - मानक max_sum = 5, total = 7।<br/>
    - min_sum = -3।<br/>
    - लपेटा गया वृत्ताकार योग = 7 - (-3) = 10।<br/>
    - अधिकतम (5, 10) = 10 लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-7:</b> कुल योग, अधिकतम और न्यूनतम ट्रैकर्स को इनिशियलाइज़ करना।</li>
    <li><b>लाइन 8:</b> तत्वों पर लूप चलाना।</li>
    <li><b>लाइन 9-10:</b> मानक कडाने अधिकतम योग को अपडेट करना।</li>
    <li><b>लाइन 11-12:</b> मानक कडाने न्यूनतम योग को अपडेट करना।</li>
    <li><b>लाइन 13:</b> कुल एरे योग को संचित करना।</li>
    <li><b>लाइन 14:</b> यदि सभी अंक ऋणात्मक हैं (max_sum < 0), तो सीधे max_sum लौटाएं, अन्यथा max_sum और circular_sum में से अधिकतम लौटाएं।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75050c05bf5f0580b8049",
    title: "Maximum product subarray Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Tracking Min and Max Products</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Since multiplying two negatives results in a positive, keep track of both <code>curr_max</code> and <code>curr_min</code> at each element. When current element is negative, swap <code>curr_max</code> and <code>curr_min</code> before calculations.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        ans = nums[0]
        curr_max = nums[0]
        curr_min = nums[0]
        for i in range(1, len(nums)):
            x = nums[i]
            if x < 0:
                curr_max, curr_min = curr_min, curr_max
            curr_max = max(x, curr_max * x)
            curr_min = min(x, curr_min * x)
            ans = max(ans, curr_max)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [2, 3, -2, 4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - curr_max = 2, curr_min = 2, ans = 2.<br/>
    - i = 1 (3): curr_max = max(3, 6) = 6. curr_min = min(3, 6) = 3. ans = 6.<br/>
    - i = 2 (-2): swap -> curr_max = 3, curr_min = 6.<br/>
    &nbsp;&nbsp;• curr_max = max(-2, -6) = -2.<br/>
    &nbsp;&nbsp;• curr_min = min(-2, -12) = -12. ans = 6.<br/>
    - i = 3 (4): curr_max = max(4, -8) = 4. ans = max(6, 4) = 6.<br/>
    - Returns 6. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maxProduct method signature.</li>
    <li><b>Line 3-5:</b> Initialize answer, max, and min trackers.</li>
    <li><b>Line 6-8:</b> Loop array starting from second element. If current element is negative, swap min and max trackers.</li>
    <li><b>Line 9-11:</b> Calculate new max and min products, maximize answer product.</li>
    <li><b>Line 12:</b> Return answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 न्यूनतम और अधिकतम गुणनफल ट्रैक करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">चूंकि दो ऋणात्मक अंकों का गुणनफल धनात्मक होता है, इसलिए प्रत्येक तत्व पर <code>curr_max</code> और <code>curr_min</code> दोनों को ट्रैक करें। ऋणात्मक तत्व आने पर उन्हें आपस में बदलें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        ans = nums[0]
        curr_max = nums[0]
        curr_min = nums[0]
        for i in range(1, len(nums)):
            x = nums[i]
            if x < 0:
                curr_max, curr_min = curr_min, curr_max
            curr_max = max(x, curr_max * x)
            curr_min = min(x, curr_min * x)
            ans = max(ans, curr_max)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [2, 3, -2, 4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - curr_max = 2, curr_min = 2 | ans = 2।<br/>
    - i = 1 (3): curr_max = max(3, 6) = 6 | ans = 6।<br/>
    - i = 2 (-2): ऋणात्मक है -> स्वैप -> curr_max = 3, curr_min = 6।<br/>
    &nbsp;&nbsp;• curr_max = max(-2, -6) = -2 | curr_min = max(-2, -12) = -12 | ans = 6।<br/>
    - परिणाम: 6।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> उत्तर, अधिकतम और न्यूनतम गुणनफल ट्रैकर्स को पहले तत्व से इनिशियलाइज़ करना।</li>
    <li><b>लाइन 6-8:</b> दूसरे तत्व से लूप चलाना। ऋणात्मक मान होने पर मिन और मैक्स ट्रैकर्स को बदलना।</li>
    <li><b>लाइन 9-11:</b> नया मैक्स और मिन गुणनफल मापना, उत्तर (ans) को अधिकतम से अपडेट करना।</li>
    <li><b>लाइन 12:</b> उत्तर लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75051c05bf5f0580b804b",
    title: "Best time to buy and sell stock Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Track Minimum Price)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Equivalent to Kadane's! Track <code>min_price</code> seen so far. If current price is lower, update <code>min_price</code>. Otherwise, update <code>max_profit</code> with the difference <code>price - min_price</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        min_price = prices[0]
        max_profit = 0
        for price in prices[1:]:
            if price < min_price:
                min_price = price
            else:
                max_profit = max(max_profit, price - min_price)
        return max_profit</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (prices = [7, 1, 5, 3, 6, 4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - min_price = 7, max_profit = 0.<br/>
    - price = 1 -> price < 7. Update min_price = 1.<br/>
    - price = 5 -> profit = 5 - 1 = 4. max_profit = max(0, 4) = 4.<br/>
    - price = 3 -> profit = 3 - 1 = 2. max_profit = 4.<br/>
    - price = 6 -> profit = 6 - 1 = 5. max_profit = max(4, 5) = 5.<br/>
    - Returns max profit 5. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maxProfit method signature.</li>
    <li><b>Line 3-4:</b> Return 0 if prices list is empty.</li>
    <li><b>Line 5-6:</b> Initialize trackers with first element.</li>
    <li><b>Line 7:</b> Loop prices starting from second day.</li>
    <li><b>Line 8-9:</b> If current price is cheaper, update min price tracker.</li>
    <li><b>Line 10-11:</b> Otherwise, calculate profit and maximize max profit.</li>
    <li><b>Line 12:</b> Return max profit.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (न्यूनतम मूल्य ट्रैक करना)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">कडाने के समान ही! अब तक का न्यूनतम मूल्य (<code>min_price</code>) ट्रैक करें। यदि वर्तमान मूल्य कम है, तो न्यूनतम मूल्य बदलें। अन्यथा, अंतर <code>price - min_price</code> से अधिकतम लाभ बदलें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        min_price = prices[0]
        max_profit = 0
        for price in prices[1:]:
            if price < min_price:
                min_price = price
            else:
                max_profit = max(max_profit, price - min_price)
        return max_profit</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (prices = [7, 1, 5, 3, 6, 4])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - min_price = 7, max_profit = 0।<br/>
    - price = 1 -> 1 < 7 -> min_price = 1।<br/>
    - price = 5 -> profit = 4 -> max_profit = 4।<br/>
    - price = 6 -> profit = 5 -> max_profit = 5।<br/>
    - अधिकतम लाभ 5 मिलता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> यदि एरे खाली है, तो 0 लौटाना।</li>
    <li><b>लाइन 5-6:</b> न्यूनतम मूल्य को पहले दिन की कीमत और अधिकतम लाभ को 0 रखना।</li>
    <li><b>लाइन 7:</b> दूसरे दिन से लूप चलाना।</li>
    <li><b>लाइन 8-9:</b> यदि आज की कीमत न्यूनतम मूल्य से कम है, तो न्यूनतम मूल्य को आज की कीमत पर बदलना।</li>
    <li><b>लाइन 10-11:</b> अन्यथा, आज की कीमत और न्यूनतम मूल्य के अंतर को अधिकतम लाभ से अपडेट करना।</li>
    <li><b>लाइन 12:</b> अधिकतम लाभ लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75051c05bf5f0580b804d",
    title: "Maximum sum rectangle (2D Kadane) Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Row Compression to 1D Kadane</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Convert 2D to 1D. Loop column bounds <code>left</code> and <code>right</code>. Keep <code>temp</code> prefix array of row sums. For each right shift, accumulate column values into temp array, and apply standard 1D Kadane to find max subarray sum in O(rows).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(Cols² * Rows) | 🧠 Space: O(Rows)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxSubMatrix(self, matrix: List[List[int]]) -> int:
        rows = len(matrix)
        cols = len(matrix[0])
        max_sum = float(\'-inf\')
        for left in range(cols):
            temp = [0] * rows
            for right in range(left, cols):
                for r in range(rows):
                    temp[r] += matrix[r][right]
                
                # Standard 1D Kadane
                curr_max = temp[0]
                run_max = temp[0]
                for val in temp[1:]:
                    curr_max = max(val, curr_max + val)
                    run_max = max(run_max, curr_max)
                max_sum = max(max_sum, run_max)
        return max_sum</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maxSubMatrix method signature.</li>
    <li><b>Line 3-5:</b> Fetch rows, cols, and initialize global minimum max_sum.</li>
    <li><b>Line 6:</b> Outer loop selects left column boundary.</li>
    <li><b>Line 7:</b> Initialize temp array of size rows to accumulate sum.</li>
    <li><b>Line 8:</b> Inner loop selects right column boundary.</li>
    <li><b>Line 9-10:</b> Add current column values to temp row sum array.</li>
    <li><b>Line 12-18:</b> Standard 1D Kadane over row sums temp array.</li>
    <li><b>Line 19:</b> Maximize global max_sum with circular values.</li>
    <li><b>Line 20:</b> Return global max sum.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 पंक्ति संपीड़न नियम (Row Compression)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">2D को 1D समस्या में बदलें। कॉलम सीमाओं <code>left</code> और <code>right</code> पर लूप चलाएं। रो-योग के लिए <code>temp</code> एरे रखें। प्रत्येक दाईं ओर खिसकाव के लिए, temp एरे में कॉलम मानों को संचित करें, और 1D कडाने चलाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(Cols² * Rows) | 🧠 स्थान: O(Rows)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxSubMatrix(self, matrix: List[List[int]]) -> int:
        rows = len(matrix)
        cols = len(matrix[0])
        max_sum = float(\'-inf\')
        for left in range(cols):
            temp = [0] * rows
            for right in range(left, cols):
                for r in range(rows):
                    temp[r] += matrix[r][right]
                
                # Standard 1D Kadane
                curr_max = temp[0]
                run_max = temp[0]
                for val in temp[1:]:
                    curr_max = max(val, curr_max + val)
                    run_max = max(run_max, curr_max)
                max_sum = max(max_sum, run_max)
        return max_sum</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> पंक्तियों और स्तंभों की संख्या ज्ञात करना, और वैश्विक न्यूनतम (max_sum) घोषित करना।</li>
    <li><b>लाइन 6:</b> बाहरी लूप बाएं कॉलम (left) की सीमा तय करता है।</li>
    <li><b>लाइन 7:</b> रो-योग के लिए temp एरे बनाना।</li>
    <li><b>लाइन 8:</b> आंतरिक लूप दाएं कॉलम (right) की सीमा तय करता है।</li>
    <li><b>लाइन 9-10:</b> वर्तमान कॉलम के मानों को temp एरे में पंक्तिवार जोड़ना।</li>
    <li><b>लाइन 12-18:</b> temp एरे पर मानक 1D कडाने एल्गोरिथ्म लागू करना।</li>
    <li><b>लाइन 19:</b> वैश्विक max_sum को अपडेट करना।</li>
    <li><b>लाइन 20:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75051c05bf5f0580b804f",
    title: "Maximum subarray sum with one deletion Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Maintaining Two State Trackers</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain two DP state values:
      - <code>no_deletion</code>: standard Kadane sum ending at i.
      - <code>one_deletion</code>: max sum ending at i with at most one element deleted. This can either be deleting current element (uses previous no_deletion) or deleting a prior element (uses previous one_deletion + current element).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximumSum(self, arr: List[int]) -> int:
        n = len(arr)
        no_deletion = arr[0]
        one_deletion = 0
        ans = arr[0]
        for i in range(1, n):
            x = arr[i]
            one_deletion = max(no_deletion, one_deletion + x)
            no_deletion = max(x, no_deletion + x)
            ans = max(ans, no_deletion, one_deletion)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maximumSum method parameters signature.</li>
    <li><b>Line 3-6:</b> Setup variables. Initialize trackers and answer with first element.</li>
    <li><b>Line 7:</b> Loop array starting from second element.</li>
    <li><b>Line 8-9:</b> Compute new one_deletion sum using previous no_deletion, then update standard no_deletion.</li>
    <li><b>Line 10:</b> Maximize global answer with current states.</li>
    <li><b>Line 11:</b> Return answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 दो अवस्थाओं (States) का प्रबंधन</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दो DP अवस्था मान बनाए रखें:
      - <code>no_deletion</code>: i पर समाप्त होने वाला मानक कडाने योग।
      - <code>one_deletion</code>: अधिकतम एक तत्व हटाकर योग। यह वर्तमान तत्व को हटाने (no_deletion का उपयोग) या पिछले हटाए गए के साथ आगे बढ़ने (one_deletion + x) के बराबर है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximumSum(self, arr: List[int]) -> int:
        n = len(arr)
        no_deletion = arr[0]
        one_deletion = 0
        ans = arr[0]
        for i in range(1, n):
            x = arr[i]
            one_deletion = max(no_deletion, one_deletion + x)
            no_deletion = max(x, no_deletion + x)
            ans = max(ans, no_deletion, one_deletion)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-6:</b> वेरिएबल्स, पहले तत्व से इनिशियलाइज़ करना।</li>
    <li><b>लाइन 7:</b> दूसरे इंडेक्स से लूप चलाना।</li>
    <li><b>लाइन 8-9:</b> एक तत्व हटाने (one_deletion) और बिना हटाए (no_deletion) के सूत्रों से अवस्थाओं को अपडेट करना।</li>
    <li><b>लाइन 10:</b> उत्तर (ans) को दोनों में से अधिकतम से अपडेट करना।</li>
    <li><b>लाइन 11:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75051c05bf5f0580b8051",
    title: "K concatenation maximum sum Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Replicating K times</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Construct array of size N*K. Standard Kadane over large array. Causes Memory Limit Exceeded.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N * K) | 🧠 Space: O(N * K)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two-Concatenation Kadane with sum multiplication)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">If k=1, standard Kadane.
      If k > 1:
      - If total array sum is positive, result is Kadane sum over 2 arrays + <code>(k - 2) * total_sum</code>.
      - If total array sum is negative, result is simply Kadane sum over 2 arrays.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def kConcatenationMaxSum(self, arr: List[int], k: int) -> int:
        MOD = 10**9 + 7
        
        def kadane(nums):
            curr = 0
            ans = 0
            for x in nums:
                curr = max(x, curr + x)
                ans = max(ans, curr)
            return ans
            
        if k == 1:
            return kadane(arr) % MOD
        
        total_sum = sum(arr)
        ans_2 = kadane(arr * 2)
        if total_sum > 0:
            return (ans_2 + (k - 2) * total_sum) % MOD
        else:
            return ans_2 % MOD</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and method parameters signature. MOD constant setup.</li>
    <li><b>Line 5-11:</b> Helper Kadane function definition.</li>
    <li><b>Line 13-14:</b> If k == 1, return single array Kadane.</li>
    <li><b>Line 16-17:</b> Compute total array sum and Kadane over 2 concatenations.</li>
    <li><b>Line 18-21:</b> If total sum is positive, add (k-2)*total_sum to the 2-concatenation answer, else return 2-concatenation answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 K बार एरे कॉपी करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">N*K साइज का एक बहुत बड़ा एरे बनाना और उसपर कडाने चलाना। मेमोरी सीमा (Memory Limit Exceeded) का कारण बनता है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N * K) | 🧠 स्थान: O(N * K)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (2-Concatenation Kadane)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">यदि k=1, तो मानक कडाने।
      यदि k > 1:
      - यदि एरे का कुल योग धनात्मक है, तो 2 एरे पर कडाने का परिणाम + <code>(k - 2) * total_sum</code>।
      - यदि कुल योग ऋणात्मक है, तो केवल 2 एरे पर कडाने का परिणाम।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def kConcatenationMaxSum(self, arr: List[int], k: int) -> int:
        MOD = 10**9 + 7
        
        def kadane(nums):
            curr = 0
            ans = 0
            for x in nums:
                curr = max(x, curr + x)
                ans = max(ans, curr)
            return ans
            
        if k == 1:
            return kadane(arr) % MOD
        
        total_sum = sum(arr)
        ans_2 = kadane(arr * 2)
        if total_sum > 0:
            return (ans_2 + (k - 2) * total_sum) % MOD
        else:
            return ans_2 % MOD</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> क्लास और फ़ंक्शन घोषणा, मोड नियतांक (MOD) सेट करना।</li>
    <li><b>लाइन 5-11:</b> सहायक कडाने फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 13-14:</b> यदि k == 1 है, तो एकल एरे का कडाने मान मोड करके लौटाना।</li>
    <li><b>लाइन 16-17:</b> एरे का कुल योग और 2 बार जोड़े गए एरे का कडाने मान (ans_2) मापना।</li>
    <li><b>लाइन 18-21:</b> यदि कुल योग धनात्मक है, तो <code>(k - 2) * total_sum</code> जोड़कर लौटाना, अन्यथा केवल ans_2 को मोड करके लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75051c05bf5f0580b8053",
    title: "Maximum alternating subarray sum Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Alternating Sign States</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain two dynamic state sum trackers:
      - <code>even_sum</code>: max sum ending at current index at an even position in sequence (with plus sign).
      - <code>odd_sum</code>: max sum ending at current index at an odd position in sequence (with minus sign).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxAlternatingSum(self, nums: List[int]) -> int:
        even_sum = nums[0]
        odd_sum = float(\'-inf\')
        ans = nums[0]
        for x in nums[1:]:
            next_even = max(x, odd_sum + x)
            next_odd = even_sum - x
            even_sum, odd_sum = next_even, next_odd
            ans = max(ans, even_sum, odd_sum)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maxAlternatingSum method parameters.</li>
    <li><b>Line 3-5:</b> Initialize even tracker with first element, odd tracker as -inf, and global max ans.</li>
    <li><b>Line 6:</b> Loop array starting from second day.</li>
    <li><b>Line 7-8:</b> Calculate transitioning states (plus vs minus sign).</li>
    <li><b>Line 9-10:</b> Update trackers and maximize global answer.</li>
    <li><b>Line 11:</b> Return answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 वैकल्पिक चिह्नों (Alternating Signs) का प्रबंधन</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दो गत्यात्मक योग ट्रैकर्स बनाए रखें:
      - <code>even_sum</code>: वर्तमान इंडेक्स पर सम (even) स्थिति पर समाप्त होने वाला अधिकतम योग (धनात्मक चिह्न के साथ)।
      - <code>odd_sum</code>: वर्तमान इंडेक्स पर विषम (odd) स्थिति पर समाप्त होने वाला अधिकतम योग (ऋणात्मक चिह्न के साथ)।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxAlternatingSum(self, nums: List[int]) -> int:
        even_sum = nums[0]
        odd_sum = float(\'-inf\')
        ans = nums[0]
        for x in nums[1:]:
            next_even = max(x, odd_sum + x)
            next_odd = even_sum - x
            even_sum, odd_sum = next_even, next_odd
            ans = max(ans, even_sum, odd_sum)
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> even_sum को पहले तत्व, odd_sum को -इन्फिनिटी और वैश्विक उत्तर (ans) को पहले तत्व पर रखना।</li>
    <li><b>लाइन 6:</b> दूसरे तत्व से लूप चलाना।</li>
    <li><b>लाइन 7-8:</b> संक्रमण सूत्रों के अनुसार सम और विषम अवस्थाओं को मापना।</li>
    <li><b>लाइन 9-10:</b> ट्रैकर्स को अपडेट करना और उत्तर (ans) को अधिकतम से अपडेट करना।</li>
    <li><b>लाइन 11:</b> अधिकतम वैकल्पिक योग लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75051c05bf5f0580b8055",
    title: "Largest sum of averages Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 DP State Transition Averages</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Let <code>dp[i]</code> represent the maximum sum of averages for subarrays from index i to end. To transition to <code>k</code> partitions, loop possible partition boundaries: <code>dp[i] = max(dp[i], average(i, j) + dp[j])</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(K * N²) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def largestSumOfAverages(self, nums: List[int], k: int) -> float:
        n = len(nums)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i+1] = prefix[i] + nums[i]
            
        def average(i, j):
            return (prefix[j] - prefix[i]) / (j - i)
            
        dp = [average(i, n) for i in range(n)]
        for _ in range(k - 1):
            for i in range(n):
                for j in range(i + 1, n):
                    dp[i] = max(dp[i], average(i, j) + dp[j])
        return dp[0]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and largestSumOfAverages method parameters.</li>
    <li><b>Line 3-6:</b> Create prefix sum list to fetch range sums in O(1).</li>
    <li><b>Line 8-9:</b> Define average helper function.</li>
    <li><b>Line 11:</b> Initialize DP list with base cases (1 partition avg to end).</li>
    <li><b>Line 12:</b> Loop partitions from 1 to k-1.</li>
    <li><b>Line 13-15:</b> Nested loops compute optimal splits. Update DP list.</li>
    <li><b>Line 16:</b> Return first index representing full array result.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 DP अवस्था संक्रमण औसत नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;"><code>dp[i]</code> को इंडेक्स i से अंत तक के सबएरे के औसत के अधिकतम योग का प्रतिनिधित्व करने दें। <code>k</code> विभाजनों पर संक्रमण करने के लिए, विभाजन सीमाओं पर लूप करें: <code>dp[i] = max(dp[i], average(i, j) + dp[j])</code>।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(K * N²) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def largestSumOfAverages(self, nums: List[int], k: int) -> float:
        n = len(nums)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i+1] = prefix[i] + nums[i]
            
        def average(i, j):
            return (prefix[j] - prefix[i]) / (j - i)
            
        dp = [average(i, n) for i in range(n)]
        for _ in range(k - 1):
            for i in range(n):
                for j in range(i + 1, n):
                    dp[i] = max(dp[i], average(i, j) + dp[j])
        return dp[0]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-6:</b> ओ(1) समय में योग खोजने के लिए प्रीफिक्स सम एरे घोषित करना।</li>
    <li><b>लाइन 8-9:</b> औसत की गणना करने वाला सहायक फ़ंक्शन (average)।</li>
    <li><b>लाइन 11:</b> डीपी लिस्ट (dp) को बेस केस औसत से इनिशियलाइज़ करना।</li>
    <li><b>लाइन 12:</b> 1 से k-1 विभाजन तक बाहरी लूप चलाना।</li>
    <li><b>लाइन 13-15:</b> विभाजनों के लिए नेस्टेड लूप चलाना और dp मान अपडेट करना।</li>
    <li><b>लाइन 16:</b> पूरे एरे के परिणाम का पहला इंडेक्स (dp[0]) लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75051c05bf5f0580b8057",
    title: "Maximum difference problem Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Track Minimum Element)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Identical to Buy and Sell stock! Track <code>min_val</code> seen so far. If current element is larger, calculate difference and update max difference.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximumDifference(self, nums: List[int]) -> int:
        min_val = nums[0]
        max_diff = -1
        for x in nums[1:]:
            if x > min_val:
                max_diff = max(max_diff, x - min_val)
            else:
                min_val = x
        return max_diff</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maximumDifference method parameters.</li>
    <li><b>Line 3-4:</b> Initialize minimum value with first element and difference tracker with -1.</li>
    <li><b>Line 5:</b> Loop elements starting from second element.</li>
    <li><b>Line 6-7:</b> If current element is larger than minimum, update max difference.</li>
    <li><b>Line 8-9:</b> Otherwise, current element is the new minimum. Update tracker.</li>
    <li><b>Line 10:</b> Return max difference.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (न्यूनतम तत्व ट्रैक करना)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">स्टॉक खरीदने और बेचने के समान ही! अब तक का न्यूनतम मान (<code>min_val</code>) ट्रैक करें। यदि वर्तमान तत्व बड़ा है, तो अंतर मापकर अधिकतम अंतर को अपडेट करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximumDifference(self, nums: List[int]) -> int:
        min_val = nums[0]
        max_diff = -1
        for x in nums[1:]:
            if x > min_val:
                max_diff = max(max_diff, x - min_val)
            else:
                min_val = x
        return max_diff</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> न्यूनतम मान को पहले तत्व और अधिकतम अंतर को -1 रखना।</li>
    <li><b>लाइन 5:</b> दूसरे तत्व से लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> यदि वर्तमान तत्व न्यूनतम से बड़ा है, तो अधिकतम अंतर को अपडेट करना।</li>
    <li><b>लाइन 8-9:</b> अन्यथा, वर्तमान तत्व को न्यूनतम मान पर सेट करना।</li>
    <li><b>लाइन 10:</b> अधिकतम अंतर लौटाना।</li>
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
    
    console.log("Cleaning up old seeded Kadane notes...");
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
        tags: ["Kadanes-Algorithm", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed Kadane notes...`);
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
