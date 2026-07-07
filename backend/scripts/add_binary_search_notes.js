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
const parentTaskId = "6a30ea665fb08c29755f7fc7";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #1e3a8a; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #bfdbfe; padding-bottom: 6px; margin-top: 0;">📐 Binary Search Identification Blueprint</h3>
  
  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #1d4ed8; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Binary Search Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5;">
      You should apply Binary Search when the problem involves checking conditions on sorted elements, searching in arrays with localized symmetry (like rotated sorted arrays), finding bounds of values, or optimization constraints. Also key when optimization involves "minimizing the maximum" or "maximizing the minimum".
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
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">Standard / Index Search</td>
          <td style="padding: 6px 4px;">Narrow boundaries <code>left <= right</code>. Check mid element and adjust pointers.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">Rotated Sorted Arrays</td>
          <td style="padding: 6px 4px;">Determine sorted half by comparing <code>nums[left] <= nums[mid]</code>. Apply standard ranges.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">Binary Search on Answer</td>
          <td style="padding: 6px 4px;">Determine bounds <code>[min_ans, max_ans]</code>. Evaluate viability with O(N) helper function <code>isPossible(mid)</code>.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">Array Partition Splits</td>
          <td style="padding: 6px 4px;">Binary search partition coordinates of smaller array to balance elements symmetrically.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #1e3a8a; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #bfdbfe; padding-bottom: 6px; margin-top: 0;">📐 बाइनरी सर्च पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #1d4ed8; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 बाइनरी सर्च समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5;">
      आपको बाइनरी सर्च लागू करना चाहिए जब समस्या में सॉर्ट किए गए तत्वों पर शर्तों की जांच करना, स्थानीय समरूपता (जैसे घुमाए गए सॉर्ट किए गए एरे) में खोजना, मानों की सीमाएं खोजना, या अनुकूलन बाधाएं (जैसे "अधिकतम मान को न्यूनतम करना" या "न्यूनतम मान को अधिकतम करना") शामिल हों।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य बाइनरी सर्च श्रेणियां</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">समस्या श्रेणी</th>
          <th style="padding: 6px 4px; font-weight: 700;">मुख्य प्रक्रिया / लूप</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">मानक / इंडेक्स सर्च</td>
          <td style="padding: 6px 4px;">सीमाओं को संकीर्ण करें <code>left <= right</code>। मध्य तत्व की जाँच करें और पॉइंटर्स बदलें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">घुमाए गए (Rotated) एरे</td>
          <td style="padding: 6px 4px;"><code>nums[left] <= nums[mid]</code> की तुलना करके यह निर्धारित करें कि कौन सा आधा भाग सॉर्टेड है।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">उत्तर पर बाइनरी सर्च</td>
          <td style="padding: 6px 4px;">खोज सीमा <code>[min_ans, max_ans]</code> तय करें। O(N) हेल्पर फ़ंक्शन <code>isPossible(mid)</code> के साथ व्यवहार्यता जांचें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #1d4ed8;">एरे विभाजन (Partition)</td>
          <td style="padding: 6px 4px;">समतुल्य सममिति बनाए रखने के लिए छोटे एरे के विभाजन सूचकांकों पर बाइनरी सर्च करें।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Binary Search Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Binary-Search", "Optimization", "Arrays", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "6a30ea665fb08c29755f7fc9",
    title: "Find First and Last Position of Element in Sorted Array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Iterate from left to find first index, then from right to find last index.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Binary Search)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Perform two binary searches. One searches leftmost index (shift right boundary to left on match), the other searches rightmost index (shift left boundary to right on match).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(log N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def findBound(isFirst):
            left, right = 0, len(nums) - 1
            ans = -1
            while left <= right:
                mid = (left + right) // 2
                if nums[mid] == target:
                    ans = mid
                    if isFirst:
                        right = mid - 1
                    else:
                        left = mid + 1
                elif nums[mid] < target:
                    left = mid + 1
                else:
                    right = mid - 1
            return ans
        return [findBound(True), findBound(False)]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [5, 7, 7, 8, 8, 10], target = 8)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Leftmost (isFirst = True):<br/>
    &nbsp;&nbsp;• left=0, right=5, mid=2 (nums[2]=7 < 8) -> left = 3.<br/>
    &nbsp;&nbsp;• left=3, right=5, mid=4 (nums[4]=8 == target) -> ans = 4, right = 3.<br/>
    &nbsp;&nbsp;• left=3, right=3, mid=3 (nums[3]=8 == target) -> ans = 3, right = 2.<br/>
    &nbsp;&nbsp;• Ends. Returns leftmost index 3.<br/>
    - Rightmost (isFirst = False):<br/>
    &nbsp;&nbsp;• left=0, right=5, mid=2 (nums[2]=7 < 8) -> left = 3.<br/>
    &nbsp;&nbsp;• left=3, right=5, mid=4 (nums[4]=8 == target) -> ans = 4, left = 5.<br/>
    &nbsp;&nbsp;• left=5, right=5, mid=5 (nums[5]=10 > 8) -> right = 4.<br/>
    &nbsp;&nbsp;• Ends. Returns rightmost index 4.<br/>
    - Final result: <code>[3, 4]</code> (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and main method signature.</li>
    <li><b>Line 4:</b> Nested function findBound parameterizing search boundary target.</li>
    <li><b>Line 5-6:</b> Set search pointers left and right, initial boundary ans = -1.</li>
    <li><b>Line 7:</b> Run binary search loop.</li>
    <li><b>Line 9-11:</b> On matching target, record index and shift leftward (right = mid - 1) if finding start.</li>
    <li><b>Line 12-14:</b> On matching target, shift rightward (left = mid + 1) if finding end.</li>
    <li><b>Line 15-18:</b> Standard binary search pointer updates.</li>
    <li><b>Line 20:</b> Return start and end positions array.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 ब्रूट फ़ोर्स दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">शुरुआती इंडेक्स के लिए बाएं से और अंतिम इंडेक्स के लिए दाएं से रैखिक खोज (Linear Search) करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Binary Search)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दो स्वतंत्र बाइनरी सर्च करें। पहला सबसे बायां (leftmost) स्थान खोजेगा, और दूसरा सबसे दायां (rightmost) स्थान खोजेगा।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(log N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def findBound(isFirst):
            left, right = 0, len(nums) - 1
            ans = -1
            while left <= right:
                mid = (left + right) // 2
                if nums[mid] == target:
                    ans = mid
                    if isFirst:
                        right = mid - 1
                    else:
                        left = mid + 1
                elif nums[mid] < target:
                    left = mid + 1
                else:
                    right = mid - 1
            return ans
        return [findBound(True), findBound(False)]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [5, 7, 7, 8, 8, 10], target = 8)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - शुरुआती सूचकांक खोजना (isFirst = True):<br/>
    &nbsp;&nbsp;• left=0, right=5, mid=2 (nums[2]=7 < 8) -> left = 3.<br/>
    &nbsp;&nbsp;• left=3, right=5, mid=4 (nums[4]=8 == 8) -> ans = 4, right = 3.<br/>
    &nbsp;&nbsp;• left=3, right=3, mid=3 (nums[3]=8 == 8) -> ans = 3, right = 2.<br/>
    &nbsp;&nbsp;• लूप समाप्त। सबसे बायां इंडेक्स = 3 मिला।<br/>
    - परिणाम: <code>[3, 4]</code>
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> मुख्य क्लास और बाउंड्स फन्क्शन घोषणा।</li>
    <li><b>लाइन 4:</b> इनर हेल्पर फ़ंक्शन <code>findBound</code> की घोषणा।</li>
    <li><b>लाइन 5-6:</b> बाउंड्री पॉइंटर्स और डिफ़ॉल्ट उत्तर <code>ans = -1</code> सेट करना।</li>
    <li><b>लाइन 7:</b> बाइनरी सर्च के लिए लूप।</li>
    <li><b>लाइन 9-11:</b> मान मिलने पर उसे <code>ans</code> में सहेजें, और बायां भाग खोजने के लिए दाईं सीमा घटाएं।</li>
    <li><b>लाइन 12-14:</b> दायां भाग खोजने के लिए बाईं सीमा बढ़ाएं।</li>
    <li><b>लाइन 15-18:</b> सामान्य सर्च रेंज पॉइंटर्स अपडेट।</li>
    <li><b>लाइन 20:</b> शुरुआती और अंतिम सीमा लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fcb",
    title: "Search in Rotated Sorted Array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Linear Search</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Traverse array. Disregards sorted structure.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Modified Binary Search)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">In a rotated sorted array, one half is always sorted. Identify the sorted half. Check if target lies in sorted range, and discard the other half.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(log N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [4, 5, 6, 7, 0, 1, 2], target = 0)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left=0, right=6, mid=3 (nums[3] = 7).<br/>
    &nbsp;&nbsp;• nums[0] <= nums[3] (4 <= 7) -> Left half is sorted.<br/>
    &nbsp;&nbsp;• Is target in range [4, 7)? No. Pointers move: left = mid + 1 = 4.<br/>
    - left=4, right=6, mid=5 (nums[5] = 1).<br/>
    &nbsp;&nbsp;• nums[4] <= nums[5] (0 <= 1) -> Left half is sorted.<br/>
    &nbsp;&nbsp;• Is target in range [0, 1)? Yes! (0 <= 0 < 1). Pointers move: right = mid - 1 = 4.<br/>
    - left=4, right=4, mid=4 (nums[4] = 0). Matches target. Returns index 4. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Function setup, pointers start and end indices initialization.</li>
    <li><b>Line 4:</b> Loop runs while boundaries are valid (left <= right).</li>
    <li><b>Line 5-7:</b> Midpoint calculation. Return midpoint index if matched.</li>
    <li><b>Line 8:</b> check if left half is sorted (nums[left] <= nums[mid]).</li>
    <li><b>Line 9-12:</b> If left half is sorted, check if target lies inside it. If yes, search left; else, search right.</li>
    <li><b>Line 13-17:</b> Right half must be sorted. Check if target lies inside right half. If yes, search right; else search left.</li>
    <li><b>Line 18:</b> Return -1 on target not found.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 लीनियर सर्च</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">पूरे एरे को सामान्य लूप से स्कैन करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Modified Binary Search)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">घुमाए गए एरे का कोई एक भाग हमेशा सॉर्टेड रहता है। जांचें कि कौन सा हिस्सा सॉर्टेड है। यदि टारगेट उस सॉर्टेड रेंज के भीतर आता है, तो केवल उसी हिस्से में खोजें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(log N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [4, 5, 6, 7, 0, 1, 2], target = 0)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left=0, right=6, mid=3 (nums[3] = 7)।<br/>
    &nbsp;&nbsp;• 4 <= 7 -> बायां भाग सॉर्टेड है।<br/>
    &nbsp;&nbsp;• क्या 0 रेंज [4, 7) में है? नहीं। बाएं खिसकें: left = mid + 1 = 4।<br/>
    - left=4, right=6, mid=5 (nums[5] = 1)।<br/>
    &nbsp;&nbsp;• 0 <= 1 -> बायां भाग सॉर्टेड है।<br/>
    &nbsp;&nbsp;• क्या 0 रेंज [0, 1) में है? हाँ। दाएं खिसकें: right = mid - 1 = 4।<br/>
    - left=4, right=4, mid=4 (nums[4]=0) टारगेट से मेल खाता है। इंडेक्स 4 लौटें।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> इनपुट एरे के पॉइंटर्स घोषित करना।</li>
    <li><b>लाइन 4:</b> बाइनरी लूप रन करना।</li>
    <li><b>लाइन 5-7:</b> मध्य पद जांच। मेल होने पर इंडेक्स लौटना।</li>
    <li><b>लाइन 8:</b> जांचना कि क्या बायां आधा हिस्सा सॉर्टेड है।</li>
    <li><b>लाइन 9-12:</b> यदि हां, तो क्या टारगेट इसी रेंज में है। तदनुसार सीमाओं को सिकोड़ना।</li>
    <li><b>लाइन 13-17:</b> अन्यथा, दायां आधा भाग सॉर्टेड होगा। टारगेट की रेंज के अनुसार पॉइंटर अपडेट करना।</li>
    <li><b>लाइन 18:</b> नहीं मिलने पर -1 लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fcd",
    title: "Find Minimum in Rotated Sorted Array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Linear Iteration</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Find minimum by comparing each element linearly.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Binary Search Inflection Point)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">If <code>nums[mid] > nums[right]</code>, the minimum element lies in the right half. Otherwise, it lies in the left half including mid (<code>right = mid</code>).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(log N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1
        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            else:
                right = mid
        return nums[left]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [3, 4, 5, 1, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left=0, right=4, mid=2 (nums[2] = 5).<br/>
    &nbsp;&nbsp;• nums[mid] > nums[right] (5 > 2) -> Inflection point lies in right half. Pointers shift: left = mid + 1 = 3.<br/>
    - left=3, right=4, mid=3 (nums[3] = 1).<br/>
    &nbsp;&nbsp;• nums[mid] <= nums[right] (1 <= 2) -> Minimum is mid or to the left. Pointers shift: right = mid = 3.<br/>
    - Loop ends (left == right == 3). Returns nums[3] = 1. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and findMin function with search boundaries left and right.</li>
    <li><b>Line 4:</b> Loop runs while boundaries don't overlap (left < right).</li>
    <li><b>Line 5:</b> Calculate midpoint index.</li>
    <li><b>Line 6-7:</b> If mid value exceeds rightmost value, search right (left = mid + 1).</li>
    <li><b>Line 8-9:</b> Otherwise, minimum must be mid or on the left. Set right = mid.</li>
    <li><b>Line 10:</b> Return minimum value found at index left.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 लीनियर खोज</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सारे तत्वों की एक-एक करके तुलना कर न्यूनतम ज्ञात करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Inflection Point Binary Search)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">यदि <code>nums[mid] > nums[right]</code> है, तो इसका अर्थ है कि न्यूनतम संख्या दाईं ओर स्थित है। अन्यथा, न्यूनतम संख्या बाईं ओर (समेत mid) होगी।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(log N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1
        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            else:
                right = mid
        return nums[left]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [3, 4, 5, 1, 2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left=0, right=4, mid=2 (nums[2] = 5)।<br/>
    &nbsp;&nbsp;• nums[mid] > nums[right] (5 > 2) -> न्यूनतम संख्या दाईं तरफ है। Pointers: left = mid + 1 = 3।<br/>
    - left=3, right=4, mid=3 (nums[3] = 1)।<br/>
    &nbsp;&nbsp;• 1 <= 2 -> न्यूनतम संख्या mid या बाईं तरफ है। Pointers: right = mid = 3।<br/>
    - लूप समाप्त। न्यूनतम संख्या = 1।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> इनपुट रेंज वेरिएबल्स बनाना।</li>
    <li><b>लाइन 4:</b> लूप रन करना जब तक <code>left < right</code> हो।</li>
    <li><b>लाइन 5:</b> बीच का इंडेक्स मापना।</li>
    <li><b>लाइन 6-7:</b> यदि मध्य मान दाईं सीमा से बड़ा है, तो बाएं पॉइंटर को आगे बढ़ाएं।</li>
    <li><b>लाइन 8-9:</b> अन्यथा, दाईं सीमा को बीच (mid) पर सिकोड़ें।</li>
    <li><b>लाइन 10:</b> न्यूनतम मान लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fcf",
    title: "Koko Eating Bananas Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Binary Search on Answer</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">The eating speed <code>K</code> ranges from <code>1</code> to <code>max(piles)</code>. For each speed, calculate hours: <code>sum(ceil(pile / speed))</code>. If total hours <= <code>H</code>, it's feasible. Search left for smaller speeds.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log(MaxPile)) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import math
class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left = 1
        right = max(piles)
        ans = right
        while left <= right:
            mid = (left + right) // 2
            hours = 0
            for pile in piles:
                hours += math.ceil(pile / mid)
            if hours <= h:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (piles = [3, 6, 7, 11], h = 8)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Range limits: left = 1, right = 11. Initial ans = 11.<br/>
    - Try speed <code>mid = 6</code>:<br/>
    &nbsp;&nbsp;• hours = ceil(3/6) + ceil(6/6) + ceil(7/6) + ceil(11/6) = 1 + 1 + 2 + 2 = 6.<br/>
    &nbsp;&nbsp;• 6 hours <= 8 -> Feasible. Update ans = 6, search smaller: right = 5.<br/>
    - Try speed <code>mid = 3</code>:<br/>
    &nbsp;&nbsp;• hours = ceil(3/3) + ceil(6/3) + ceil(7/3) + ceil(11/3) = 1 + 2 + 3 + 4 = 10.<br/>
    &nbsp;&nbsp;• 10 hours > 8 -> Too slow. Increase speed: left = 4.<br/>
    - Try speed <code>mid = 4</code>:<br/>
    &nbsp;&nbsp;• hours = ceil(3/4) + ceil(6/4) + ceil(7/4) + ceil(11/4) = 1 + 2 + 2 + 3 = 8.<br/>
    &nbsp;&nbsp;• 8 hours <= 8 -> Feasible. Update ans = 4, right = 3.<br/>
    - Returns optimal speed 4. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Import math library, declare Solution class and minEatingSpeed function.</li>
    <li><b>Line 4-6:</b> Speed range bounds left = 1, right = max pile size, initial ans.</li>
    <li><b>Line 7:</b> Run binary search loop.</li>
    <li><b>Line 8:</b> Calculate eating speed mid.</li>
    <li><b>Line 9-11:</b> Compute total hours spent at eating speed mid.</li>
    <li><b>Line 12-14:</b> If hours <= h, save speed as feasible and try lower speed (right = mid - 1).</li>
    <li><b>Line 15-16:</b> If hours > h, speed is too slow. Increase speed (left = mid + 1).</li>
    <li><b>Line 17:</b> Return final optimized minimum speed.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 उत्तर पर बाइनरी सर्च</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">खाने की गति <code>K</code>, <code>1</code> से <code>max(piles)</code> तक हो सकती है। हर एक गति के लिए घंटे की गणना करें: <code>sum(ceil(pile / speed))</code>। यदि कुल घंटे <= H हैं, तो वह संभव है। गति कम करके बाईं तरफ खोजें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log(MaxPile)) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import math
class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left = 1
        right = max(piles)
        ans = right
        while left <= right:
            mid = (left + right) // 2
            hours = 0
            for pile in piles:
                hours += math.ceil(pile / mid)
            if hours <= h:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (piles = [3, 6, 7, 11], h = 8)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सीमाएं: left = 1, right = 11।<br/>
    - गति <code>mid = 6</code> की जांच:<br/>
    &nbsp;&nbsp;• कुल घंटे = ceil(3/6) + ceil(6/6) + ceil(7/6) + ceil(11/6) = 1+1+2+2 = 6 घंटे।<br/>
    &nbsp;&nbsp;• 6 <= 8 (संभव है) -> ans = 6 सेट करें, जांच बाईं तरफ बढ़ाएं: right = 5।<br/>
    - गति <code>mid = 3</code> की जांच:<br/>
    &nbsp;&nbsp;• घंटे = 1+2+3+4 = 10 घंटे। 10 > 8 (असंभव) -> left = 4।<br/>
    - गति <code>mid = 4</code> की जांच:<br/>
    &nbsp;&nbsp;• घंटे = 1+2+2+3 = 8 घंटे। 8 <= 8 (संभव) -> ans = 4, right = 3।<br/>
    - न्यूनतम गति 4 मिली।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> गणित मॉड्यूल इम्पोर्ट करना और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4-6:</b> गति की सीमा <code>left = 1</code> से सबसे बड़े ढेर के आकार <code>max(piles)</code> तक बनाना।</li>
    <li><b>लाइन 7:</b> बाइनरी सर्च लूप।</li>
    <li><b>लाइन 8:</b> वर्तमान गति <code>mid</code> की गणना।</li>
    <li><b>लाइन 9-11:</b> इस गति से सभी केले खाने में लगे कुल समय की गणना।</li>
    <li><b>लाइन 12-14:</b> यदि समय सीमा के भीतर है, तो उसे सहेजें और कम गति का प्रयास करें।</li>
    <li><b>लाइन 15-16:</b> यदि अधिक समय लगा, तो गति सीमा बढ़ाएं।</li>
    <li><b>लाइन 17:</b> अंतिम गति परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fd1",
    title: "Capacity to Ship Packages Within D Days Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Binary Search on Answer Pattern</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">The search space for capacity is bounded between <code>max(weights)</code> (minimum capacity needed to carry largest package) and <code>sum(weights)</code> (capacity needed to ship all in 1 day). Traverse capacity space using binary search.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log(Sum - Max)) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def shipWithinDays(self, weights: List[int], days: int) -> int:
        left = max(weights)
        right = sum(weights)
        ans = right
        while left <= right:
            mid = (left + right) // 2
            current_weight = 0
            d = 1
            for w in weights:
                if current_weight + w > mid:
                    d += 1
                    current_weight = 0
                current_weight += w
            if d <= days:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Pointers: left = 10, right = 55. Initial ans = 55.<br/>
    - Try capacity <code>mid = 32</code>:<br/>
    &nbsp;&nbsp;• Days split: [1..5] (15) | [6..8] (21) | [9..10] (19) -> Needs 3 days.<br/>
    &nbsp;&nbsp;• 3 days <= 5 -> Feasible. Update ans = 32, right = 31.<br/>
    - Subproblems converge through binary splits until optimal capacity 15 is found.<br/>
    - Returns capacity 15. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and main method definition.</li>
    <li><b>Line 3-5:</b> Set search boundaries. Minimum capacity must carry the heaviest package, maximum carries all.</li>
    <li><b>Line 6:</b> Loop through search boundaries.</li>
    <li><b>Line 7:</b> Calculate mid capacity candidate.</li>
    <li><b>Line 8-9:</b> Initialize day trackers (d = 1).</li>
    <li><b>Line 10-14:</b> Accumulate weight of packages. Increment day count if capacity is exceeded.</li>
    <li><b>Line 15-17:</b> If day count fits requirements, save capacity and try smaller capacity limits (right = mid - 1).</li>
    <li><b>Line 18-19:</b> Capacity is too small. Shift search limits (left = mid + 1).</li>
    <li><b>Line 20:</b> Return optimal capacity.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 उत्तर पर बाइनरी सर्च पैटर्न</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">शिपिंग क्षमता की सीमाएं <code>max(weights)</code> (सबसे भारी पैकेट को उठाने के लिए आवश्यक न्यूनतम क्षमता) और <code>sum(weights)</code> (सभी पैकेट 1 दिन में भेजने की क्षमता) के बीच होती हैं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log(Sum - Max)) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def shipWithinDays(self, weights: List[int], days: int) -> int:
        left = max(weights)
        right = sum(weights)
        ans = right
        while left <= right:
            mid = (left + right) // 2
            current_weight = 0
            d = 1
            for w in weights:
                if current_weight + w > mid:
                    d += 1
                    current_weight = 0
                current_weight += w
            if d <= days:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सीमाएं: left = 10, right = 55।<br/>
    - क्षमता <code>mid = 32</code> की जांच:<br/>
    &nbsp;&nbsp;• दिन विभाजन: [1..5] (15) | [6..8] (21) | [9..10] (19) -> 3 दिन।<br/>
    &nbsp;&nbsp;• 3 <= 5 -> संभव है। ans = 32, right = 31।<br/>
    - बाइनरी सर्च के बाद अनुकूलतम क्षमता 15 प्राप्त होती है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> खोज सीमाएं स्थापित करना। न्यूनतम सीमा सबसे भारी पैकेट के वजन के समान और अधिकतम सीमा सभी के योग के समान होगी।</li>
    <li><b>लाइन 6:</b> बाइनरी खोज लूप।</li>
    <li><b>लाइन 7:</b> मध्य क्षमता मान मापना।</li>
    <li><b>लाइन 8-9:</b> दिन काउंटर और लोड संचयी वजन वेरिएबल्स शुरू करना।</li>
    <li><b>लाइन 10-14:</b> पैकेट के वजन जोड़ना। क्षमता से अधिक होने पर दिन 1 बढ़ाना।</li>
    <li><b>लाइन 15-17:</b> यदि दिन की सीमा अंदर है, तो क्षमता सहेजें और कम क्षमता का प्रयास करें।</li>
    <li><b>लाइन 18-19:</b> लोड क्षमता बहुत कम होने पर बाईं सीमा बढ़ाना।</li>
    <li><b>लाइन 20:</b> परिणामी क्षमता लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fd3",
    title: "Minimum Number of Days to Make m Bouquets Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Binary Search on Answer</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">We search the minimum day <code>D</code>. Bounded between 1 and <code>max(bloomDay)</code>. If total flowers needed <code>m * k</code> exceeds array size, it's impossible (return -1).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log(MaxDay)) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minDays(self, bloomDay: List[int], m: int, k: int) -> int:
        if m * k > len(bloomDay):
            return -1
        left = 1
        right = max(bloomDay)
        ans = -1
        while left <= right:
            mid = (left + right) // 2
            bouquets = 0
            flowers = 0
            for d in bloomDay:
                if d <= mid:
                    flowers += 1
                    if flowers == k:
                        bouquets += 1
                        flowers = 0
                else:
                    flowers = 0
            if bouquets >= m:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (bloomDay = [1, 10, 3, 10, 2], m = 3, k = 1)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Total flowers required: 3 * 1 = 3 <= 5 -> feasible.<br/>
    - left = 1, right = 10.<br/>
    - Try day <code>mid = 5</code>:<br/>
    &nbsp;&nbsp;• Bloomed array on day 5: [1, 0, 1, 0, 1] (indexes 0, 2, 4 are bloomed).<br/>
    &nbsp;&nbsp;• Count adjacent: since k=1, bouquets formed = 3.<br/>
    &nbsp;&nbsp;• 3 >= 3 -> Feasible. Update ans = 5, search left: right = 4.<br/>
    - Eventually converges to optimal minimum day 3.<br/>
    - Returns 3. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and minDays function signature.</li>
    <li><b>Line 3-4:</b> Edge Case: check if we have enough total flowers. Return -1 if not.</li>
    <li><b>Line 5-7:</b> Set binary search range from 1 to max bloom day in array.</li>
    <li><b>Line 8:</b> Run loop.</li>
    <li><b>Line 9:</b> Calculate middle day candidate.</li>
    <li><b>Line 10-18:</b> Count adjacent bloomed flowers. Make a bouquet when count reaches k, reset count on non-bloomed flower.</li>
    <li><b>Line 19-21:</b> If bouquets made >= m, save answer and check for earlier days.</li>
    <li><b>Line 22-23:</b> Otherwise, search later days.</li>
    <li><b>Line 24:</b> Return final day answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 उत्तर पर बाइनरी सर्च</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">न्यूनतम दिन <code>D</code> की बाइनरी सर्च करें जो <code>1</code> से <code>max(bloomDay)</code> के बीच होगी। यदि आवश्यक फूल <code>m * k</code> एरे के कुल आकार से बड़ा है, तो -1 लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log(MaxDay)) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minDays(self, bloomDay: List[int], m: int, k: int) -> int:
        if m * k > len(bloomDay):
            return -1
        left = 1
        right = max(bloomDay)
        ans = -1
        while left <= right:
            mid = (left + right) // 2
            bouquets = 0
            flowers = 0
            for d in bloomDay:
                if d <= mid:
                    flowers += 1
                    if flowers == k:
                        bouquets += 1
                        flowers = 0
                else:
                    flowers = 0
            if bouquets >= m:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (bloomDay = [1, 10, 3, 10, 2], m = 3, k = 1)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - आवश्यक फूल = 3। एरे साइज = 5 (संभव है)।<br/>
    - दिन <code>mid = 5</code> की जांच:<br/>
    &nbsp;&nbsp;• खिले हुए फूलों का सूचकांक: 0, 2, 4 (bloomDay <= 5)।<br/>
    &nbsp;&nbsp;• चूंकि k = 1 है, इसलिए 3 गुलदस्ते (bouquets) बनाए जा सकते हैं।<br/>
    &nbsp;&nbsp;• 3 >= 3 -> संभव है। ans = 5, right = 4।<br/>
    - बाइनरी खोज के अंत में न्यूनतम दिन 3 मिलता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> अपवाद स्थिति (Edge Case): जांचें कि क्या पर्याप्त फूल उपलब्ध हैं। नहीं तो -1 लौटाएं।</li>
    <li><b>लाइन 5-7:</b> सर्च रेंज को 1 से अधिकतम खिलने वाले दिन तक बनाना।</li>
    <li><b>लाइन 8:</b> बाइनरी लूप चलाना।</li>
    <li><b>लाइन 9:</b> मध्य दिन मान मापना।</li>
    <li><b>लाइन 10-18:</b> खिले हुए पास-पास के फूलों की गिनती करना। गिनती <code>k</code> होने पर गुलदस्ता बनाना, गैर-खिले हुए फूल पर काउंटर 0 करना।</li>
    <li><b>लाइन 19-21:</b> यदि लक्ष्य प्राप्त होता है, तो दिन सहेजें और कम दिनों का प्रयास करें।</li>
    <li><b>लाइन 22-23:</b> अन्यथा, अधिक दिनों की खोज करें।</li>
    <li><b>लाइन 24:</b> परिणामी न्यूनतम दिन लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fd5",
    title: "Aggressive Cows Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Maximize the Minimum Distance</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">First, **sort** the stalls. The search space for distance is between <code>1</code> and <code>stalls[-1] - stalls[0]</code>. Try distance <code>mid</code>: place next cow only if <code>stalls[i] - last_placed >= mid</code>. If we can place all cows, try larger distances.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log N + N log(MaxDist)) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def solve(self, n: int, k: int, stalls: List[int]) -> int:
        stalls.sort()
        left = 1
        right = stalls[-1] - stalls[0]
        ans = 1
        while left <= right:
            mid = (left + right) // 2
            count = 1
            last_pos = stalls[0]
            for i in range(1, n):
                if stalls[i] - last_pos >= mid:
                    count += 1
                    last_pos = stalls[i]
            if count >= k:
                ans = mid
                left = mid + 1
            else:
                right = mid - 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (stalls = [1, 2, 8, 4, 9], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Sort stalls gives: <code>[1, 2, 4, 8, 9]</code>. Range: left = 1, right = 8.<br/>
    - Try distance <code>mid = 4</code>:<br/>
    &nbsp;&nbsp;• Place cow 1 at stalls[0]=1. Next spot >= 5 is 8 (cow 2). Next spot >= 12 (none). Placed count = 2.<br/>
    &nbsp;&nbsp;• 2 < 3 -> Impossible. Search smaller: right = 3.<br/>
    - Try distance <code>mid = 3</code>:<br/>
    &nbsp;&nbsp;• Cow 1 at 1. Next >= 4 is 4 (cow 2). Next >= 7 is 8 (cow 3). Placed count = 3.<br/>
    &nbsp;&nbsp;• 3 >= 3 -> Feasible. Update ans = 3, search larger: left = 4.<br/>
    - Converges to optimal distance 3.<br/>
    - Returns 3. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and solver function declaration.</li>
    <li><b>Line 3:</b> Sort the stalls array (crucial for greedy distance checking).</li>
    <li><b>Line 4-6:</b> Set left and right search space range boundaries, initial answer.</li>
    <li><b>Line 7:</b> Loop through search boundaries.</li>
    <li><b>Line 8:</b> Calculate mid distance candidate.</li>
    <li><b>Line 9-10:</b> Place first cow at first stall (stalls[0]).</li>
    <li><b>Line 11-14:</b> Loop through remaining stalls. Place cow if distance from last placed cow >= mid.</li>
    <li><b>Line 15-17:</b> If successfully placed all cows, save distance and try larger minimum distance (left = mid + 1).</li>
    <li><b>Line 18-19:</b> Otherwise, decrease target minimum distance (right = mid - 1).</li>
    <li><b>Line 20:</b> Return optimal minimum distance answer.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 न्यूनतम दूरी को अधिकतम करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सबसे पहले, स्टॉल (stalls) की स्थिति को सॉर्ट करें। न्यूनतम दूरी की खोज सीमा <code>1</code> से <code>stalls[-1] - stalls[0]</code> तक होगी। यदि दो लगातार गायों की दूरी >= mid हो, तभी अगली गाय रखें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log N + N log(MaxDist)) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def solve(self, n: int, k: int, stalls: List[int]) -> int:
        stalls.sort()
        left = 1
        right = stalls[-1] - stalls[0]
        ans = 1
        while left <= right:
            mid = (left + right) // 2
            count = 1
            last_pos = stalls[0]
            for i in range(1, n):
                if stalls[i] - last_pos >= mid:
                    count += 1
                    last_pos = stalls[i]
            if count >= k:
                ans = mid
                left = mid + 1
            else:
                right = mid - 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (stalls = [1, 2, 8, 4, 9], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सॉर्टेड स्टॉल: <code>[1, 2, 4, 8, 9]</code>। सीमा: left=1, right=8।<br/>
    - दूरी <code>mid = 4</code> की जांच:<br/>
    &nbsp;&nbsp;• गाय 1 को 1 पर रखा। अगली संभव जगह 8 (गाय 2)। कुल गाय = 2। (3 से कम है -> नामुमकिन)। right = 3।<br/>
    - दूरी <code>mid = 3</code> की जांच:<br/>
    &nbsp;&nbsp;• गाय 1 को 1 पर, गाय 2 को 4 पर, गाय 3 को 8 पर। कुल = 3 (संभव है) -> ans = 3, left = 4।<br/>
    - बाइनरी खोज के अंत में दूरी 3 प्राप्त होती है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> दूरी की सही जांच के लिए स्टॉल एरे को सॉर्ट करना।</li>
    <li><b>लाइन 4-6:</b> दूरी की खोज सीमाएं बनाना।</li>
    <li><b>लाइन 7:</b> बाइनरी खोज लूप चलाना।</li>
    <li><b>लाइन 8:</b> मध्य दूरी मान मापना।</li>
    <li><b>लाइन 9-10:</b> पहली गाय को पहले स्टॉल पर रखना।</li>
    <li><b>लाइन 11-14:</b> शेष स्टॉलों को स्कैन कर गायों को रखना यदि दूरी <code>mid</code> के बराबर या अधिक हो।</li>
    <li><b>लाइन 15-17:</b> यदि सभी गायें रखी जा सकीं, तो मान सहेजें और अधिक दूरी आज़माएं।</li>
    <li><b>लाइन 18-19:</b> अन्यथा, दूरी की सीमा घटाएं।</li>
    <li><b>लाइन 20:</b> परिणामी अधिकतम न्यूनतम दूरी लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fd7",
    title: "Split Array Largest Sum Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Minimize the Maximum Sum</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Identical to "Capacity to Ship Packages Within D Days". The search space for target sum is bounded between <code>max(nums)</code> (the largest single element, minimum possible max sum) and <code>sum(nums)</code> (everything in 1 subarray). Use binary search to find optimal sum.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log(Sum - Max)) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        left = max(nums)
        right = sum(nums)
        ans = right
        while left <= right:
            mid = (left + right) // 2
            current_sum = 0
            splits = 1
            for num in nums:
                if current_sum + num > mid:
                    splits += 1
                    current_sum = 0
                current_sum += num
            if splits <= k:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [7, 2, 5, 10, 8], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Range limits: left = 10, right = 32.<br/>
    - Try max sum <code>mid = 21</code>:<br/>
    &nbsp;&nbsp;• Subarrays split: [7, 2, 5] (sum 14) | [10, 8] (sum 18) -> splits count = 2.<br/>
    &nbsp;&nbsp;• 2 splits <= 2 -> Feasible. Update ans = 21, right = 20.<br/>
    - Binary search converges to optimal maximum sum 18.<br/>
    - Returns 18. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and splitArray function declaration.</li>
    <li><b>Line 3-5:</b> Set search boundaries. The maximum subarray sum cannot be less than largest element or greater than sum of elements.</li>
    <li><b>Line 6:</b> Run binary search.</li>
    <li><b>Line 7:</b> Calculate mid sum candidate.</li>
    <li><b>Line 8-10:</b> Initialize splits count to 1 and sum tracker.</li>
    <li><b>Line 11-15:</b> Add numbers to subarray. Increment splits count if adding current element exceeds target mid sum.</li>
    <li><b>Line 16-18:</b> If splits count <= k, it is feasible. Save answer and try smaller max sum limits (right = mid - 1).</li>
    <li><b>Line 19-20:</b> Otherwise, target sum is too small. Increase boundaries (left = mid + 1).</li>
    <li><b>Line 21:</b> Return optimal min-max sum.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 अधिकतम योग को न्यूनतम करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">यह समस्या "Capacity to Ship Packages Within D Days" के बिल्कुल समान है। खोज सीमा <code>max(nums)</code> (सबसे बड़ा तत्व) से <code>sum(nums)</code> (कुल योग) के बीच होगी।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log(Sum - Max)) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        left = max(nums)
        right = sum(nums)
        ans = right
        while left <= right:
            mid = (left + right) // 2
            current_sum = 0
            splits = 1
            for num in nums:
                if current_sum + num > mid:
                    splits += 1
                    current_sum = 0
                current_sum += num
            if splits <= k:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [7, 2, 5, 10, 8], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सीमाएं: left = 10, right = 32।<br/>
    - अधिकतम योग <code>mid = 21</code> की जांच:<br/>
    &nbsp;&nbsp;• उप-एरे विभाजन: [7, 2, 5] (योग 14) | [10, 8] (योग 18) -> विभाजन संख्या = 2।<br/>
    &nbsp;&nbsp;• 2 <= 2 -> संभव है। ans = 21, right = 20।<br/>
    - बाइनरी खोज के अंत में न्यूनतम अधिकतम योग 18 प्राप्त होता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> खोज सीमा वेरिएबल्स बनाना (न्यूनतम सबसे बड़ा अंक और अधिकतम कुल योग के बराबर)।</li>
    <li><b>लाइन 6:</b> बाइनरी लूप रन करना।</li>
    <li><b>लाइन 7:</b> वर्तमान अनुमानित सीमा <code>mid</code> मापना।</li>
    <li><b>लाइन 8-10:</b> उप-एरे योग और विभाजन संख्या काउंटर शुरू करना।</li>
    <li><b>लाइन 11-15:</b> तत्व जोड़ना। यदि योग सीमा <code>mid</code> से अधिक हो तो नया उप-एरे (विभाजन) शुरू करना।</li>
    <li><b>लाइन 16-18:</b> यदि कुल विभाजन <code>k</code> के बराबर या कम हैं, तो योग सहेजें और कम योग का प्रयास करें।</li>
    <li><b>लाइन 19-20:</b> अन्यथा, सीमा बहुत कम है। बाईं सीमा बढ़ाएं।</li>
    <li><b>लाइन 21:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fd9",
    title: "Magnetic Force Between Two Balls Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Maximize the Minimum Force</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">First, **sort** the positions array. The problem is identical to **Aggressive Cows**. Bounded between <code>1</code> and <code>position[-1] - position[0]</code>. Place balls greedily at minimum force <code>mid</code>. If we can place >= <code>m</code> balls, save force and check larger values.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log N + N log(MaxDist)) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxDistance(self, position: List[int], m: int) -> int:
        position.sort()
        left = 1
        right = position[-1] - position[0]
        ans = 1
        while left <= right:
            mid = (left + right) // 2
            count = 1
            last_pos = position[0]
            for i in range(1, len(position)):
                if position[i] - last_pos >= mid:
                    count += 1
                    last_pos = position[i]
            if count >= m:
                ans = mid
                left = mid + 1
            else:
                right = mid - 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (position = [1, 2, 3, 4, 7], m = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Sorted position: <code>[1, 2, 3, 4, 7]</code>. Range: left = 1, right = 6.<br/>
    - Try minimum force <code>mid = 3</code>:<br/>
    &nbsp;&nbsp;• Place ball 1 at position[0]=1. Next spot >= 4 is 4 (ball 2). Next spot >= 7 is 7 (ball 3).<br/>
    &nbsp;&nbsp;• Placed count = 3.<br/>
    &nbsp;&nbsp;• 3 >= 3 -> Feasible. Update ans = 3, search larger: left = 4.<br/>
    - Converges to optimal magnetic force 3.<br/>
    - Returns 3. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maxDistance function declaration.</li>
    <li><b>Line 3:</b> Sort the basket positions array (essential to place balls sequentially).</li>
    <li><b>Line 4-6:</b> Set force range bounds left = 1, right = max distance, initial ans.</li>
    <li><b>Line 7:</b> Loop for binary search.</li>
    <li><b>Line 8:</b> Calculate mid force candidate.</li>
    <li><b>Line 9-10:</b> Place first ball in first basket (position[0]).</li>
    <li><b>Line 11-14:</b> Iterate baskets. Place next ball if distance from last placed ball >= mid.</li>
    <li><b>Line 15-17:</b> If successfully placed all balls, save force and check larger force bounds (left = mid + 1).</li>
    <li><b>Line 18-19:</b> Otherwise, decrease force range limit (right = mid - 1).</li>
    <li><b>Line 20:</b> Return optimal force.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 न्यूनतम बल (force) को अधिकतम करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सबसे पहले बास्केट की स्थिति को सॉर्ट करें। यह समस्या **Aggressive Cows** के बिल्कुल समान है। बल की खोज सीमा <code>1</code> से <code>position[-1] - position[0]</code> तक होगी। यदि गेंदों की संख्या >= <code>m</code> है, तो बल सहेजें और बड़ी सीमा का प्रयास करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log N + N log(MaxDist)) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxDistance(self, position: List[int], m: int) -> int:
        position.sort()
        left = 1
        right = position[-1] - position[0]
        ans = 1
        while left <= right:
            mid = (left + right) // 2
            count = 1
            last_pos = position[0]
            for i in range(1, len(position)):
                if position[i] - last_pos >= mid:
                    count += 1
                    last_pos = position[i]
            if count >= m:
                ans = mid
                left = mid + 1
            else:
                right = mid - 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (position = [1, 2, 3, 4, 7], m = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सॉर्टेड बास्केट: <code>[1, 2, 3, 4, 7]</code>। सीमा: left=1, right=6।<br/>
    - बल <code>mid = 3</code> की जांच:<br/>
    &nbsp;&nbsp;• गेंद 1 को 1 पर रखा। अगली >= 4 स्थिति 4 है (गेंद 2)। अगली >= 7 स्थिति 7 है (गेंद 3)।<br/>
    &nbsp;&nbsp;• कुल गेंदें रखी गईं = 3 (3 >= 3 संभव है)। ans = 3, left = 4।<br/>
    - अंतिम परिणाम 3 प्राप्त होता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> बास्केट स्थितियों को सॉर्ट करना।</li>
    <li><b>लाइन 4-6:</b> बल की खोज सीमा वेरिएबल्स बनाना।</li>
    <li><b>लाइन 7:</b> बाइनरी सर्च लूप।</li>
    <li><b>लाइन 8:</b> मध्य बल <code>mid</code> की गणना।</li>
    <li><b>लाइन 9-10:</b> पहली गेंद को बास्केट[0] पर रखना।</li>
    <li><b>लाइन 11-14:</b> शेष बास्केटों को स्कैन कर गेंदें रखना यदि दूरी >= <code>mid</code> हो।</li>
    <li><b>लाइन 15-17:</b> यदि सभी गेंदें रखी जा सकीं, तो मान सहेजें और अधिक दूरी आज़माएं।</li>
    <li><b>लाइन 18-19:</b> अन्यथा, दूरी की सीमा घटाएं।</li>
    <li><b>लाइन 20:</b> परिणामी अधिकतम न्यूनतम दूरी लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a30ea665fb08c29755f7fdb",
    title: "Median of Two Sorted Arrays Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Symmetric Array Partitioning</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Partition both arrays such that left half equals right half, and all left elements <= right elements. Binary search on partition index of smaller array. If partition is correct, return median based on odd/even total length.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(log(min(M, N))) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            return self.findMedianSortedArrays(nums2, nums1)
        
        m, n = len(nums1), len(nums2)
        left, right = 0, m
        
        while left <= right:
            partition1 = (left + right) // 2
            partition2 = (m + n + 1) // 2 - partition1
            
            maxLeft1 = float('-inf') if partition1 == 0 else nums1[partition1 - 1]
            minRight1 = float('inf') if partition1 == m else nums1[partition1]
            
            maxLeft2 = float('-inf') if partition2 == 0 else nums2[partition2 - 1]
            minRight2 = float('inf') if partition2 == n else nums2[partition2]
            
            if maxLeft1 <= minRight2 and maxLeft2 <= minRight1:
                if (m + n) % 2 == 1:
                    return max(maxLeft1, maxLeft2)
                return (max(maxLeft1, maxLeft2) + min(minRight1, minRight2)) / 2.0
            elif maxLeft1 > minRight2:
                right = partition1 - 1
            else:
                left = partition1 + 1
        return 0.0</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums1 = [1, 3], nums2 = [2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Swap arrays to make nums1 smaller: <code>nums1 = [2]</code>, <code>nums2 = [1, 3]</code>. m = 1, n = 2.<br/>
    - left = 0, right = 1.<br/>
    - Try partition <code>partition1 = 0</code>:<br/>
    &nbsp;&nbsp;• partition2 = (1+2+1)//2 - 0 = 2.<br/>
    &nbsp;&nbsp;• maxLeft1 = -inf, minRight1 = 2.<br/>
    &nbsp;&nbsp;• maxLeft2 = 3, minRight2 = inf.<br/>
    &nbsp;&nbsp;• Check: Is maxLeft2 <= minRight1 (3 <= 2)? No. Shift rightward: left = 1.<br/>
    - Try partition <code>partition1 = 1</code>:<br/>
    &nbsp;&nbsp;• partition2 = 2 - 1 = 1.<br/>
    &nbsp;&nbsp;• maxLeft1 = 2, minRight1 = inf.<br/>
    &nbsp;&nbsp;• maxLeft2 = 1, minRight2 = 3.<br/>
    &nbsp;&nbsp;• Check: Is maxLeft1 <= minRight2 (2 <= 3) and maxLeft2 <= minRight1 (1 <= inf)? Yes!<br/>
    &nbsp;&nbsp;• Odd total length: return max(maxLeft1, maxLeft2) = max(2, 1) = 2. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-4:</b> Ensure first array is smaller to bound binary search range to O(log(min(M, N))).</li>
    <li><b>Line 6-7:</b> Record lengths, initialize boundaries left = 0, right = length of smaller array.</li>
    <li><b>Line 9:</b> Loop through search range.</li>
    <li><b>Line 10-11:</b> Calculate split indexes for both arrays to balance elements symmetrically.</li>
    <li><b>Line 13-17:</b> Setup partition boundaries elements, handling boundary edge conditions with infinity.</li>
    <li><b>Line 19-22:</b> If partitions are balanced, return median. Max of lefts if odd length; average of max-left and min-right if even.</li>
    <li><b>Line 23-26:</b> Shift partition search space based on element comparison.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 सममित एरे विभाजन (Symmetric Partition)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दोनों एरे को इस प्रकार विभाजित करें कि बाएं हिस्से के तत्व दाएं हिस्से से कम या बराबर हों। बाइनरी सर्च केवल छोटे एरे के विभाजन पर किया जाएगा। विभाजन सही होने पर सम/विषम लंबाई के आधार पर माध्यिका (median) लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(log(min(M, N))) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            return self.findMedianSortedArrays(nums2, nums1)
        
        m, n = len(nums1), len(nums2)
        left, right = 0, m
        
        while left <= right:
            partition1 = (left + right) // 2
            partition2 = (m + n + 1) // 2 - partition1
            
            maxLeft1 = float('-inf') if partition1 == 0 else nums1[partition1 - 1]
            minRight1 = float('inf') if partition1 == m else nums1[partition1]
            
            maxLeft2 = float('-inf') if partition2 == 0 else nums2[partition2 - 1]
            minRight2 = float('inf') if partition2 == n else nums2[partition2]
            
            if maxLeft1 <= minRight2 and maxLeft2 <= minRight1:
                if (m + n) % 2 == 1:
                    return max(maxLeft1, maxLeft2)
                return (max(maxLeft1, maxLeft2) + min(minRight1, minRight2)) / 2.0
            elif maxLeft1 > minRight2:
                right = partition1 - 1
            else:
                left = partition1 + 1
        return 0.0</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums1 = [1, 3], nums2 = [2])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - छोटे एरे के लिए अदला-बदली: <code>nums1 = [2]</code>, <code>nums2 = [1, 3]</code>. m = 1, n = 2.<br/>
    - विभाजन <code>partition1 = 0</code> की जांच:<br/>
    &nbsp;&nbsp;• partition2 = 2. maxLeft1 = -inf, minRight1 = 2। maxLeft2 = 3, minRight2 = inf।<br/>
    &nbsp;&nbsp;• 3 <= 2 (गलत) -> left = 1.<br/>
    - विभाजन <code>partition1 = 1</code> की जांच:<br/>
    &nbsp;&nbsp;• partition2 = 1. maxLeft1 = 2, minRight1 = inf। maxLeft2 = 1, minRight2 = 3।<br/>
    &nbsp;&nbsp;• 2 <= 3 और 1 <= inf (सत्य!) -> विषम योग लंबाई: max(2, 1) = 2 लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-4:</b> बाइनरी सर्च के लिए हमेशा पहले एरे को छोटा रखना।</li>
    <li><b>लाइन 6-7:</b> एरे की लंबाई रिकॉर्ड करना, सीमाएं स्थापित करना।</li>
    <li><b>लाइन 9:</b> बाइनरी लूप रन करना।</li>
    <li><b>लाइन 10-11:</b> दोनों एरे के बीच के स्प्लिट पॉइंट मापना।</li>
    <li><b>लाइन 13-17:</b> विभाजन सीमाओं के कैरेक्टर तय करना (खाली स्थान पर अनंत वैल्यू सेट करना)।</li>
    <li><b>लाइन 19-22:</b> यदि सीमाएं संतुलित हैं, तो माध्यिका लौटाना (विषम पर बायां अधिकतम, सम होने पर औसत)।</li>
    <li><b>लाइन 23-26:</b> सीमाओं को छोटा करना।</li>
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
    
    console.log("Cleaning up old seeded binary search notes...");
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
        tags: ["Binary-Search", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed binary search notes...`);
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
