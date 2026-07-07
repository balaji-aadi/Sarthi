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
const parentTaskId = "69e75052c05bf5f0580b806f";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #0369a1; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #bae6fd; padding-bottom: 6px; margin-top: 0;">📐 Intervals Identification Blueprint</h3>
  
  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0369a1; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Intervals Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.5;">
      Think of Intervals when the inputs represent ranges with <code>[start, end]</code> coordinates. The objective is to merge overlaps, determine conflict counts, find gaps/free ranges, or track cumulative resource usage over time (Sweeping Line).
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
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Merge / Sort Intervals</td>
          <td style="padding: 6px 4px;">Sort by start time. Check overlap <code>curr[0] <= prev[1]</code> and update <code>prev[1] = max(prev[1], curr[1])</code>.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Greedy End-Time Order</td>
          <td style="padding: 6px 4px;">Sort by end time. Pick earliest ending non-overlapping interval (standard interval scheduling template).</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Sweeping Line (Difference Array)</td>
          <td style="padding: 6px 4px;">For concurrent timelines, increment start by <code>+C</code> and decrement end by <code>-C</code>. Accumulate chronologically.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Double Booking Tracking</td>
          <td style="padding: 6px 4px;">Keep two lists: one for bookings and one for overlaps. Check new booking against overlaps to avoid triple booking.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #0369a1; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #bae6fd; padding-bottom: 6px; margin-top: 0;">📐 अंतरालों (Intervals) पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0369a1; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 अंतरालों वाली समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.5;">
      जब इनपुट <code>[start, end]</code> निर्देशांकों वाली सीमाओं का प्रतिनिधित्व करते हैं, तो अंतरालों की पहचान करें। इसका उद्देश्य ओवरलैप को मिलाना, संघर्षों को मापना, रिक्तियाँ/मुक्त सीमाएं खोजना है।
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
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">अंतरालों को मिलाना / सॉर्ट करना</td>
          <td style="padding: 6px 4px;">शुरू होने के समय से सॉर्ट करें। <code>curr[0] <= prev[1]</code> ओवरलैप की जाँच करें और अंत समय अपडेट करें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">लालची अंत-समय अनुक्रम</td>
          <td style="padding: 6px 4px;">अंत समय से सॉर्ट करें। सबसे पहले समाप्त होने वाले गैर-ओवरलैपिंग अंतराल को चुनें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">स्वीपिंग लाइन (अंतर एरे)</td>
          <td style="padding: 6px 4px;">समवर्ती समयसीमाओं के लिए, शुरुआत को <code>+C</code> और अंत को <code>-C</code> बढ़ाएं।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">दोहरा बुकिंग ट्रैकिंग</td>
          <td style="padding: 6px 4px;">दो सूचियाँ रखें: एक बुकिंग के लिए और एक ओवरलैप के लिए। ट्रिपल बुकिंग से बचने के लिए ओवरलैप की जाँच करें।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Intervals Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Intervals", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e75052c05bf5f0580b8071",
    title: "Merge intervals Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Quadratic Searches</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Compare each interval with every other interval to merge. Highly redundant.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N²) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Sort by Start Time)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Sort by start time. Iterate. If current interval overlaps with the last merged interval (<code>curr[0] <= prev[1]</code>), merge them by setting <code>prev[1] = max(prev[1], curr[1])</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N log N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        if not intervals:
            return []
        intervals.sort(key=lambda x: x[0])
        merged = [intervals[0]]
        for curr in intervals[1:]:
            prev = merged[-1]
            if curr[0] <= prev[1]:
                prev[1] = max(prev[1], curr[1])
            else:
                merged.append(curr)
        return merged</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (intervals = [[1, 3], [2, 6], [8, 10], [15, 18]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Sorted: [[1, 3], [2, 6], [8, 10], [15, 18]]. merged = [[1, 3]].<br/>
    - curr = [2, 6] -> overlaps (2 <= 3). prev[1] = max(3, 6) = 6. merged = [[1, 6]].<br/>
    - curr = [8, 10] -> no overlap (8 > 6). Append [8, 10]. merged = [[1, 6], [8, 10]].<br/>
    - curr = [15, 18] -> no overlap (15 > 10). Append [15, 18]. merged = [[1, 6], [8, 10], [15, 18]].<br/>
    - Returns [[1, 6], [8, 10], [15, 18]]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function declaration.</li>
    <li><b>Line 3-4:</b> Return empty list if input is empty.</li>
    <li><b>Line 5:</b> Sort intervals ascending by start time x[0].</li>
    <li><b>Line 6:</b> Initialize merged list with first interval.</li>
    <li><b>Line 7-8:</b> Loop remaining intervals. Retrieve last merged element.</li>
    <li><b>Line 9-10:</b> If overlap exists, update end boundary of previous interval to maximum of both.</li>
    <li><b>Line 11-12:</b> Otherwise, append current interval as a new entry.</li>
    <li><b>Line 13:</b> Return merged list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 द्विघातीय तुलना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक अंतराल की हर दूसरे अंतराल से तुलना करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N²) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Sorting by Start Time)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">शुरू होने के समय से सॉर्ट करें। लूप चलाएं। यदि वर्तमान अंतराल पिछले मर्ज किए गए अंतराल से ओवरलैप (<code>curr[0] <= prev[1]</code>) करता है, तो उन्हें मिलाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N log N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        if not intervals:
            return []
        intervals.sort(key=lambda x: x[0])
        merged = [intervals[0]]
        for curr in intervals[1:]:
            prev = merged[-1]
            if curr[0] <= prev[1]:
                prev[1] = max(prev[1], curr[1])
            else:
                merged.append(curr)
        return merged</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (intervals = [[1, 3], [2, 6], [8, 10], [15, 18]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सॉर्टेड: [[1, 3], [2, 6], [8, 10], [15, 18]]। merged = [[1, 3]]।<br/>
    - curr = [2, 6] -> ओवरलैप (2 <= 3)। prev[1] = max(3, 6) = 6। merged = [[1, 6]]।<br/>
    - curr = [8, 10] -> कोई ओवरलैप नहीं (8 > 6)। merged = [[1, 6], [8, 10]]।<br/>
    - परिणाम: [[1, 6], [8, 10], [15, 18]]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> इनपुट खाली होने पर सीधे खाली सूची लौटाना।</li>
    <li><b>लाइन 5:</b> अंतरालों को शुरू होने के समय (x[0]) के अनुसार सॉर्ट करना।</li>
    <li><b>लाइन 6:</b> प्रथम अंतराल से परिणामी लिस्ट (merged) को इनिशियलाइज़ करना।</li>
    <li><b>लाइन 7-8:</b> बाकी अंतरालों पर लूप और परिणामी लिस्ट का अंतिम तत्व प्राप्त करना।</li>
    <li><b>लाइन 9-10:</b> यदि ओवरलैप होता है, तो पिछले अंतराल की समाप्ति सीमा को अपडेट करना।</li>
    <li><b>लाइन 11-12:</b> अन्यथा, वर्तमान अंतराल को सीधे परिणामी लिस्ट में जोड़ना।</li>
    <li><b>लाइन 13:</b> परिणामी मर्ज की गई सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b8073",
    title: "Insert interval Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Three-Phase Greedy Insertion</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Insert <code>newInterval</code> into sorted non-overlapping intervals:
      1. Append all intervals ending before <code>newInterval</code> starts.
      2. Merge overlapping intervals by updating <code>newInterval</code> start & end bounds.
      3. Append remaining intervals starting after <code>newInterval</code> ends.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        ans = []
        i = 0
        n = len(intervals)
        while i < n and intervals[i][1] < newInterval[0]:
            ans.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1
        ans.append(newInterval)
        while i < n:
            ans.append(intervals[i])
            i += 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (intervals = [[1, 3], [6, 9]], newInterval = [2, 5])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 (interval [1, 3]) -> ends before 2 starts? No (3 >= 2). Phase 1 ends.<br/>
    - Phase 2 loop: intervals[0] overlaps with [2, 5] (1 <= 5) -> newInterval = [min(2,1), max(5,3)] = [1, 5], i = 1.<br/>
    &nbsp;&nbsp;• intervals[1] ([6, 9]) overlaps with [1, 5] (6 <= 5)? No. Phase 2 ends.<br/>
    - Append newInterval [1, 5]. ans = [[1, 5]].<br/>
    - Phase 3 loop: append [6, 9], i = 2.<br/>
    - Returns [[1, 5], [6, 9]]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and insert method signature.</li>
    <li><b>Line 3-5:</b> Set result list, index i = 0, size n.</li>
    <li><b>Line 6-8:</b> Append all intervals ending before newInterval starts.</li>
    <li><b>Line 9-12:</b> If overlap exists, merge intervals by updating newInterval boundaries.</li>
    <li><b>Line 13:</b> Append merged newInterval.</li>
    <li><b>Line 14-16:</b> Append remaining intervals.</li>
    <li><b>Line 17:</b> Return result list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 तीन-चरणीय कुशल सम्मिलन (Three-Phase)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;"><code>newInterval</code> को क्रमबद्ध अंतरालों में डालें:
      1. वे सभी अंतराल जोड़ें जो <code>newInterval</code> से पहले समाप्त होते हैं।
      2. ओवरलैप करने वाले अंतरालों को <code>newInterval</code> में मर्ज करें।
      3. शेष बचे सभी अंतरालों को अंत में जोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        ans = []
        i = 0
        n = len(intervals)
        while i < n and intervals[i][1] < newInterval[0]:
            ans.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1
        ans.append(newInterval)
        while i < n:
            ans.append(intervals[i])
            i += 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (intervals = [[1, 3], [6, 9]], newInterval = [2, 5])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 ([1, 3]) -> 3 >= 2 है (पहला चरण लूप नहीं चलेगा)।<br/>
    - दूसरा चरण: intervals[0] और [2, 5] ओवरलैप करते हैं -> newInterval = [1, 5], i = 1।<br/>
    &nbsp;&nbsp;• intervals[1] ([6, 9]) ओवरलैप नहीं करता (6 > 5 है)।<br/>
    - [1, 5] को ans में जोड़ा। ans = [[1, 5]]।<br/>
    - तीसरा चरण: [6, 9] को जोड़ा। परिणाम: [[1, 5], [6, 9]]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> परिणामी लिस्ट, इंडेक्स i, और एरे साइज घोषित करना।</li>
    <li><b>लाइन 6-8:</b> पहले समाप्त होने वाले अंतरालों को परिणाम में जोड़ना।</li>
    <li><b>लाइन 9-12:</b> ओवरलैप होने वाले अंतरालों को आपस में मिलाना।</li>
    <li><b>लाइन 13:</b> मिलाए गए newInterval को परिणाम में जोड़ना।</li>
    <li><b>लाइन 14-16:</b> बाकी अंतरालों को जोड़ना।</li>
    <li><b>लाइन 17:</b> परिणामी सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b8075",
    title: "Non-overlapping intervals Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Greedy End Time Selection</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Sort intervals by **end time**. Keep track of end time of last added interval. If current interval overlaps with last added (<code>curr[0] < end</code>), increment removal count. Otherwise, update last added end time.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log N) | 🧠 Space: O(sorting space)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        if not intervals:
            return 0
        intervals.sort(key=lambda x: x[1])
        end = intervals[0][1]
        count = 0
        for curr in intervals[1:]:
            if curr[0] < end:
                count += 1
            else:
                end = curr[1]
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (intervals = [[1, 2], [2, 3], [3, 4], [1, 3]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Sorted by end coordinates: [[1, 2], [2, 3], [1, 3], [3, 4]].<br/>
    - end = 2, count = 0.<br/>
    - curr = [2, 3] -> 2 >= 2. No overlap. Update end = 3.<br/>
    - curr = [1, 3] -> 1 < 3. Overlaps! count = 1. Keep end = 3.<br/>
    - curr = [3, 4] -> 3 >= 3. No overlap. Update end = 4.<br/>
    - Returns removals count 1. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and eraseOverlapIntervals method signature.</li>
    <li><b>Line 3-4:</b> Verify empty bounds.</li>
    <li><b>Line 5:</b> Sort intervals ascending by end coordinate x[1] (key greedy choice).</li>
    <li><b>Line 6-7:</b> Initialize end coordinate and removal count = 0.</li>
    <li><b>Line 8:</b> Loop remaining intervals.</li>
    <li><b>Line 9-10:</b> If current starts before previous end, increment removal count.</li>
    <li><b>Line 11-12:</b> Otherwise, update end boundary to current interval's end coordinate.</li>
    <li><b>Line 13:</b> Return count.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 लालची अंत समय चयन (Greedy End Time)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अंतरालों को **अंत समय** के अनुसार सॉर्ट करें। अंतिम जोड़े गए अंतराल के अंत समय को ट्रैक करें। यदि वर्तमान अंतराल पिछले वाले से ओवरलैप करता है (<code>curr[0] < end</code>), तो निष्कासन (removal) काउंट बढ़ाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log N) | 🧠 स्थान: O(sorting)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        if not intervals:
            return 0
        intervals.sort(key=lambda x: x[1])
        end = intervals[0][1]
        count = 0
        for curr in intervals[1:]:
            if curr[0] < end:
                count += 1
            else:
                end = curr[1]
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (intervals = [[1, 2], [2, 3], [3, 4], [1, 3]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - अंत समय से सॉर्टेड: [[1, 2], [2, 3], [1, 3], [3, 4]]।<br/>
    - end = 2, count = 0।<br/>
    - curr = [2, 3] -> 2 >= 2. कोई ओवरलैप नहीं | end = 3।<br/>
    - curr = [1, 3] -> 1 < 3. ओवरलैप हुआ! | count = 1।<br/>
    - curr = [3, 4] -> 3 >= 3. कोई ओवरलैप नहीं | end = 4।<br/>
    - परिणाम: 1।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> इनपुट खाली होने पर 0 लौटाना।</li>
    <li><b>लाइन 5:</b> अंतरालों को समाप्त होने के समय (x[1]) के अनुसार सॉर्ट करना (कुशल लालची चयन)।</li>
    <li><b>लाइन 6-7:</b> अंत समय सीमा और निष्कासन काउंट (count) को 0 रखना।</li>
    <li><b>लाइन 8:</b> बाकी अंतरालों पर लूप चलाना।</li>
    <li><b>लाइन 9-10:</b> यदि वर्तमान अंतराल पिछले के अंत से पहले शुरू होता है, तो हटाने के लिए काउंट 1 बढ़ाना।</li>
    <li><b>लाइन 11-12:</b> अन्यथा, अंत सीमा को वर्तमान अंतराल की समाप्ति सीमा पर बदलना।</li>
    <li><b>लाइन 13:</b> कुल निष्कासन काउंट लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b8077",
    title: "Meeting rooms  Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Overlap detection</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Sort meetings by start time. Verify if any meeting starts before the previous meeting ends (<code>curr_start < prev_end</code>). If yes, return False.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:
        intervals.sort(key=lambda x: x[0])
        for i in range(1, len(intervals)):
            if intervals[i][0] < intervals[i - 1][1]:
                return False
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (intervals = [[0, 30], [5, 10], [15, 20]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Sorted: [[0, 30], [5, 10], [15, 20]].<br/>
    - i = 1: intervals[1] = [5, 10]. Starts at 5, previous ended at 30. 5 < 30 (overlap!). Returns False. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function declaration.</li>
    <li><b>Line 3:</b> Sort intervals ascending by start time.</li>
    <li><b>Line 4-6:</b> Loop elements. If current meeting starts before previous ends, return False.</li>
    <li><b>Line 7:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 ओवरलैप का पता लगाना (Overlap detection)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">बैठकों को शुरू होने के समय से सॉर्ट करें। जांचें कि क्या कोई बैठक पिछली बैठक समाप्त होने से पहले शुरू होती है (<code>curr_start < prev_end</code>)।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:
        intervals.sort(key=lambda x: x[0])
        for i in range(1, len(intervals)):
            if intervals[i][0] < intervals[i - 1][1]:
                return False
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (intervals = [[0, 30], [5, 10], [15, 20]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - सॉर्टेड: [[0, 30], [5, 10], [15, 20]]।<br/>
    - i = 1: [5, 10] शुरू होता है 5 पर, पिछला खत्म हुआ 30 पर। 5 < 30 (टकराव!) -> False।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> मीटिंगों को उनके शुरू होने के समय (x[0]) से सॉर्ट करना।</li>
    <li><b>लाइन 4-6:</b> अनुक्रमिक लूप चलाना। यदि वर्तमान मीटिंग पिछले के अंत से पहले शुरू होती है, तो False लौटाना।</li>
    <li><b>लाइन 7:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b8079",
    title: "Meeting rooms II Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Sorting Starts and Ends Separately</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Extract and sort start times and end times separately. Track room overlaps: if a meeting starts before the earliest ending meeting ends, increment rooms count. Otherwise, decrement rooms count.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        if not intervals:
            return 0
        starts = sorted([x[0] for x in intervals])
        ends = sorted([x[1] for x in intervals])
        start_ptr, end_ptr = 0, 0
        rooms = 0
        max_rooms = 0
        while start_ptr < len(intervals):
            if starts[start_ptr] < ends[end_ptr]:
                rooms += 1
                start_ptr += 1
            else:
                rooms -= 1
                end_ptr += 1
            max_rooms = max(max_rooms, rooms)
        return max_rooms</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (intervals = [[0, 30], [5, 10], [15, 20]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - starts = [0, 5, 15], ends = [10, 20, 30].<br/>
    - start_ptr = 0, end_ptr = 0: starts[0](0) < ends[0](10) -> rooms = 1. start_ptr = 1. max_rooms = 1.<br/>
    - start_ptr = 1, end_ptr = 0: starts[1](5) < ends[0](10) -> rooms = 2. start_ptr = 2. max_rooms = 2.<br/>
    - start_ptr = 2, end_ptr = 0: starts[2](15) >= ends[0](10) -> rooms = 1. end_ptr = 1.<br/>
    - Returns max rooms 2. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and method declaration.</li>
    <li><b>Line 3-4:</b> Return 0 if intervals list is empty.</li>
    <li><b>Line 5-6:</b> Extract and sort starts and ends arrays.</li>
    <li><b>Line 7-9:</b> Initialize pointers, rooms count, and max tracker.</li>
    <li><b>Line 10:</b> Loop while start pointer is within bounds.</li>
    <li><b>Line 11-13:</b> If meeting starts before earliest ending one, increment rooms, shift start pointer.</li>
    <li><b>Line 14-16:</b> Else, a room has freed up. Decrement rooms, shift end pointer.</li>
    <li><b>Line 17:</b> Record max rooms required.</li>
    <li><b>Line 18:</b> Return max rooms.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 प्रारंभ और अंत समय को अलग-अलग सॉर्ट करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">शुरू होने वाले समय और समाप्त होने वाले समय को अलग-अलग सॉर्ट करें। यदि कोई बैठक सबसे पहले समाप्त होने वाली बैठक से पहले शुरू होती है, तो रूम काउंट बढ़ाएं। अन्यथा कम करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        if not intervals:
            return 0
        starts = sorted([x[0] for x in intervals])
        ends = sorted([x[1] for x in intervals])
        start_ptr, end_ptr = 0, 0
        rooms = 0
        max_rooms = 0
        while start_ptr < len(intervals):
            if starts[start_ptr] < ends[end_ptr]:
                rooms += 1
                start_ptr += 1
            else:
                rooms -= 1
                end_ptr += 1
            max_rooms = max(max_rooms, rooms)
        return max_rooms</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (intervals = [[0, 30], [5, 10], [15, 20]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - starts = [0, 5, 15] | ends = [10, 20, 30]।<br/>
    - ptr 0,0: starts[0](0) < ends[0](10) -> rooms = 1. ptr_start = 1.<br/>
    - ptr 1,0: starts[1](5) < ends[0](10) -> rooms = 2. ptr_start = 2.<br/>
    - ptr 2,0: starts[2](15) >= ends[0](10) -> rooms = 1. ptr_end = 1।<br/>
    - अधिकतम रूम्स संख्या 2 मिली।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> इनपुट खाली होने पर 0 लौटाना।</li>
    <li><b>लाइन 5-6:</b> शुरू होने और खत्म होने वाले समय को अलग-अलग सॉर्ट करना।</li>
    <li><b>लाइन 7-9:</b> पॉइंटर्स, रूम काउंटर और अधिकतम रूम वेरिएबल घोषित करना।</li>
    <li><b>लाइन 10:</b> जब तक start पॉइंटर सीमा के भीतर है, लूप चलाना।</li>
    <li><b>लाइन 11-13:</b> यदि बैठक सबसे पहले समाप्त होने वाली से पहले शुरू होती है, तो रूम बढ़ाएं और start पॉइंटर खिसकाएं।</li>
    <li><b>लाइन 14-16:</b> अन्यथा, रूम खाली हुआ। रूम काउंटर घटाएं और end पॉइंटर आगे बढ़ाएं।</li>
    <li><b>लाइन 17:</b> अधिकतम आवश्यक रूम संख्या ट्रैक करना।</li>
    <li><b>लाइन 18:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b807b",
    title: "My calendar || Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Double Booking Overlap lists</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep track of all bookings in <code>calendar</code> and double booked intersections in <code>overlaps</code>. For a new event:
      - If it overlaps with any double booking in <code>overlaps</code>, reject booking (triple booking).
      - Otherwise, calculate its overlaps with <code>calendar</code> and store them in <code>overlaps</code>. Add to <code>calendar</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N²) per call | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class MyCalendarTwo:
    def __init__(self):
        self.calendar = []
        self.overlaps = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.overlaps:
            if start < e and end > s:
                return False
        for s, e in self.calendar:
            if start < e and end > s:
                self.overlaps.append([max(start, s), min(end, e)])
        self.calendar.append([start, end])
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - book(10, 20) -> calendar = [[10, 20]], overlaps = []. Returns True.<br/>
    - book(50, 60) -> calendar = [[10, 20], [50, 60]]. Returns True.<br/>
    - book(10, 40) -> overlaps with [10, 20] -> appends intersection [10, 20] to overlaps. calendar = [[10, 20], [50, 60], [10, 40]]. Returns True.<br/>
    - book(5, 15) -> overlaps with overlaps[0]([10, 20]) (5 < 20 and 15 > 10). Returns False (Conflicts!).
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-4:</b> Constructor setup. Initialize empty lists calendar and overlaps.</li>
    <li><b>Line 6-9:</b> Iterate overlaps. Reject booking if it overlaps with any double booked intersection range.</li>
    <li><b>Line 10-12:</b> Check overlaps with normal calendar bookings. Add intersections to overlaps list.</li>
    <li><b>Line 13-14:</b> Append booking to calendar list, return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 दोहरा बुकिंग ओवरलैप सूची नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी बुकिंग को <code>calendar</code> में और दोहरे ओवरलैप को <code>overlaps</code> में सहेजें:
      - यदि नई घटना overlaps सूची से टकराती है, तो बुकिंग अस्वीकार (False) करें (क्योंकि यह ट्रिपल बुकिंग होगी)।
      - अन्यथा, calendar से ओवरलैप निकालकर overlaps में जोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N²) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class MyCalendarTwo:
    def __init__(self):
        self.calendar = []
        self.overlaps = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.overlaps:
            if start < e and end > s:
                return False
        for s, e in self.calendar:
            if start < e and end > s:
                self.overlaps.append([max(start, s), min(end, e)])
        self.calendar.append([start, end])
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - book(10, 20) -> calendar = [[10, 20]] | overlaps = []। Returns True।<br/>
    - book(10, 40) -> [10, 20] से ओवरलैप होता है -> overlaps = [[10, 20]] | calendar = [[10, 20], [10, 40]]। Returns True।<br/>
    - book(5, 15) -> overlaps[0]([10, 20]) से ओवरलैप होता है (5 < 20 और 15 > 10) -> Returns False.
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-4:</b> कंस्ट्रक्टर घोषणा। बुकिंग और दोहरे ओवरलैप के लिस्ट घोषित करना।</li>
    <li><b>लाइन 6-9:</b> overlaps के तत्वों पर लूप। यदि नया अंतराल डबल बुकिंग से ओवरलैप करता है, तो False लौटाना।</li>
    <li><b>लाइन 10-12:</b> calendar के तत्वों से ओवरलैप सीमाएं निकालकर overlaps में डालना।</li>
    <li><b>लाइन 13-14:</b> वर्तमान अंतराल को calendar में जोड़ना और True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b807d",
    title: "Employee free time Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Flattening Schedules & Merging</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Flatten all employee schedules into a single interval array. Sort them by start time. Merge overlapping intervals. Collect the free gaps between the merged intervals.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def employeeFreeTime(self, schedule: \'[[Interval]]\') -> \'[Interval]\':
        intervals = []
        for emp in schedule:
            for interval in emp:
                intervals.append(interval)
        if not intervals:
            return []
        intervals.sort(key=lambda x: x.start)
        
        merged = [intervals[0]]
        for curr in intervals[1:]:
            prev = merged[-1]
            if curr.start <= prev.end:
                prev.end = max(prev.end, curr.end)
            else:
                merged.append(curr)
                
        ans = []
        for i in range(1, len(merged)):
            ans.append(Interval(start=merged[i-1].end, end=merged[i].start))
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (schedule = [[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Flattened list: [[1, 3], [6, 7], [2, 4], [2, 5], [9, 12]].<br/>
    - Sorted list: [[1, 3], [2, 4], [2, 5], [6, 7], [9, 12]].<br/>
    - Merged list: [[1, 5], [6, 7], [9, 12]].<br/>
    - Gaps: merged[0].end to merged[1].start -> [5, 6]. merged[1].end to merged[2].start -> [7, 9].<br/>
    - Returns gaps: [[5, 6], [7, 9]]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and method declaration.</li>
    <li><b>Line 3-6:</b> Flatten nested schedules lists into a single intervals array.</li>
    <li><b>Line 7-9:</b> Return empty if blank, sort intervals by start time.</li>
    <li><b>Line 11-17:</b> Merge overlapping intervals.</li>
    <li><b>Line 19-21:</b> Traverse merged list and record gaps (free times) between successive intervals.</li>
    <li><b>Line 22:</b> Return gaps list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 सूचियों को समतल (Flatten) करना और मर्ज करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी कर्मचारियों की कार्य सीमाओं को एक सूची में समतल (flatten) करें। शुरू होने के समय से सॉर्ट करें। अंतरालों को मर्ज करें। मर्ज किए गए अंतरालों के बीच के खाली समय को इकट्ठा करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def employeeFreeTime(self, schedule: \'[[Interval]]\') -> \'[Interval]\':
        intervals = []
        for emp in schedule:
            for interval in emp:
                intervals.append(interval)
        if not intervals:
            return []
        intervals.sort(key=lambda x: x.start)
        
        merged = [intervals[0]]
        for curr in intervals[1:]:
            prev = merged[-1]
            if curr.start <= prev.end:
                prev.end = max(prev.end, curr.end)
            else:
                merged.append(curr)
                
        ans = []
        for i in range(1, len(merged)):
            ans.append(Interval(start=merged[i-1].end, end=merged[i].start))
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (schedule = [[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - समतल लिस्ट: [[1, 3], [6, 7], [2, 4], [2, 5], [9, 12]]।<br/>
    - सॉर्टेड: [[1, 3], [2, 4], [2, 5], [6, 7], [9, 12]]।<br/>
    - मर्ज लिस्ट: [[1, 5], [6, 7], [9, 12]]।<br/>
    - खाली अंतराल: [5, 6] और [7, 9]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-6:</b> नेस्टेड अनुसूचियों को एक फ्लैट एरे में बदलना।</li>
    <li><b>लाइन 7-9:</b> खाली होने पर सूची लौटाना, शुरुआत समय के अनुसार सॉर्ट करना।</li>
    <li><b>लाइन 11-17:</b> ओवरलैप होने वाले अंतरालों को मर्ज करना।</li>
    <li><b>लाइन 19-21:</b> मर्ज किए गए अंतरालों के बीच के खाली स्थान (gaps) रिकॉर्ड करना।</li>
    <li><b>लाइन 22:</b> खाली अंतरालों की सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b807f",
    title: "Interval intersection Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Two Pointers Intersection Formula</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers <code>i</code> and <code>j</code> on both lists. Intersection range is <code>[max(A[i][0], B[j][0]), min(A[i][1], B[j][1])]</code>. If <code>start <= end</code>, it is valid. Advance pointer pointing to interval that ends earlier.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(M + N) | 🧠 Space: O(M + N) for result array</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def intervalIntersection(self, firstList: List[List[int]], secondList: List[List[int]]) -> List[List[int]]:
        i, j = 0, 0
        ans = []
        while i < len(firstList) and j < len(secondList):
            start = max(firstList[i][0], secondList[j][0])
            end = min(firstList[i][1], secondList[j][1])
            if start <= end:
                ans.append([start, end])
            if firstList[i][1] < secondList[j][1]:
                i += 1
            else:
                j += 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (A = [[0, 2], [5, 10]], B = [[1, 5]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0, j = 0: start = max(0, 1) = 1, end = min(2, 5) = 2. 1 <= 2 -> ans = [[1, 2]]. A[0][1] (2) < B[0][1] (5) -> i = 1.<br/>
    - i = 1, j = 0: start = max(5, 1) = 5, end = min(10, 5) = 5. 5 <= 5 -> ans = [[1, 2], [5, 5]]. A[1][1] (10) >= B[0][1] (5) -> j = 1.<br/>
    - Loop ends. Returns [[1, 2], [5, 5]]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function declaration.</li>
    <li><b>Line 3-4:</b> Pointers i and j initialization, result list.</li>
    <li><b>Line 5:</b> Loop while both pointers are within bounds of lists.</li>
    <li><b>Line 6-7:</b> Intersection start is maximum of starts, end is minimum of ends.</li>
    <li><b>Line 8-9:</b> If start <= end, overlap exists. Add to result list.</li>
    <li><b>Line 10-13:</b> Move pointer of list whose current interval ends earlier.</li>
    <li><b>Line 14:</b> Return results list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 टू पॉइंटर्स इंटरसेक्शन सूत्र (Two Pointers Intersection)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दोनों सूचियों पर पॉइंटर्स <code>i</code> और <code>j</code> रखें। प्रतिच्छेदन (intersection) सीमा <code>[max(A[i][0], B[j][0]), min(A[i][1], B[j][1])]</code> है। यदि <code>start <= end</code> है, तो वह वैध है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(M + N) | 🧠 स्थान: O(M + N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def intervalIntersection(self, firstList: List[List[int]], secondList: List[List[int]]) -> List[List[int]]:
        i, j = 0, 0
        ans = []
        while i < len(firstList) and j < len(secondList):
            start = max(firstList[i][0], secondList[j][0])
            end = min(firstList[i][1], secondList[j][1])
            if start <= end:
                ans.append([start, end])
            if firstList[i][1] < secondList[j][1]:
                i += 1
            else:
                j += 1
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (A = [[0, 2], [5, 10]], B = [[1, 5]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0, j = 0: start = max(0, 1) = 1, end = min(2, 5) = 2. 1 <= 2 -> ans = [[1, 2]]। i = 1 (चूंकि 2 < 5 है)।<br/>
    - i = 1, j = 0: start = max(5, 1) = 5, end = min(10, 5) = 5. 5 <= 5 -> ans = [[1, 2], [5, 5]]। j = 1 (चूंकि 10 >= 5 है)।<br/>
    - परिणाम: [[1, 2], [5, 5]]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> पॉइंटर्स i, j और परिणाम सूची घोषित करना।</li>
    <li><b>लाइन 5:</b> लूप चलाना जब तक पॉइंटर्स सूचियों की सीमा में रहें।</li>
    <li><b>लाइन 6-7:</b> प्रतिच्छेदन सीमा मापना (शुरुआत का अधिकतम और समाप्ति का न्यूनतम)।</li>
    <li><b>लाइन 8-9:</b> यदि ओवरलैप है, तो उसे परिणाम में जोड़ना।</li>
    <li><b>लाइन 10-13:</b> उस अंतराल का पॉइंटर आगे बढ़ाना जो पहले समाप्त होता है।</li>
    <li><b>लाइन 14:</b> परिणामी प्रतिच्छेदन सूची लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b8081",
    title: "Car pooling Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Sweeping Line / Difference Array</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Create changes list mapping indices to location offsets. For trip <code>[num, start, end]</code>, add <code>num</code> passengers at <code>start</code> and subtract <code>num</code> at <code>end</code>. Traverse array and track if cumulative passengers exceed capacity.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N + D) where D is location range (1001) | 🧠 Space: O(D)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:
        changes = [0] * 1001
        for trip in trips:
            num, start, end = trip
            changes[start] += num
            changes[end] -= num
        
        current_passengers = 0
        for change in changes:
            current_passengers += change
            if current_passengers > capacity:
                return False
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (trips = [[2, 1, 5], [3, 3, 7]], capacity = 4)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - changes array changes[1] = 2, changes[5] = -2, changes[3] = 3, changes[7] = -3.<br/>
    - location 1: current = 2 <= 4. Valid.<br/>
    - location 3: current = 2 + 3 = 5 > 4 (exceeds capacity!). Returns False. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and carPooling function signature.</li>
    <li><b>Line 3:</b> Set up changes array mapping locations (size 1001 per constraints).</li>
    <li><b>Line 4-7:</b> Loop trips. Add passenger count at start location, subtract at end.</li>
    <li><b>Line 9-13:</b> Loop location changes chronologically. Track cumulative passenger count. Return False if count exceeds capacity.</li>
    <li><b>Line 14:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 स्वीपिंग लाइन / अंतर एरे (Difference Array)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">स्थानों के लिए बदलाव सूची (changes array) बनाएं। प्रत्येक यात्रा <code>[num, start, end]</code> के लिए, <code>start</code> पर <code>num</code> यात्री जोड़ें और <code>end</code> पर <code>num</code> घटाएं। संचयी यात्रियों की जाँच करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N + D) जहाँ D = 1001 | 🧠 स्थान: O(D)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:
        changes = [0] * 1001
        for trip in trips:
            num, start, end = trip
            changes[start] += num
            changes[end] -= num
        
        current_passengers = 0
        for change in changes:
            current_passengers += change
            if current_passengers > capacity:
                return False
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (trips = [[2, 1, 5], [3, 3, 7]], capacity = 4)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - changes एरे: changes[1] = 2, changes[5] = -2, changes[3] = 3, changes[7] = -3।<br/>
    - स्थान 1: यात्री संख्या = 2 <= 4।<br/>
    - स्थान 3: यात्री संख्या = 2 + 3 = 5 > 4 (क्षमता से अधिक!). Returns False.
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> 1001 साइज का बदलाव एरे (changes) घोषित करना।</li>
    <li><b>लाइन 4-7:</b> प्रत्येक यात्रा के लिए शुरू होने वाले स्थान पर यात्री जोड़ना और समाप्त होने वाले पर घटाना।</li>
    <li><b>लाइन 9-13:</b> बदलाव एरे पर क्रमिक रूप से लूप चलाना। यदि यात्री संख्या क्षमता से अधिक है, तो False लौटाना।</li>
    <li><b>लाइन 14:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75052c05bf5f0580b8083",
    title: "My calendar I Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Overlap verification)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Verify new booking with existing booked ranges: <code>start < booked_end and end > booked_start</code>. If overlap, reject booking.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) per call | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class MyCalendar:
    def __init__(self):
        self.calendar = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.calendar:
            if start < e and end > s:
                return False
        self.calendar.append([start, end])
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Constructor setups calendar booking array lists.</li>
    <li><b>Line 5-8:</b> Loop booked events. Return False if booking overlaps with any event.</li>
    <li><b>Line 9-10:</b> Add booking to calendar, return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (सत्यापन ओवरलैप)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">नई बुकिंग को पहले से बुक की गई सीमाओं के साथ जांचें: <code>start < booked_end and end > booked_start</code>। ओवरलैप होने पर बुकिंग अस्वीकार करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class MyCalendar:
    def __init__(self):
        self.calendar = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.calendar:
            if start < e and end > s:
                return False
        self.calendar.append([start, end])
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> कंस्ट्रक्टर घोषणा। खाली बुकिंग लिस्ट (calendar) घोषित करना।</li>
    <li><b>लाइन 5-8:</b> बुक हो चुकी घटनाओं पर लूप। ओवरलैप होने पर False लौटाना।</li>
    <li><b>लाइन 9-10:</b> बुकिंग को लिस्ट में जोड़ना और True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "6a1d415c4ea9a30357efaadf",
    title: "1854. Maximum Population Year Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Difference Array / Sweeping Line</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Years range is bounded (1950 to 2050). Initialize an array of size 101. Increment birth year index, decrement death year index. Traverse chronological prefix sums, tracking maximum population and earliest year.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N + Y) where Y is years range (101) | 🧠 Space: O(Y)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximumPopulation(self, logs: List[List[int]]) -> int:
        year_changes = [0] * 101
        for birth, death in logs:
            year_changes[birth - 1950] += 1
            year_changes[death - 1950] -= 1
            
        max_pop = 0
        max_year = 1950
        curr_pop = 0
        for i in range(101):
            curr_pop += year_changes[i]
            if curr_pop > max_pop:
                max_pop = curr_pop
                max_year = 1950 + i
        return max_year</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (logs = [[1993, 1999], [2000, 2010]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - year_changes[43] = 1 (1993). year_changes[49] = -1 (1999).<br/>
    - year_changes[50] = 1 (2000). year_changes[60] = -1 (2010).<br/>
    - Accumulating:<br/>
    &nbsp;&nbsp;• Year 1993: population = 1. max_pop = 1, max_year = 1993.<br/>
    &nbsp;&nbsp;• Year 1999: population = 0.<br/>
    &nbsp;&nbsp;• Year 2000: population = 1. (not > max_pop(1), keeps 1993).<br/>
    - Returns 1993. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and maximumPopulation method signature.</li>
    <li><b>Line 3:</b> Set population changes array (offset 1950, size 101).</li>
    <li><b>Line 4-6:</b> Loop logs. Offset birth year and increment. Offset death year and decrement.</li>
    <li><b>Line 8-10:</b> Initialize max tracker variables.</li>
    <li><b>Line 11-15:</b> Loop through year indices. Accumulate prefix sum, updating earliest maximum population year.</li>
    <li><b>Line 16:</b> Return max population year.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 अंतर एरे / स्वीपिंग लाइन (Difference Array)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">वर्षों की सीमा सीमित है (1950 से 2050)। 101 साइज का एरे बनाएं। जन्म वाले इंडेक्स पर 1 जोड़ें, और मृत्यु वाले इंडेक्स पर 1 घटाएं। क्रमिक योग से अधिकतम जनसंख्या वर्ष ट्रैक करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N + Y) जहाँ Y = 101 | 🧠 स्थान: O(Y)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maximumPopulation(self, logs: List[List[int]]) -> int:
        year_changes = [0] * 101
        for birth, death in logs:
            year_changes[birth - 1950] += 1
            year_changes[death - 1950] -= 1
            
        max_pop = 0
        max_year = 1950
        curr_pop = 0
        for i in range(101):
            curr_pop += year_changes[i]
            if curr_pop > max_pop:
                max_pop = curr_pop
                max_year = 1950 + i
        return max_year</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (logs = [[1993, 1999], [2000, 2010]])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - year_changes[43] = 1 (1993) | year_changes[49] = -1 (1999)।<br/>
    - year_changes[50] = 1 (2000) | year_changes[60] = -1 (2010)।<br/>
    - क्रमिक संचय:<br/>
    &nbsp;&nbsp;• वर्ष 1993: जनसंख्या = 1। max_pop = 1, max_year = 1993।<br/>
    &nbsp;&nbsp;• वर्ष 2000: जनसंख्या = 1 (1993 ही रहेगा)।<br/>
    - परिणाम: 1993 लौटाया।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> 101 साइज का वर्ष बदलाव एरे (year_changes) बनाना।</li>
    <li><b>लाइन 4-6:</b> जन्म वर्ष में 1950 घटाकर इंडेक्स पर 1 जोड़ना, मृत्यु वर्ष में घटाकर 1 कम करना।</li>
    <li><b>लाइन 8-10:</b> अधिकतम जनसंख्या, वर्ष और चालू जनसंख्या वेरिएबल्स घोषित करना।</li>
    <li><b>लाइन 11-15:</b> वर्ष इंडेक्स पर लूप और चालू जनसंख्या संचय। नया रिकॉर्ड बनने पर अधिकतम वर्ष बदलना।</li>
    <li><b>लाइन 16:</b> परिणामी वर्ष लौटाना।</li>
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
    
    console.log("Cleaning up old seeded intervals notes...");
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
        tags: ["Intervals", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed intervals notes...`);
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
