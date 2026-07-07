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
const parentTaskId = "69e7505fc05bf5f0580b809b";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #0d9488; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #ccfbf1; padding-bottom: 6px; margin-top: 0;">📐 Top K Elements Identification Blueprint</h3>
  
  <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0f766e; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Top K Elements Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #115e59; line-height: 1.5;">
      Apply Top K Elements pattern when the objective is to track the "largest K", "smallest K", or "most frequent K" values from an array or a live data stream. Using a Heap optimizes sorting from <code>O(N log N)</code> to <code>O(N log K)</code>.
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Algorithm Guidelines</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Problem Class</th>
          <th style="padding: 6px 4px; font-weight: 700;">Heap Selection & Size Constraint</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">K Largest Elements</td>
          <td style="padding: 6px 4px;">Maintain a <b>Min-Heap</b> of size K. Pop the minimum element when size exceeds K.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">K Smallest Elements</td>
          <td style="padding: 6px 4px;">Maintain a <b>Max-Heap</b> of size K (invert values to negative numbers in Python).</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">Top K Frequent</td>
          <td style="padding: 6px 4px;">Hash map frequencies first, then push <code>(frequency, element)</code> tuples to Min-Heap.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">Live Stream Median</td>
          <td style="padding: 6px 4px;">Use two heaps: Max-Heap for the smaller half, Min-Heap for the larger half. Keep balanced.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #0d9488; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #ccfbf1; padding-bottom: 6px; margin-top: 0;">📐 टॉप K तत्व (Top K Elements) पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0f766e; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 टॉप K तत्वों की समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #115e59; line-height: 1.5;">
      जब समस्या में किसी एरे या लाइव स्ट्रीम से "K सबसे बड़े", "K सबसे छोटे", या "K सबसे लगातार" मानों को खोजने की आवश्यकता हो। हीप (Heap) का उपयोग करने से समय <code>O(N log N)</code> से सुधरकर <code>O(N log K)</code> हो जाता है।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य नियम</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">समस्या श्रेणी</th>
          <th style="padding: 6px 4px; font-weight: 700;">हीप चयन और आकार नियम</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">K सबसे बड़े तत्व</td>
          <td style="padding: 6px 4px;">K आकार का <b>मिन-हीप (Min-Heap)</b> बनाए रखें। आकार K से अधिक होने पर सबसे छोटा तत्व हटा दें (pop)।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">K सबसे छोटे तत्व</td>
          <td style="padding: 6px 4px;">K आकार का <b>मैक्स-हीप (Max-Heap)</b> बनाए रखें (पायथन में ऋणात्मक संख्या डालें)।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">टॉप K लगातार</td>
          <td style="padding: 6px 4px;">पहले हैश मैप से आवृत्तियाँ गिनें, फिर <code>(frequency, element)</code> मिन-हीप में डालें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0d9488;">स्ट्रीम मध्यिका (Median)</td>
          <td style="padding: 6px 4px;">दो हीप का उपयोग करें: छोटे आधे भाग के लिए मैक्स-हीप, बड़े आधे भाग के लिए मिन-हीप। संतुलित रखें।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Top K Elements Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Top-K-Elements", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e7505fc05bf5f0580b809d",
    title: "Top K frequent elements Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Sorting Frequencies</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Map frequencies, then sort full key list by frequency. Slow for large unique key counts.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N log N) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Min-Heap of Size K)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies using Map. Push <code>(frequency, element)</code> tuples to a Min-Heap. If heap size exceeds K, pop top. The heap retains the top K frequent elements.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N log K) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq
from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        heap = []
        for num, freq in count.items():
            heapq.heappush(heap, (freq, num))
            if len(heap) > k:
                heapq.heappop(heap)
        return [val[1] for val in heap]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 1, 1, 2, 2, 3], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - count = {1: 3, 2: 2, 3: 1}.<br/>
    - Push (3, 1) -> heap = [(3, 1)].<br/>
    - Push (2, 2) -> heap = [(2, 2), (3, 1)].<br/>
    - Push (1, 3) -> heap = [(1, 3), (3, 1), (2, 2)] | size exceeds 2 -> pop (1, 3). heap = [(2, 2), (3, 1)].<br/>
    - Returns [2, 1]. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Import modules.</li>
    <li><b>Line 3-4:</b> Class and topKFrequent signature.</li>
    <li><b>Line 5:</b> Map frequencies.</li>
    <li><b>Line 6-9:</b> Push (freq, value) tuples to heap. If size exceeds k, pop.</li>
    <li><b>Line 10:</b> Extract element values from heap and return.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 संपूर्ण एरे सॉर्ट करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी आवृत्तियों को मैप करें, फिर पूरी लिस्ट को सॉर्ट करें। बड़े मानों के लिए बहुत धीमा।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N log N) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Min-Heap)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Map से आवृत्तियों को गिनें। <code>(frequency, element)</code> के जोड़ों को मिन-हीप में डालें। हीप का आकार K से अधिक होने पर पॉप करें। हीप में केवल टॉप K तत्व बचेंगे।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N log K) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq
from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        heap = []
        for num, freq in count.items():
            heapq.heappush(heap, (freq, num))
            if len(heap) > k:
                heapq.heappop(heap)
        return [val[1] for val in heap]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 1, 1, 2, 2, 3], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - count = {1: 3, 2: 2, 3: 1}।<br/>
    - (3, 1) डालें -> heap = [(3, 1)]।<br/>
    - (2, 2) डालें -> heap = [(2, 2), (3, 1)]।<br/>
    - (1, 3) डालें -> heap size > 2 -> पॉप (1, 3) -> heap = [(2, 2), (3, 1)]।<br/>
    - परिणाम: [2, 1]।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> आवश्यक मॉड्यूल इम्पोर्ट करना।</li>
    <li><b>लाइन 3-4:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 5:</b> अंकों की आवृत्ति गिनना।</li>
    <li><b>लाइन 6-9:</b> प्रत्येक अनोखे अंक के जोड़े को हीप में डालना, हीप का आकार k से अधिक होने पर पॉप करना।</li>
    <li><b>लाइन 10:</b> हीप में बचे अंकों के मानों को निकालकर परिणाम में लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b809f",
    title: "Kth Largest Element in an Array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Min-Heap of Size K</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep a Min-Heap of size K. Loop elements. Push element. If heap size exceeds K, pop minimum element. The heap top retains the Kth largest element.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log K) | 🧠 Space: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [3, 2, 1, 5, 6, 4], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Loop values: 3 -> heap=[3]. 2 -> heap=[2, 3].<br/>
    - 1 -> push 1 -> pop min (1). heap=[2, 3].<br/>
    - 5 -> push 5 -> pop min (2). heap=[3, 5].<br/>
    - 6 -> push 6 -> pop min (3). heap=[5, 6].<br/>
    - 4 -> push 4 -> pop min (4). heap=[5, 6].<br/>
    - Returns heap[0] = 5. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1:</b> Import heapq.</li>
    <li><b>Line 2-3:</b> Class and findKthLargest method signature.</li>
    <li><b>Line 4-5:</b> Initialize empty list heap, loop elements.</li>
    <li><b>Line 6-8:</b> Push element to heap. If size exceeds k, pop minimum element.</li>
    <li><b>Line 9:</b> Return heap[0] (Kth largest element).</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 आकार K का मिन-हीप</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">K आकार का मिन-हीप रखें। तत्वों पर लूप करें। हीप में तत्व धकेलें, यदि आकार K से अधिक हो तो सबसे छोटा पॉप करें। हीप का शीर्ष तत्व ही K-वां सबसे बड़ा मान होगा।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log K) | 🧠 स्थान: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [3, 2, 1, 5, 6, 4], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - लूप मान: 3 -> heap=[3] | 2 -> heap=[2, 3]।<br/>
    - 1 -> push 1 -> pop 1 -> heap=[2, 3]।<br/>
    - 5 -> push 5 -> pop 2 -> heap=[3, 5]।<br/>
    - 6 -> push 6 -> pop 3 -> heap=[5, 6]।<br/>
    - 4 -> push 4 -> pop 4 -> heap=[5, 6]।<br/>
    - परिणाम: heap[0] = 5।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1:</b> heapq मॉड्यूल इम्पोर्ट करना।</li>
    <li><b>लाइन 2-3:</b> क्लास और फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4-5:</b> खाली हीप और लूप की शुरुआत।</li>
    <li><b>लाइन 6-8:</b> हीप में तत्व डालना और आकार k से अधिक होने पर सबसे छोटा पॉप करना।</li>
    <li><b>लाइन 9:</b> हीप का शीर्ष मान (heap[0]) लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80a1",
    title: "K Closest Points to Origin Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Max-Heap storing negative distances</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain Max-Heap of size K (using negative values in Python: <code>-(x^2 + y^2)</code>). Pop elements with largest distance when size exceeds K. The remaining K values are the closest points.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log K) | 🧠 Space: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []
        for x, y in points:
            dist = -(x**2 + y**2)
            heapq.heappush(heap, (dist, [x, y]))
            if len(heap) > k:
                heapq.heappop(heap)
        return [val[1] for val in heap]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1:</b> Import heapq.</li>
    <li><b>Line 2-3:</b> Class and kClosest method signature.</li>
    <li><b>Line 4-5:</b> Set heap list, loop coordinates.</li>
    <li><b>Line 6-8:</b> Calculate negative distance, push tuple of negative distance and coordinates, pop if size > k.</li>
    <li><b>Line 9:</b> Return coordinates list from heap elements.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 ऋणात्मक दूरी के साथ मैक्स-हीप</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">आकार K का मैक्स-हीप रखें (पायथन में ऋणात्मक मान <code>-(x^2 + y^2)</code> उपयोग करके)। जब हीप का आकार K से अधिक हो, तो सबसे दूर वाले बिंदु को पॉप करें। हीप में बचे K बिंदु सबसे करीब होंगे।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log K) | 🧠 स्थान: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []
        for x, y in points:
            dist = -(x**2 + y**2)
            heapq.heappush(heap, (dist, [x, y]))
            if len(heap) > k:
                heapq.heappop(heap)
        return [val[1] for val in heap]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1:</b> heapq मॉड्यूल इम्पोर्ट करना।</li>
    <li><b>लाइन 2-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4-5:</b> खाली हीप बनाना, बिंदुओं पर लूप चलाना।</li>
    <li><b>लाइन 6-8:</b> ऋणात्मक दूरी मापना, हीप में डालना, आकार K से बड़ा होने पर पॉप करना।</li>
    <li><b>लाइन 9:</b> हीप के मानों को निकालकर परिणाम में लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80a3",
    title: "Merge K sorted lists Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Min-Heap traversal pointers)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Push first node of each list onto a Min-Heap. Pop smallest node, link to merged list, and push next node from the same list onto heap.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N log K) | 🧠 Space: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))
                
        dummy = ListNode(0)
        curr = dummy
        while heap:
            val, i, node = heapq.heappop(heap)
            curr.next = node
            curr = curr.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1:</b> Import heapq.</li>
    <li><b>Line 2-3:</b> Class and mergeKLists method parameters.</li>
    <li><b>Line 4-7:</b> Initialize heap. Push first node of each list with list index (index ensures uniqueness in sorting).</li>
    <li><b>Line 9-10:</b> Create dummy linked list node and current pointer.</li>
    <li><b>Line 11-14:</b> Pop minimum node, link to merged list, shift pointer.</li>
    <li><b>Line 15-16:</b> If popped node has next element, push next node onto heap.</li>
    <li><b>Line 17:</b> Return merged head.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Min-Heap पॉइंटर्स)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक लिस्ट के पहले नोड को मिन-हीप में धकेलें। हीप से सबसे छोटा नोड पॉप करें, उसे मर्ज सूची से जोड़ें, और उस लिस्ट के अगले नोड को हीप में डालें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N log K) | 🧠 स्थान: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))
                
        dummy = ListNode(0)
        curr = dummy
        while heap:
            val, i, node = heapq.heappop(heap)
            curr.next = node
            curr = curr.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1:</b> heapq मॉड्यूल इम्पोर्ट करना।</li>
    <li><b>लाइन 2-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4-7:</b> हीप बनाना, प्रत्येक लिस्ट के पहले नोड को इंडेक्स के साथ हीप में डालना।</li>
    <li><b>लाइन 9-10:</b> एक डमी नोड (dummy) और पॉइंटर (curr) बनाना।</li>
    <li><b>लाइन 11-14:</b> हीप से सबसे छोटा नोड पॉप करना, उसे मर्ज सूची से जोड़ना, पॉइंटर खिसकाना।</li>
    <li><b>लाइन 15-16:</b> यदि पॉप किए गए नोड के बाद कोई नोड है, तो उसे हीप में डालना।</li>
    <li><b>लाइन 17:</b> डमी के बाद का अगला नोड (merged head) लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80a5",
    title: "Kth Smallest Element in a Sorted Matrix Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Min-Heap traversal rows)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Similar to merge lists. Push first element of each row <code>(matrix[r][0], r, 0)</code> onto heap. Pop minimum element K-1 times. On each pop, if row has another element, push it onto heap. The heap top is the Kth smallest.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(K log N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:
        n = len(matrix)
        heap = []
        for r in range(min(n, k)):
            heapq.heappush(heap, (matrix[r][0], r, 0))
            
        for _ in range(k - 1):
            val, r, c = heapq.heappop(heap)
            if c + 1 < n:
                heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))
        return heap[0][0]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and kthSmallest method signature.</li>
    <li><b>Line 3-6:</b> Fetch size, push first column values of each row to heap.</li>
    <li><b>Line 8-11:</b> Loop k-1 times: pop minimum element, if column has next element, push it to heap.</li>
    <li><b>Line 12:</b> Return top of heap (Kth smallest element).</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Min-Heap traversal rows)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">मर्ज लिस्ट के समान। प्रत्येक पंक्ति के पहले तत्व <code>(matrix[r][0], r, 0)</code> को हीप में डालें। K-1 बार न्यूनतम तत्व पॉप करें। प्रत्येक पॉप पर, पंक्ति का अगला तत्व हीप में डालें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(K log N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:
        n = len(matrix)
        heap = []
        for r in range(min(n, k)):
            heapq.heappush(heap, (matrix[r][0], r, 0))
            
        for _ in range(k - 1):
            val, r, c = heapq.heappop(heap)
            if c + 1 < n:
                heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))
        return heap[0][0]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-6:</b> प्रत्येक पंक्ति के पहले कॉलम के तत्वों को उनके इंडेक्स के साथ हीप में धकेलना।</li>
    <li><b>लाइन 8-11:</b> K-1 बार लूप चलाना: न्यूनतम पॉप करना, पंक्ति में अगला तत्व होने पर हीप में डालना।</li>
    <li><b>लाइन 12:</b> हीप का शीर्ष मान (K-वां सबसे छोटा) लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80a7",
    title: "Find median from data stream Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Two Heaps Balancing Act</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use two heaps:
      - Max-Heap <code>small</code> to store smaller half of numbers.
      - Min-Heap <code>large</code> to store larger half of numbers.
      Balance sizes: small heap length is equal to or larger than large heap length by at most 1.
      Median: if sizes differ, return top of small heap, otherwise average of tops.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(log N) add, O(1) median | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class MedianFinder:
    def __init__(self):
        self.small = [] # max-heap (negative values)
        self.large = [] # min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        # Balance heap bounds
        val = -heapq.heappop(self.small)
        heapq.heappush(self.large, val)
        if len(self.small) < len(self.large):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2.0</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-5:</b> Init lists. small stores max-heap negative numbers, large stores min-heap.</li>
    <li><b>Line 7-11:</b> Push to small max-heap, pop max and push to large heap to maintain partition boundaries.</li>
    <li><b>Line 12-14:</b> Balance size of heaps: keep small heap length >= large heap length.</li>
    <li><b>Line 16-19:</b> Return median. If small size is larger, return top of small, else average of tops.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 दो हीप का संतुलन नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दो हीप का उपयोग करें:
      - छोटे आधे भाग के लिए मैक्स-हीप <code>small</code>।
      - बड़े आधे भाग के लिए मिन-हीप <code>large</code>।
      आकार संतुलित करें: small का आकार large से बराबर या 1 अधिक होना चाहिए।
      मध्यिका: आकार भिन्न होने पर small का शीर्ष, अन्यथा दोनों शीर्षों का औसत।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(log N) जोड़ना, O(1) मध्यिका | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class MedianFinder:
    def __init__(self):
        self.small = [] # max-heap (negative values)
        self.large = [] # min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        # Balance heap bounds
        val = -heapq.heappop(self.small)
        heapq.heappush(self.large, val)
        if len(self.small) < len(self.large):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2.0</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-5:</b> small (मैक्स-हीप) और large (मिन-हीप) सूचियों को इनिशियलाइज़ करना।</li>
    <li><b>लाइन 7-11:</b> पहले small में अंक धकेलना, उसके अधिकतम को निकालकर large में डालना ताकि विभाजन क्रम बना रहे।</li>
    <li><b>लाइन 12-14:</b> हीप के आकारों को संतुलित रखना (small का आकार बड़ा या बराबर रखें)।</li>
    <li><b>लाइन 16-19:</b> मध्यिका का मान मापना। विषम होने पर small का शीर्ष, सम होने पर दोनों शीर्षों का औसत लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80a9",
    title: "Reorganize string Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Greedy Max-Heap Reorganization</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies. Store negative counts in Max-Heap. Pop most frequent character, append to answer, and temporarily hold it. Push it back on next step (after using a different character) if its count > 0.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log A) where A is alphabet size (26) | 🧠 Space: O(A)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq
from collections import Counter

class Solution:
    def reorganizeString(self, s: str) -> str:
        count = Counter(s)
        heap = [(-freq, char) for char, freq in count.items()]
        heapq.heapify(heap)
        
        ans = []
        prev_freq, prev_char = 0, ''
        while heap:
            freq, char = heapq.heappop(heap)
            ans.append(char)
            if prev_freq < 0:
                heapq.heappush(heap, (prev_freq, prev_char))
            prev_freq, prev_char = freq + 1, char
            
        res = "".join(ans)
        return res if len(res) == len(s) else ""</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-5:</b> Count frequencies, map counts to negative tuples, build heap.</li>
    <li><b>Line 7-8:</b> Result string array list and prev trackers.</li>
    <li><b>Line 9:</b> Loop until heap is empty.</li>
    <li><b>Line 10-11:</b> Pop most frequent character, append to result.</li>
    <li><b>Line 12-13:</b> Push back previous character to heap if it has remaining frequency.</li>
    <li><b>Line 14:</b> Record popped character as new previous state (with decremented frequency).</li>
    <li><b>Line 15-16:</b> Return joined string if length matches, else empty string.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 मैक्स-हीप से अक्षरों का पुनर्गठन नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">आवृत्तियाँ गिनें। ऋणात्मक आवृत्तियों को हीप में डालें। सबसे लगातार वाले को पॉप करें, परिणाम में जोड़ें, और होल्ड पर रखें। अगले चरण में (दूसरे अक्षर का उपयोग करने के बाद) बचे होने पर वापस हीप में डालें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log A) जहाँ A = 26 | 🧠 स्थान: O(A)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq
from collections import Counter

class Solution:
    def reorganizeString(self, s: str) -> str:
        count = Counter(s)
        heap = [(-freq, char) for char, freq in count.items()]
        heapq.heapify(heap)
        
        ans = []
        prev_freq, prev_char = 0, ''
        while heap:
            freq, char = heapq.heappop(heap)
            ans.append(char)
            if prev_freq < 0:
                heapq.heappush(heap, (prev_freq, prev_char))
            prev_freq, prev_char = freq + 1, char
            
        res = "".join(ans)
        return res if len(res) == len(s) else ""</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-5:</b> अक्षरों की आवृत्तियाँ गिनकर मैक्स-हीप (ऋणात्मक मान) बनाना।</li>
    <li><b>लाइन 7-8:</b> परिणाम सूची और पिछले अक्षर के ट्रैकर्स (prev_freq/char) घोषित करना।</li>
    <li><b>लाइन 9:</b> जब तक हीप खाली न हो, लूप चलाना।</li>
    <li><b>लाइन 10-11:</b> अधिकतम आवृत्ति वाला अक्षर पॉप करना, उत्तर में जोड़ना।</li>
    <li><b>लाइन 12-13:</b> यदि पिछले होल्ड किए गए अक्षर की आवृत्ति बची है (prev_freq < 0), तो उसे वापस हीप में डालना।</li>
    <li><b>लाइन 14:</b> आज पॉप किए गए अक्षर को नए होल्ड (prev) पर सेट करना।</li>
    <li><b>लाइन 15-16:</b> यदि परिणाम की लंबाई मूल स्ट्रिंग के बराबर है, तो परिणाम लौटाना, अन्यथा खाली स्ट्रिंग।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80ab",
    title: "Task scheduler Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Mathematical Max Idle formula)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Find max frequency task <code>f_max</code>. Find count of tasks with this maximum frequency <code>n_max</code>. The formula bounds minimum time intervals to: <code>max(len(tasks), (f_max - 1) * (n + 1) + n_max)</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = Counter(tasks)
        f_max = max(count.values())
        n_max = list(count.values()).count(f_max)
        return max(len(tasks), (f_max - 1) * (n + 1) + n_max)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and leastInterval function signature.</li>
    <li><b>Line 4:</b> Count frequencies using Counter.</li>
    <li><b>Line 5:</b> Fetch highest task frequency value.</li>
    <li><b>Line 6:</b> Count how many tasks share this maximum frequency.</li>
    <li><b>Line 7:</b> Return math schedule limit value.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (गणितीय कूल-डाउन सूत्र)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अधिकतम आवृत्ति वाले कार्य <code>f_max</code> को खोजें। इस अधिकतम आवृत्ति वाले कार्यों की संख्या <code>n_max</code> ज्ञात करें। न्यूनतम आवश्यक अंतराल समय सूत्र: <code>max(len(tasks), (f_max - 1) * (n + 1) + n_max)</code> है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = Counter(tasks)
        f_max = max(count.values())
        n_max = list(count.values()).count(f_max)
        return max(len(tasks), (f_max - 1) * (n + 1) + n_max)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4:</b> कार्यों की आवृत्ति गिनना।</li>
    <li><b>लाइन 5:</b> अधिकतम आवृत्ति मान ज्ञात करना।</li>
    <li><b>लाइन 6:</b> अधिकतम आवृत्ति वाले कार्यों की संख्या गिनना।</li>
    <li><b>लाइन 7:</b> गणितीय सूत्र परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80ad",
    title: "Sort characters by frequency Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Max-Heap)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies using Map. Store negative frequencies in Max-Heap. Pop character, append character multiplied by its count to result string.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N + A log A) where A is unique characters count | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq
from collections import Counter

class Solution:
    def frequencySort(self, s: str) -> str:
        count = Counter(s)
        heap = [(-freq, char) for char, freq in count.items()]
        heapq.heapify(heap)
        
        ans = []
        while heap:
            freq, char = heapq.heappop(heap)
            ans.append(char * -freq)
        return "".join(ans)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-5:</b> Count frequencies, map counts to negative tuples, build heap.</li>
    <li><b>Line 7-9:</b> While heap has entries, pop highest frequency character, multiply by count, append to result.</li>
    <li><b>Line 10:</b> Return joined result.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Max-Heap)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Map से आवृत्तियाँ गिनें। ऋणात्मक आवृत्तियों को मैक्स-हीप में डालें। पॉप करें, और अक्षर को उसकी आवृत्ति से गुणा करके परिणाम स्ट्रिंग में जोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N + A log A) जहाँ A = विशिष्ट अक्षर | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq
from collections import Counter

class Solution:
    def frequencySort(self, s: str) -> str:
        count = Counter(s)
        heap = [(-freq, char) for char, freq in count.items()]
        heapq.heapify(heap)
        
        ans = []
        while heap:
            freq, char = heapq.heappop(heap)
            ans.append(char * -freq)
        return "".join(ans)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-5:</b> आवृत्तियाँ गिनकर ऋणात्मक आवृत्ति के साथ हीप बनाना।</li>
    <li><b>लाइन 7-9:</b> हीप खाली होने तक लूप चलाना, सबसे बड़ी आवृत्ति वाले को पॉप करके गुणा करके जोड़ना।</li>
    <li><b>लाइन 10:</b> परिणामी स्ट्रिंग लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80af",
    title: "Find K Closest Elements Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Max-Heap of Size K for Distance Differences</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use a Max-Heap of size K (storing negative distances and negative values). Distance formula: <code>abs(num - x)</code>. Pop elements with largest distance when size exceeds K. Sort remaining elements and return.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N log K + K log K) | 🧠 Space: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def findClosestElements(self, arr: List[int], k: int, x: int) -> List[int]:
        heap = []
        for num in arr:
            dist = abs(num - x)
            heapq.heappush(heap, (-dist, -num))
            if len(heap) > k:
                heapq.heappop(heap)
        return sorted([-val[1] for val in heap])</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-5:</b> Initialize heap list, loop elements.</li>
    <li><b>Line 6-8:</b> Calculate distance, push negative distance and negative value tuples (max-heap simulator), pop top if size > k.</li>
    <li><b>Line 9:</b> Extract values from heap elements, sort them ascending and return.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 दूरी अंतर के लिए आकार K का मैक्स-हीप</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">आकार K का मैक्स-हीप रखें (ऋणात्मक दूरी <code>-abs(num - x)</code> और ऋणात्मक मानों के साथ)। जब आकार K से अधिक हो, तो सबसे बड़ी दूरी वाले तत्वों को पॉप करें। हीप में बचे तत्वों को सॉर्ट करके लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N log K + K log K) | 🧠 स्थान: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">import heapq

class Solution:
    def findClosestElements(self, arr: List[int], k: int, x: int) -> List[int]:
        heap = []
        for num in arr:
            dist = abs(num - x)
            heapq.heappush(heap, (-dist, -num))
            if len(heap) > k:
                heapq.heappop(heap)
        return sorted([-val[1] for val in heap])</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> खाली हीप बनाना, एरे के तत्वों पर लूप चलाना।</li>
    <li><b>लाइन 6-8:</b> दूरी मापना, हीप में ऋणात्मक मान जोड़ना, आकार k से अधिक होने पर पॉप करना।</li>
    <li><b>लाइन 9:</b> हीप के मानों को ऋणात्मक चिह्न हटाकर सॉर्ट करना और परिणाम लौटाना।</li>
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
    
    console.log("Cleaning up old seeded Top K Elements notes...");
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
        tags: ["Top-K-Elements", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed Top K Elements notes...`);
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
