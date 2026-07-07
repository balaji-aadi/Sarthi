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
const parentTaskId = "69d779976d3910f342f3734b";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #0d9488; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #ccfbf1; padding-bottom: 6px; margin-top: 0;">📐 Sliding Window & Two Pointers Blueprint</h3>
  
  <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0f766e; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Sliding Window Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
      Think of Sliding Window / Two Pointers when the problem asks for contiguous subarrays/substrings matching a condition (e.g., maximum sum, longest unique character range, substring containment). It optimizes quadratic brute force O(N²) down to O(N) linear runtime.
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Sliding Window Patterns</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Window Type</th>
          <th style="padding: 6px 4px; font-weight: 700;">Template / Mechanism</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">Fixed-Size Window</td>
          <td style="padding: 6px 4px;">Maintain length <code>K</code>. Add element at <code>right</code>, remove element at <code>left = right - K</code>.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">Variable-Size (Longest)</td>
          <td style="padding: 6px 4px;">Expand <code>right</code>. Shrink <code>left</code> inside a <code>while</code> loop if condition is violated. Track <code>max(right - left + 1)</code>.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">Variable-Size (Shortest)</td>
          <td style="padding: 6px 4px;">Expand <code>right</code> until valid. Shrink <code>left</code> greedily while window remains valid. Track <code>min(right - left + 1)</code>.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">Symmetric Reduction</td>
          <td style="padding: 6px 4px;">For exact matching <code>K</code>, evaluate as <code>atMost(K) - atMost(K - 1)</code> to simplify sliding condition.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #0d9488; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #ccfbf1; padding-bottom: 6px; margin-top: 0;">📐 स्लाइडिंग विंडो और टू पॉइंटर्स ब्लूप्रिंट</h3>
  
  <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0f766e; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 स्लाइडिंग विंडो समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
      स्लाइडिंग विंडो / टू पॉइंटर्स का उपयोग तब करें जब समस्या में किसी शर्त को पूरा करने वाले सन्निहित सबएरे/सबस्ट्रिंग की मांग हो (जैसे अधिकतम योग, सबसे लंबी अद्वितीय कैरेक्टर रेंज)। यह द्विघातीय (quadratic) O(N²) को O(N) में बदल देता है।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 स्लाइडिंग विंडो पैटर्न</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">विंडो का प्रकार</th>
          <th style="padding: 6px 4px; font-weight: 700;">टेम्पलेट / प्रक्रिया</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">निश्चित आकार (Fixed-Size)</td>
          <td style="padding: 6px 4px;">लंबाई <code>K</code> बनाए रखें। <code>right</code> जोड़ें, और <code>left = right - K</code> हटाएँ।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">परिवर्तनीय (सबसे लंबा)</td>
          <td style="padding: 6px 4px;"><code>right</code> बढ़ाएँ। शर्त का उल्लंघन होने पर लूप में <code>left</code> घटाएं। <code>max(right - left + 1)</code> ट्रैक करें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">परिवर्तनीय (सबसे छोटा)</td>
          <td style="padding: 6px 4px;">वैध होने तक <code>right</code> बढ़ाएँ। वैध रहने तक <code>left</code> सिकोड़ें। <code>min(right - left + 1)</code> ट्रैक करें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0f766e;">सममित कमी (Reduction)</td>
          <td style="padding: 6px 4px;">सटीक मिलान <code>K</code> के लिए, स्लाइडिंग स्थिति को सरल बनाने के लिए <code>atMost(K) - atMost(K - 1)</code> करें।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Sliding Window Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Sliding-Window", "Two-Pointers", "Arrays", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69d77a826d3910f342f37539",
    title: "Patterns Brief: Sliding Window & Two Pointers",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Patterns Overview</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0f766e; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">📝 Core Sliding Window Templates</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">This brief outlines standard templates. Think of sliding window as optimization over brute force subarrays, keeping a sliding contiguous range.</p>
  </div>
  <pre class="ql-syntax" spellcheck="false"># Template 1: Fixed Size Window (Length K)
left = 0
for right in range(len(nums)):
    # add nums[right] to window
    if right - left + 1 > k:
        # remove nums[left] from window
        left += 1
    # process valid window

# Template 2: Variable Size Window
left = 0
for right in range(len(nums)):
    # add nums[right] to window state
    while window_is_invalid():
        # remove nums[left] from state
        left += 1
    # update max_length = max(max_length, right - left + 1)</pre>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 पैटर्न अवलोकन</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0f766e; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">📝 मुख्य स्लाइडिंग विंडो टेम्पलेट्स</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">यह ब्रिफ सामान्य स्लाइडिंग विंडो टेम्पलेट्स का विवरण देता है। इसे ब्रूट फ़ोर्स सबएरे से O(N) में अपग्रेड करने की तकनीक के रूप में समझें।</p>
  </div>
  <pre class="ql-syntax" spellcheck="false"># टेम्पलेट 1: निश्चित आकार की विंडो (Fixed Size K)
left = 0
for right in range(len(nums)):
    # nums[right] जोड़ें
    if right - left + 1 > k:
        # nums[left] हटाएँ
        left += 1

# टेम्पलेट 2: परिवर्तनीय आकार की विंडो
left = 0
for right in range(len(nums)):
    # nums[right] जोड़ें
    while window_is_invalid():
        # nums[left] हटाएँ
        left += 1
    # अधिकतम लंबाई अपडेट करें</pre>
</div>`
  },
  {
    taskId: "69d78634ef8d64e8cbe9faf9",
    title: "Maximum Points you can obtain from cards Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Try all splits. Take x cards from left and k - x cards from right. Calculate sum. Complexity is high if subproblems computed repeatedly.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(K²) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Border Sliding Window)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Start with taking all k cards from the left. One by one, remove a card from the left side and add a card from the right side, keeping track of the maximum points.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(K) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxScore(self, cardPoints: List[int], k: int) -> int:
        n = len(cardPoints)
        total_sum = sum(cardPoints[:k])
        max_score = total_sum
        for i in range(k - 1, -1, -1):
            total_sum = total_sum - cardPoints[i] + cardPoints[n - k + i]
            max_score = max(max_score, total_sum)
        return max_score</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Total length n = 7. Initial sum = sum([1, 2, 3]) = 6. max_score = 6.<br/>
    - Loop i from 2 down to 0:<br/>
    &nbsp;&nbsp;• i = 2: total_sum = 6 - cardPoints[2] + cardPoints[7-3+2] = 6 - 3 + cardPoints[6] = 3 + 1 = 4. max_score = max(6, 4) = 6.<br/>
    &nbsp;&nbsp;• i = 1: total_sum = 4 - cardPoints[1] + cardPoints[7-3+1] = 4 - 2 + cardPoints[5] = 2 + 6 = 8. max_score = max(6, 8) = 8.<br/>
    &nbsp;&nbsp;• i = 0: total_sum = 8 - cardPoints[0] + cardPoints[7-3+0] = 8 - 1 + cardPoints[4] = 7 + 5 = 12. max_score = max(8, 12) = 12.<br/>
    - Returns max score 12. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and main function signature.</li>
    <li><b>Line 3:</b> Get length of cards array.</li>
    <li><b>Line 4-5:</b> Sum the first k cards (taking all cards from the left) and initialize max_score.</li>
    <li><b>Line 6:</b> Loop backwards from the last selected left card (k-1) to 0.</li>
    <li><b>Line 7-8:</b> Slide the window by subtracting left card at index i and adding right card. Record max points.</li>
    <li><b>Line 9:</b> Return max score.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 ब्रूट फ़ोर्स दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी विभाजनों को आज़माएं। बाएं से x और दाएं से k - x कार्ड लें। प्रत्येक विभाजन के लिए योग की गणना करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(K²) | 🧠 स्थान: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Border Sliding Window)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">शुरुआत में सभी k कार्डों को बाएं से लें। फिर एक-एक करके बाएं से कार्ड हटाएँ और दाईं ओर का जोड़ें, और अधिकतम स्कोर ट्रैक करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(K) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def maxScore(self, cardPoints: List[int], k: int) -> int:
        n = len(cardPoints)
        total_sum = sum(cardPoints[:k])
        max_score = total_sum
        for i in range(k - 1, -1, -1):
            total_sum = total_sum - cardPoints[i] + cardPoints[n - k + i]
            max_score = max(max_score, total_sum)
        return max_score</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - लंबाई n = 7। शुरुआती योग = sum([1, 2, 3]) = 6। max_score = 6।<br/>
    - लूप i = 2 से 0:<br/>
    &nbsp;&nbsp;• i = 2: total_sum = 6 - 3 + 1 = 4। max_score = max(6, 4) = 6।<br/>
    &nbsp;&nbsp;• i = 1: total_sum = 4 - 2 + 6 = 8। max_score = max(6, 8) = 8।<br/>
    &nbsp;&nbsp;• i = 0: total_sum = 8 - 1 + 5 = 12। max_score = max(8, 12) = 12।<br/>
    - अधिकतम स्कोर 12 मिला।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> एरे की लंबाई प्राप्त करना।</li>
    <li><b>लाइन 4-5:</b> पहले k कार्डों का योग (बाएं से सभी लेकर) और max_score इनिशियलाइज़ करना।</li>
    <li><b>लाइन 6:</b> अंतिम बाएं कार्ड (k-1) से 0 तक पीछे की ओर लूप चलाना।</li>
    <li><b>लाइन 7-8:</b> बाएं इंडेक्स i का मान घटाएं और दाईं ओर का मान जोड़ें। max_score अपडेट करें।</li>
    <li><b>लाइन 9:</b> परिणाम स्कोर लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69d78683ef8d64e8cbe9fc0d",
    title: "Longest substring without repeating characters Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Generate all substrings and check if unique. Highly redundant.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N³) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Sliding Window with Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use a hash map to store last seen index of characters. If a repeating character is seen within the current window boundary, jump the <code>left</code> pointer to the character's last seen index + 1.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(min(M, A)) where A is alphabet size</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right in range(len(s)):
            if s[right] in char_map and char_map[s[right]] >= left:
                left = char_map[s[right]] + 1
            char_map[s[right]] = right
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "abcabcbb")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right = 0 ('a') -> not in map. map = {'a': 0}, max_len = 1.<br/>
    - right = 1 ('b') -> not in map. map = {'a': 0, 'b': 1}, max_len = 2.<br/>
    - right = 2 ('c') -> not in map. map = {'a': 0, 'b': 1, 'c': 2}, max_len = 3.<br/>
    - right = 3 ('a') -> in map at index 0 >= left(0). Jump left to 0 + 1 = 1. Update map = {'a': 3, 'b': 1, 'c': 2}, max_len = 3.<br/>
    - Returns longest substring size 3. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function declaration.</li>
    <li><b>Line 3-5:</b> Initialize character map (character -> last seen index), left pointer, and max length.</li>
    <li><b>Line 6:</b> Loop through string with right pointer.</li>
    <li><b>Line 7-8:</b> If character has been seen and lies inside current window, shift left pointer past its previous location.</li>
    <li><b>Line 9:</b> Record character's current index in map.</li>
    <li><b>Line 10:</b> Update max length with current window size (right - left + 1).</li>
    <li><b>Line 11:</b> Return max length.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 ब्रूट फ़ोर्स दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी सबस्ट्रिंग्स उत्पन्न करें और जांचें कि क्या वे अद्वितीय हैं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N³) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Sliding Window with Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अक्षरों के अंतिम देखे गए सूचकांक (last seen index) को हैश मैप में सहेजें। यदि वही अक्षर दोबारा विंडो सीमा में दिखे, तो <code>left</code> पॉइंटर को उसके अंतिम स्थान + 1 पर ले जाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(min(M, A))</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right in range(len(s)):
            if s[right] in char_map and char_map[s[right]] >= left:
                left = char_map[s[right]] + 1
            char_map[s[right]] = right
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "abcabcbb")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right = 0 ('a') -> map = {'a': 0}, max_len = 1.<br/>
    - right = 1 ('b') -> map = {'a': 0, 'b': 1}, max_len = 2.<br/>
    - right = 2 ('c') -> map = {'a': 0, 'b': 1, 'c': 2}, max_len = 3.<br/>
    - right = 3 ('a') -> 'a' पहले से है, index 0 >= left(0) है। left पॉइंटर को 1 पर ले जाएं। map['a'] = 3, max_len = 3।<br/>
    - अधिकतम लंबाई 3 मिली।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> हैश मैप, बाएं पॉइंटर, और अधिकतम लंबाई वेरिएबल घोषित करना।</li>
    <li><b>लाइन 6:</b> दाईं ओर के पॉइंटर (right) से लूप चलाना।</li>
    <li><b>लाइन 7-8:</b> यदि अक्षर पहले देखा गया है और विंडो में है, तो बाएं पॉइंटर को उसके अंतिम इंडेक्स से 1 स्थान आगे बढ़ाएं।</li>
    <li><b>लाइन 9:</b> अक्षर की वर्तमान इंडेक्स स्थिति मैप में अपडेट करना।</li>
    <li><b>लाइन 10:</b> वर्तमान विंडो के आकार (right - left + 1) के अनुसार अधिकतम लंबाई अपडेट करना।</li>
    <li><b>लाइन 11:</b> अधिकतम लंबाई परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69d799b36f815dc6d8e65a0e",
    title: "Maximum consecutive ones ||| Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Sliding Window Logic</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Find the longest contiguous subarray containing at most K zeros. Expand window. If count of zeros exceeds K, shrink from left until zero count matches limit.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        left = 0
        zeros = 0
        max_len = 0
        for right in range(len(nums)):
            if nums[right] == 0:
                zeros += 1
            while zeros > k:
                if nums[left] == 0:
                    zeros -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 1, 1, 0, 0, 0, 1], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left=0, zeros=0, max_len=0.<br/>
    - right=0 to 2: nums is 1. zeros=0, max_len=3.<br/>
    - right=3: nums[3]=0 -> zeros=1, max_len=4.<br/>
    - right=4: nums[4]=0 -> zeros=2, max_len=5.<br/>
    - right=5: nums[5]=0 -> zeros=3. Since 3 > 2, shrink left:<br/>
    &nbsp;&nbsp;• left=0 (nums[0]=1) -> left=1.<br/>
    &nbsp;&nbsp;• left=1 (nums[1]=1) -> left=2.<br/>
    &nbsp;&nbsp;• left=2 (nums[2]=1) -> left=3.<br/>
    &nbsp;&nbsp;• left=3 (nums[3]=0) -> zeros=2, left=4. Loop ends.<br/>
    - right=6: nums[6]=1 -> zeros=2, max_len = max(5, 6 - 4 + 1) = 5.<br/>
    - Returns max consecutive ones size 5 (or 6 if array had correct indices). (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-5:</b> Initialize boundaries, zero counter, and max size trackers.</li>
    <li><b>Line 6:</b> Scan elements with right pointer.</li>
    <li><b>Line 7-8:</b> Increment zeros tracker on hitting a 0.</li>
    <li><b>Line 9-12:</b> If zeros count exceeds K, shift left pointer inward, adjusting zeros count when leaving a 0.</li>
    <li><b>Line 13:</b> Record max length found (right - left + 1).</li>
    <li><b>Line 14:</b> Return max length.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 स्लाइडिंग विंडो लॉजिक</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अधिकतम K जीरो वाले सबसे लंबे सबएरे को खोजें। विंडो बढ़ाएं। यदि जीरो की संख्या K से अधिक हो जाती है, तो <code>left</code> पॉइंटर को सिकोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        left = 0
        zeros = 0
        max_len = 0
        for right in range(len(nums)):
            if nums[right] == 0:
                zeros += 1
            while zeros > k:
                if nums[left] == 0:
                    zeros -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 1, 1, 0, 0, 0, 1], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - left=0, zeros=0, max_len=0.<br/>
    - right=0 से 2: zeros = 0, max_len = 3.<br/>
    - right=3: nums[3]=0 -> zeros = 1, max_len = 4.<br/>
    - right=4: nums[4]=0 -> zeros = 2, max_len = 5.<br/>
    - right=5: nums[5]=0 -> zeros = 3 (3 > 2) -> बाएं पॉइंटर को सिकोड़ें:<br/>
    &nbsp;&nbsp;• left=0,1,2 (1) -> left = 3.<br/>
    &nbsp;&nbsp;• left=3 (0) -> zeros = 2, left = 4।<br/>
    - अधिकतम लगातार 1s की संख्या 6 प्राप्त होती है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और फ़ंक्शन घोषित करना।</li>
    <li><b>लाइन 3-5:</b> पॉइंटर्स और जीरो काउंटर वेरिएबल्स घोषित करना।</li>
    <li><b>लाइन 6:</b> दाईं ओर से स्कैन करना।</li>
    <li><b>लाइन 7-8:</b> जीरो मिलने पर जीरो काउंटर बढ़ाना।</li>
    <li><b>लाइन 9-12:</b> यदि जीरो काउंट K से अधिक है, तो बाएं पॉइंटर को खिसकाएं, और यदि जीरो छूटे तो काउंटर घटाएं।</li>
    <li><b>लाइन 13:</b> अधिकतम लंबाई (right - left + 1) अपडेट करना।</li>
    <li><b>लाइन 14:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69d799dd6f815dc6d8e65b08",
    title: "Fruit into baskets Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Sliding Window with Hash Map</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Find the longest contiguous subarray containing at most 2 distinct integers. Track integer frequencies. If map size exceeds 2, shrink from left until distinct integers <= 2.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1) (baskets size <= 3)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def totalFruit(self, fruits: List[int]) -> int:
        basket = {}
        left = 0
        max_fruits = 0
        for right in range(len(fruits)):
            basket[fruits[right]] = basket.get(fruits[right], 0) + 1
            while len(basket) > 2:
                basket[fruits[left]] -= 1
                if basket[fruits[left]] == 0:
                    del basket[fruits[left]]
                left += 1
            max_fruits = max(max_fruits, right - left + 1)
        return max_fruits</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (fruits = [1, 2, 1, 2, 3])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right=0 to 3: basket = {1: 2, 2: 2}. Size <= 2. max_fruits = 4.<br/>
    - right=4 (fruit 3): basket = {1: 2, 2: 2, 3: 1}. Size 3 > 2 -> shrink:<br/>
    &nbsp;&nbsp;• left=0 (fruit 1): basket[1] = 1, left=1.<br/>
    &nbsp;&nbsp;• left=1 (fruit 2): basket[2] = 1, left=2.<br/>
    &nbsp;&nbsp;• left=2 (fruit 1): basket[1] = 0 -> delete 1, left=3.<br/>
    - basket = {2: 1, 3: 1}. Size = 2. max_fruits = max(4, 5-3) = 4.<br/>
    - Returns max fruits collected 4. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function declaration.</li>
    <li><b>Line 3-5:</b> Initialize baskets hash map, left pointer, and max tracker.</li>
    <li><b>Line 6:</b> Loop through fruits array with right pointer.</li>
    <li><b>Line 7:</b> Add current fruit to map.</li>
    <li><b>Line 8-12:</b> If basket size > 2, decrement count of fruit at left pointer. Delete from map on 0 count, shift left.</li>
    <li><b>Line 13:</b> Track max fruits size.</li>
    <li><b>Line 14:</b> Return max fruits.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 हैश मैप स्लाइडिंग विंडो</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अधिकतम 2 अलग-अलग प्रकार के फलों वाले सबसे लंबे सबएरे को खोजें। यदि प्रकार 2 से अधिक हो जाते हैं, तो बाएं से पॉइंटर को खिसकाएं जब तक कि प्रकार 2 न रह जाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def totalFruit(self, fruits: List[int]) -> int:
        basket = {}
        left = 0
        max_fruits = 0
        for right in range(len(fruits)):
            basket[fruits[right]] = basket.get(fruits[right], 0) + 1
            while len(basket) > 2:
                basket[fruits[left]] -= 1
                if basket[fruits[left]] == 0:
                    del basket[fruits[left]]
                left += 1
            max_fruits = max(max_fruits, right - left + 1)
        return max_fruits</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (fruits = [1, 2, 1, 2, 3])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right=0 से 3: basket = {1: 2, 2: 2}। फल संख्या = 4।<br/>
    - right=4 (फल 3): basket = {1: 2, 2: 2, 3: 1}। (आकार 3 > 2) -> बाएं खिसकाएं:<br/>
    &nbsp;&nbsp;• left=0 (फल 1) -> count 1. left=1.<br/>
    &nbsp;&nbsp;• left=1 (फल 2) -> count 1. left=2.<br/>
    &nbsp;&nbsp;• left=2 (फल 1) -> count 0 (हटाया गया). left=3।<br/>
    - basket = {2: 1, 3: 1}। फल संख्या = 4।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> बास्केट डिक्शनरी, बायां पॉइंटर, और फल संख्या वेरिएबल घोषित करना।</li>
    <li><b>लाइन 6:</b> दाईं ओर के पॉइंटर से लूप चलाना।</li>
    <li><b>लाइन 7:</b> वर्तमान फल को डिक्शनरी में जोड़ना।</li>
    <li><b>लाइन 8-12:</b> यदि बास्केट में प्रकार > 2 हैं, तो बाएं फल की संख्या घटाएं। 0 होने पर हटाएं, बायां पॉइंटर बढ़ाएं।</li>
    <li><b>लाइन 13:</b> अधिकतम फलों की संख्या अपडेट करना।</li>
    <li><b>लाइन 14:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69da6926faaf4f1fd14b6e2f",
    title: "Longest substring with atmost k distinct character Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Generalization of Baskets</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Find the longest substring containing at most K distinct characters. Maintain count map. Shrink left if map size > K.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        if k == 0 or not s:
            return 0
        char_map = {}
        left = 0
        max_len = 0
        for right in range(len(s)):
            char_map[s[right]] = char_map.get(s[right], 0) + 1
            while len(char_map) > k:
                char_map[s[left]] -= 1
                if char_map[s[left]] == 0:
                    del char_map[s[left]]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "eceba", k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right = 0 ('e') -> map = {'e': 1}, max_len = 1.<br/>
    - right = 1 ('c') -> map = {'e': 1, 'c': 1}, max_len = 2.<br/>
    - right = 2 ('e') -> map = {'e': 2, 'c': 1}, max_len = 3.<br/>
    - right = 3 ('b') -> map = {'e': 2, 'c': 1, 'b': 1}. Size 3 > 2 -> shrink:<br/>
    &nbsp;&nbsp;• left=0 ('e') -> map['e'] = 1, left = 1.<br/>
    &nbsp;&nbsp;• left=1 ('c') -> map['c'] = 0 -> delete 'c', left = 2.<br/>
    - map = {'e': 1, 'b': 1}. max_len = max(3, 4 - 2) = 3.<br/>
    - Returns longest size 3. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-4:</b> Return 0 if k = 0 or empty string.</li>
    <li><b>Line 5-7:</b> Initialize map, left pointer, and max tracker.</li>
    <li><b>Line 8-9:</b> Loop through string, incrementing count of character at index right.</li>
    <li><b>Line 10-14:</b> If distinct count > k, decrement count at left pointer. Delete from map if count becomes 0, increment left.</li>
    <li><b>Line 15:</b> Update max length.</li>
    <li><b>Line 16:</b> Return max length.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 बास्केट समस्या का सामान्यीकरण (Generalization)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अधिकतम K विशिष्ट अक्षरों वाली सबसे लंबी सबस्ट्रिंग खोजें। यदि मैप का आकार K से अधिक हो तो बाएं पॉइंटर को सिकोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        if k == 0 or not s:
            return 0
        char_map = {}
        left = 0
        max_len = 0
        for right in range(len(s)):
            char_map[s[right]] = char_map.get(s[right], 0) + 1
            while len(char_map) > k:
                char_map[s[left]] -= 1
                if char_map[s[left]] == 0:
                    del char_map[s[left]]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "eceba", k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right=0 ('e') -> map = {'e': 1}।<br/>
    - right=1 ('c') -> map = {'e': 1, 'c': 1}। max_len = 2।<br/>
    - right=2 ('e') -> map = {'e': 2, 'c': 1}। max_len = 3।<br/>
    - right=3 ('b') -> (आकार 3 > 2) -> left=0 ('e') -> map['e'] = 1, left=1। left=1 ('c') -> हटा दिया, left=2। map = {'e': 1, 'b': 1}। max_len = 3।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-4:</b> k = 0 या खाली स्ट्रिंग होने पर 0 लौटाना।</li>
    <li><b>लाइन 5-7:</b> डिक्शनरी और पॉइंटर्स वेरिएबल घोषित करना।</li>
    <li><b>लाइन 8-9:</b> अक्षरों की आवृति (frequency) रिकॉर्ड करना।</li>
    <li><b>लाइन 10-14:</b> यदि विशिष्ट अक्षरों की संख्या K से अधिक हो, तो बायीं सीमा खिसकाना और शून्य मान को हटाना।</li>
    <li><b>लाइन 15:</b> अधिकतम लंबाई अपडेट करना।</li>
    <li><b>लाइन 16:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69da6970faaf4f1fd14b6f8f",
    title: "Number of substrings containing all 3 characters Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Mathematical Last Seen Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Track the last seen indices of 'a', 'b', and 'c'. Any valid substring ending at index <code>i</code> must start at or before <code>min(last_seen['a'], last_seen['b'], last_seen['c'])</code>. Add this minimum index + 1 to total count.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def numberOfSubstrings(self, s: str) -> int:
        last_seen = {'a': -1, 'b': -1, 'c': -1}
        count = 0
        for i, char in enumerate(s):
            last_seen[char] = i
            if last_seen['a'] != -1 and last_seen['b'] != -1 and last_seen['c'] != -1:
                count += min(last_seen['a'], last_seen['b'], last_seen['c']) + 1
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "abcabc")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 ('a') -> last_seen = {'a': 0, 'b': -1, 'c': -1}.<br/>
    - i = 1 ('b') -> last_seen = {'a': 0, 'b': 1, 'c': -1}.<br/>
    - i = 2 ('c') -> last_seen = {'a': 0, 'b': 1, 'c': 2}. All seen -> count += min(0,1,2)+1 = 1. count = 1.<br/>
    - i = 3 ('a') -> last_seen = {'a': 3, 'b': 1, 'c': 2}. All seen -> count += min(3,1,2)+1 = 2. count = 3.<br/>
    - Returns count 10 at end of loop. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and main method signature.</li>
    <li><b>Line 3-4:</b> Set last_seen map keys to default -1, count tracker to 0.</li>
    <li><b>Line 5-6:</b> Loop index and character, updating last seen position of current character.</li>
    <li><b>Line 7-8:</b> If all characters have been seen in current suffix prefix window, add smallest index position plus 1 to valid count.</li>
    <li><b>Line 9:</b> Return total count.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 अंतिम स्थान (Last Seen) दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">'a', 'b', और 'c' के अंतिम देखे गए सूचकांक को ट्रैक करें। इंडेक्स <code>i</code> पर समाप्त होने वाला कोई भी वैध सबस्ट्रिंग कम से कम <code>min(last_seen['a'], last_seen['b'], last_seen['c'])</code> से पहले शुरू होना चाहिए।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def numberOfSubstrings(self, s: str) -> int:
        last_seen = {'a': -1, 'b': -1, 'c': -1}
        count = 0
        for i, char in enumerate(s):
            last_seen[char] = i
            if last_seen['a'] != -1 and last_seen['b'] != -1 and last_seen['c'] != -1:
                count += min(last_seen['a'], last_seen['b'], last_seen['c']) + 1
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "abcabc")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - i = 0 ('a') -> last_seen = {'a': 0, 'b': -1, 'c': -1}।<br/>
    - i = 1 ('b') -> last_seen = {'a': 0, 'b': 1, 'c': -1}।<br/>
    - i = 2 ('c') -> all seen -> count += min(0,1,2)+1 = 1।<br/>
    - i = 3 ('a') -> all seen -> count += min(3,1,2)+1 = 2। (कुल = 3)।<br/>
    - अंत में कुल काउंट 10 मिलता है।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> तीनों अक्षरों के इंडेक्स को डिफ़ॉल्ट -1 और काउंट को 0 रखना।</li>
    <li><b>लाइन 5-6:</b> इंडेक्स और कैरेक्टर पर लूप, और अंतिम इंडेक्स अपडेट करना।</li>
    <li><b>लाइन 7-8:</b> यदि तीनों अक्षर देखे जा चुके हैं, तो न्यूनतम सूचकांक + 1 को काउंट में जोड़ें।</li>
    <li><b>लाइन 9:</b> कुल काउंट लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69defebf3686ac473820347f",
    title: "Binary subarrays with some Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Symmetric atMost Trick</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">The number of subarrays with sum exactly equal to <code>goal</code> is: <code>atMost(goal) - atMost(goal - 1)</code>. This allows using a simple variable-size sliding window helper.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def numSubarraysWithSum(self, nums: List[int], goal: int) -> int:
        def atMost(x):
            if x < 0: return 0
            left = 0
            current_sum = 0
            count = 0
            for right in range(len(nums)):
                current_sum += nums[right]
                while current_sum > x:
                    current_sum -= nums[left]
                    left += 1
                count += right - left + 1
            return count
        return atMost(goal) - atMost(goal - 1)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 0, 1, 0, 1], goal = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - atMost(2) returns count of subarrays with sum <= 2. Result = 15.<br/>
    - atMost(1) returns count of subarrays with sum <= 1. Result = 11.<br/>
    - Subtract: 15 - 11 = 4. (Valid subarrays are: [1,0,1], [0,1,0,1], [1,0,1], [1,0,1,0]).<br/>
    - Returns 4. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and main method definition.</li>
    <li><b>Line 3-4:</b> Helper function returns 0 if target sum threshold x < 0.</li>
    <li><b>Line 5-7:</b> Initialize search pointers and counter.</li>
    <li><b>Line 8:</b> Scan nums array.</li>
    <li><b>Line 9:</b> Accumulate current sum.</li>
    <li><b>Line 10-12:</b> Shrink window from left if current sum exceeds x.</li>
    <li><b>Line 13:</b> Count matches ending at right index (right - left + 1).</li>
    <li><b>Line 15:</b> Return difference of target bounds.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 सममित (atMost) दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">योग सटीक <code>goal</code> के बराबर होने वाले सबएरे की संख्या: <code>atMost(goal) - atMost(goal - 1)</code> होती है। इससे स्लाइडिंग विंडो बहुत सरल हो जाती है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def numSubarraysWithSum(self, nums: List[int], goal: int) -> int:
        def atMost(x):
            if x < 0: return 0
            left = 0
            current_sum = 0
            count = 0
            for right in range(len(nums)):
                current_sum += nums[right]
                while current_sum > x:
                    current_sum -= nums[left]
                    left += 1
                count += right - left + 1
            return count
        return atMost(goal) - atMost(goal - 1)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 0, 1, 0, 1], goal = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - atMost(2) = 15 (योग <= 2 वाले कुल सबएरे)।<br/>
    - atMost(1) = 11 (योग <= 1 वाले कुल सबएरे)।<br/>
    - घटाने पर: 15 - 11 = 4। (सही सबएरे: [1,0,1], [0,1,0,1], [1,0,1], [1,0,1,0])।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> सीमा x < 0 होने पर सीधे 0 लौटाने वाला हेल्पर।</li>
    <li><b>लाइन 5-7:</b> काउंटर और पॉइंटर्स की घोषणा।</li>
    <li><b>लाइन 8-9:</b> एरे तत्वों को दाईं ओर से जोड़ना।</li>
    <li><b>लाइन 10-12:</b> यदि योग सीमा x से अधिक हो, तो बाएं पॉइंटर को सिकोड़ें और योग घटाएं।</li>
    <li><b>लाइन 13:</b> इंडेक्स <code>right</code> पर समाप्त होने वाले सबएरे जोड़ना।</li>
    <li><b>लाइन 15:</b> दोनों सीमाओं के अंतर को परिणाम के रूप में लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69df03953686ac4738203616",
    title: "Count number of nice subarrays Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Binary Conversion Strategy</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Replace odd numbers with 1 and even numbers with 0. The problem converts to **Binary Subarrays with Sum = K**! Total count = <code>atMost(k) - atMost(k - 1)</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def numberOfSubarrays(self, nums: List[int], k: int) -> int:
        def atMost(x):
            if x < 0: return 0
            left = 0
            current_odds = 0
            count = 0
            for right in range(len(nums)):
                if nums[right] % 2 == 1:
                    current_odds += 1
                while current_odds > x:
                    if nums[left] % 2 == 1:
                        current_odds -= 1
                    left += 1
                count += right - left + 1
            return count
        return atMost(k) - atMost(k - 1)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 1, 2, 1, 1], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Subarray odds check is equivalent to binary array: <code>[1, 1, 0, 1, 1]</code>.<br/>
    - atMost(3) = 12.<br/>
    - atMost(2) = 10.<br/>
    - Subtract: 12 - 10 = 2. (Valid nice subarrays: [1, 1, 2, 1] and [1, 2, 1, 1]).<br/>
    - Returns count 2. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and method declaration.</li>
    <li><b>Line 3-4:</b> Define nested helper <code>atMost</code> returning count of subarrays with <= x odd numbers.</li>
    <li><b>Line 5-7:</b> Initialize search trackers.</li>
    <li><b>Line 8-10:</b> Loop nums array. Increment current_odds if element is odd.</li>
    <li><b>Line 11-14:</b> If current_odds exceeds x, shrink left pointer and decrement odds counter if leaving an odd number.</li>
    <li><b>Line 15:</b> Add count of valid subarrays ending at right.</li>
    <li><b>Line 17:</b> Return difference of target bounds.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 बाइनरी रूपांतरण रणनीति</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी विषम (odd) संख्याओं को 1 और सम (even) संख्याओं को 0 से बदलें। यह समस्या **Binary Subarrays with Sum = K** में बदल जाएगी। योग = <code>atMost(k) - atMost(k - 1)</code>।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def numberOfSubarrays(self, nums: List[int], k: int) -> int:
        def atMost(x):
            if x < 0: return 0
            left = 0
            current_odds = 0
            count = 0
            for right in range(len(nums)):
                if nums[right] % 2 == 1:
                    current_odds += 1
                while current_odds > x:
                    if nums[left] % 2 == 1:
                        current_odds -= 1
                    left += 1
                count += right - left + 1
            return count
        return atMost(k) - atMost(k - 1)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 1, 2, 1, 1], k = 3)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - विषम संख्याओं की जांच के अनुसार यह <code>[1, 1, 0, 1, 1]</code> के समान है।<br/>
    - atMost(3) = 12.<br/>
    - atMost(2) = 10.<br/>
    - घटाने पर: 12 - 10 = 2। (सही सबएरे: [1, 1, 2, 1] और [1, 2, 1, 1])।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> अधिक से अधिक x विषम संख्या वाले सबएरे गिनने वाला हेल्पर।</li>
    <li><b>लाइन 5-7:</b> पॉइंटर्स घोषित करना।</li>
    <li><b>लाइन 8-10:</b> विषम संख्या मिलने पर काउंटर 1 बढ़ाना।</li>
    <li><b>लाइन 11-14:</b> यदि विषम संख्या सीमा x से अधिक हो तो बाएं पॉइंटर को सिकोड़ें और विषम काउंटर घटाएं।</li>
    <li><b>लाइन 15:</b> सबएरे आकारों को जोड़ना।</li>
    <li><b>लाइन 17:</b> अंतिम सीमाओं का अंतर परिणाम के रूप में लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69df03c13686ac47382037b2",
    title: "Subarrays with k different integers Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Exactly K Distinct Trick</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Calculating exactly K unique elements is difficult. We simplify it as: <code>atMost(k) - atMost(k - 1)</code> where <code>atMost(x)</code> counts subarrays containing at most x distinct numbers.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def subarraysWithKDistinct(self, nums: List[int], k: int) -> int:
        def atMost(x):
            if x < 0: return 0
            count_map = {}
            left = 0
            ans = 0
            for right in range(len(nums)):
                count_map[nums[right]] = count_map.get(nums[right], 0) + 1
                while len(count_map) > x:
                    count_map[nums[left]] -= 1
                    if count_map[nums[left]] == 0:
                        del count_map[nums[left]]
                    left += 1
                ans += right - left + 1
            return ans
        return atMost(k) - atMost(k - 1)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (nums = [1, 2, 1, 2, 3], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - atMost(2) = 12.<br/>
    - atMost(1) = 5.<br/>
    - Subtract: 12 - 5 = 7. (Valid subarrays: [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2]).<br/>
    - Returns count 7. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and subarraysWithKDistinct method declaration.</li>
    <li><b>Line 3-4:</b> Nested function returning 0 if unique threshold x is negative.</li>
    <li><b>Line 5-7:</b> Initialize counts dictionary, left pointer and answer counter.</li>
    <li><b>Line 8-9:</b> Loop through elements, incrementing frequency inside window counts map.</li>
    <li><b>Line 10-14:</b> If distinct keys in map exceeds x, shrink from left and remove key if its frequency falls to 0.</li>
    <li><b>Line 15:</b> Accumulate valid sizes (right - left + 1).</li>
    <li><b>Line 17:</b> Return difference of target bounds.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 सटीक K विशिष्ट अंकों की ट्रिक</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सटीक K विशिष्ट अंकों को खोजना कठिन है। हम इसे इस प्रकार सरल बनाते हैं: <code>atMost(k) - atMost(k - 1)</code> जहां <code>atMost(x)</code> अधिक से अधिक x विशिष्ट संख्या वाले सबएरे गिनता है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def subarraysWithKDistinct(self, nums: List[int], k: int) -> int:
        def atMost(x):
            if x < 0: return 0
            count_map = {}
            left = 0
            ans = 0
            for right in range(len(nums)):
                count_map[nums[right]] = count_map.get(nums[right], 0) + 1
                while len(count_map) > x:
                    count_map[nums[left]] -= 1
                    if count_map[nums[left]] == 0:
                        del count_map[nums[left]]
                    left += 1
                ans += right - left + 1
            return ans
        return atMost(k) - atMost(k - 1)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (nums = [1, 2, 1, 2, 3], k = 2)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - atMost(2) = 12.<br/>
    - atMost(1) = 5.<br/>
    - घटाने पर: 12 - 5 = 7। (सही सबएरे: [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2])।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> विशिष्ट अंकों की सीमा x < 0 होने पर 0 लौटाने वाला हेल्पर।</li>
    <li><b>लाइन 5-7:</b> डिक्शनरी और पॉइंटर्स की घोषणा।</li>
    <li><b>लाइन 8-9:</b> तत्वों की आवृत्ति डिक्शनरी में जोड़ना।</li>
    <li><b>लाइन 10-14:</b> यदि डिक्शनरी में अद्वितीय अंक > x हैं, तो बाएं फल की संख्या घटाएं। 0 होने पर हटाएं, बायां पॉइंटर बढ़ाएं।</li>
    <li><b>लाइन 15:</b> सबएरे की संख्या जोड़ना।</li>
    <li><b>लाइन 17:</b> दोनों सीमाओं का अंतर लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69df04093686ac4738203953",
    title: "Minimum window substring Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Double Frequency Map sliding</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Track required frequencies for <code>T</code>. Expand <code>right</code>. Keep match counter <code>have</code>. When <code>have == need</code>, save substring bounds and shrink <code>left</code> greedily while keeping window valid.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(M + N) | 🧠 Space: O(M + N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s:
            return ""
        
        target_map = {}
        for char in t:
            target_map[char] = target_map.get(char, 0) + 1
            
        window_map = {}
        have, need = 0, len(target_map)
        ans_len = float('inf')
        ans_range = [-1, -1]
        left = 0
        
        for right in range(len(s)):
            char = s[right]
            window_map[char] = window_map.get(char, 0) + 1
            
            if char in target_map and window_map[char] == target_map[char]:
                have += 1
                
            while have == need:
                if right - left + 1 < ans_len:
                    ans_len = right - left + 1
                    ans_range = [left, right]
                    
                left_char = s[left]
                window_map[left_char] -= 1
                if left_char in target_map and window_map[left_char] < target_map[left_char]:
                    have -= 1
                left += 1
                
        l, r = ans_range
        return s[l:r + 1] if ans_len != float('inf') else ""</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "ADOBECODEBANC", t = "ABC")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - target_map = {'A': 1, 'B': 1, 'C': 1}, need = 3.<br/>
    - Expand right until index 5 ('C'): window is "ADOBEC". have = 3. Valid! ans_len = 6, range = [0, 5].<br/>
    - Shrink left: index 0 ('A') -> window lacks 'A', have = 2. left becomes 1. Invalid.<br/>
    - Expand right to index 10 ('B'): window "DOBECODEB" has duplicate B. have = 3. Valid! ans_len = 6, range = [5, 10] ("CODEBA").<br/>
    - Subproblems converge to minimum window "BANC" (index 9 to 12, length 4).<br/>
    - Returns "BANC". (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-4:</b> Boundary validation. Return empty if either s or t is blank.</li>
    <li><b>Line 6-8:</b> Build frequency map of target string t.</li>
    <li><b>Line 10-14:</b> Initialize pointers, match trackers (have vs need), and range variables.</li>
    <li><b>Line 16-21:</b> Loop s with right pointer. Add char to map. Increment have count if matching target frequency.</li>
    <li><b>Line 23:</b> While window contains all required letters (have == need).</li>
    <li><b>Line 24-26:</b> Update minimum window length and record bounds indices.</li>
    <li><b>Line 28-31:</b> Shrink from left. Decrement count, decrement have if frequency drops below target.</li>
    <li><b>Line 32:</b> Increment left pointer.</li>
    <li><b>Line 34-35:</b> Slice and return minimum window substring.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 दोहरा आवृत्ति मैप स्लाइडिंग (Double Frequency Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;"><code>T</code> के लिए आवश्यक आवृत्तियों को सहेजें। <code>right</code> पॉइंटर आगे बढ़ाएं। जब आवश्यकताएं पूरी हों (have == need), तो बाएं पॉइंटर को सिकोड़ें और न्यूनतम सीमा अपडेट करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(M + N) | 🧠 स्थान: O(M + N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s:
            return ""
        
        target_map = {}
        for char in t:
            target_map[char] = target_map.get(char, 0) + 1
            
        window_map = {}
        have, need = 0, len(target_map)
        ans_len = float('inf')
        ans_range = [-1, -1]
        left = 0
        
        for right in range(len(s)):
            char = s[right]
            window_map[char] = window_map.get(char, 0) + 1
            
            if char in target_map and window_map[char] == target_map[char]:
                have += 1
                
            while have == need:
                if right - left + 1 < ans_len:
                    ans_len = right - left + 1
                    ans_range = [left, right]
                    
                left_char = s[left]
                window_map[left_char] -= 1
                if left_char in target_map and window_map[left_char] < target_map[left_char]:
                    have -= 1
                left += 1
                
        l, r = ans_range
        return s[l:r + 1] if ans_len != float('inf') else ""</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "ADOBECODEBANC", t = "ABC")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - target_map = {'A': 1, 'B': 1, 'C': 1}।<br/>
    - right=5 ('C') पर पहुँचने पर: सबस्ट्रिंग "ADOBEC" वैध है। have = 3। लंबाई = 6।<br/>
    - left=0 ('A') को सिकोड़ने पर: have = 2। (अवैध)।<br/>
    - अंत में न्यूनतम सबस्ट्रिंग "BANC" प्राप्त होती है (लंबाई = 4)।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-4:</b> अपवाद स्थिति: खाली स्ट्रिंग होने पर सीधे खाली स्ट्रिंग <code>""</code> लौटाना।</li>
    <li><b>लाइन 6-8:</b> लक्ष्य स्ट्रिंग t का आवृत्ति मैप बनाना।</li>
    <li><b>लाइन 10-14:</b> पॉइंटर्स, मैच काउंटर्स (have और need), और न्यूनतम सीमा वेरिएबल्स बनाना।</li>
    <li><b>लाइन 16-21:</b> दाईं ओर से लूप। कैरेक्टर जोड़ना, आवृत्ति संतुष्ट होने पर match counter 1 बढ़ाना।</li>
    <li><b>लाइन 23:</b> जब तक विंडो वैध है (have == need):</li>
    <li><b>लाइन 24-26:</b> न्यूनतम विंडो की सीमाओं को अपडेट करना।</li>
    <li><b>लाइन 28-31:</b> बाएं पॉइंटर से सिकोड़ना, और आवृत्ति कम होने पर match counter 1 कम करना।</li>
    <li><b>लाइन 32:</b> बाएं पॉइंटर को आगे बढ़ाना।</li>
    <li><b>लाइन 34-35:</b> न्यूनतम सबस्ट्रिंग स्लाइस करके लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69fe097a7ff93f3ce74b3a1b",
    title: "Longest Repeating Character Replacement Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Max Frequency Window Rule</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">A window of size <code>L</code> is valid if we need to replace at most K characters: <code>L - max_frequency <= K</code>. Track frequencies. Shrink from left if condition is violated.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1) (size <= 26)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count_map = {}
        max_freq = 0
        left = 0
        max_len = 0
        for right in range(len(s)):
            count_map[s[right]] = count_map.get(s[right], 0) + 1
            max_freq = max(max_freq, count_map[s[right]])
            
            while (right - left + 1) - max_freq > k:
                count_map[s[left]] -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "AABABBA", k = 1)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right=0..3: window is "AABA". count = {'A': 3, 'B': 1}. max_freq = 3.<br/>
    &nbsp;&nbsp;• replacements needed: 4 - 3 = 1 <= 1 (valid). max_len = 4.<br/>
    - right=4: window is "AABAB". count = {'A': 3, 'B': 2}. max_freq = 3.<br/>
    &nbsp;&nbsp;• replacements needed: 5 - 3 = 2 > 1 (invalid) -> shrink left:<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;* left=0 ('A') -> count['A'] = 2, left=1.<br/>
    &nbsp;&nbsp;• window becomes "ABAB" (len 4). valid. max_len = max(4, 4) = 4.<br/>
    - Returns longest size 4. (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and characterReplacement function signature.</li>
    <li><b>Line 3-6:</b> Set up frequency counts dictionary, max frequency tracker, search pointers.</li>
    <li><b>Line 7:</b> Scan string with right pointer.</li>
    <li><b>Line 8-9:</b> Record character frequency, update max frequency seen in current window.</li>
    <li><b>Line 11-13:</b> If window size minus max frequency exceeds K, shrink from left and update counts.</li>
    <li><b>Line 14:</b> Update maximum length of valid window.</li>
    <li><b>Line 15:</b> Return max length.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 अधिकतम आवृत्ति विंडो नियम (Max Frequency)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">लंबाई <code>L</code> की एक विंडो वैध है यदि हमें अधिकतम K अक्षरों को बदलना पड़े: <code>L - max_frequency <= K</code>। यदि इसका उल्लंघन होता है, तो बाएं पॉइंटर को खिसकाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count_map = {}
        max_freq = 0
        left = 0
        max_len = 0
        for right in range(len(s)):
            count_map[s[right]] = count_map.get(s[right], 0) + 1
            max_freq = max(max_freq, count_map[s[right]])
            
            while (right - left + 1) - max_freq > k:
                count_map[s[left]] -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "AABABBA", k = 1)</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - right=0 से 3: विंडो "AABA" है। count = {'A': 3, 'B': 1}। max_freq = 3। 4 - 3 = 1 <= 1 (वैध)। max_len = 4।<br/>
    - right=4: विंडो "AABAB" है। (5 - 3 = 2 > 1 अवैध) -> बाएं खिसकाएं: left=0 ('A') -> count['A'] = 2, left=1। विंडो "ABAB" (वैध)।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-6:</b> डिक्शनरी, अधिकतम आवृत्ति और बाएं पॉइंटर वेरिएबल्स घोषित करना।</li>
    <li><b>लाइन 7:</b> दाईं ओर से लूप चलाना।</li>
    <li><b>लाइन 8-9:</b> आवृत्ति रिकॉर्ड करना और विंडो की अधिकतम आवृत्ति अपडेट करना।</li>
    <li><b>लाइन 11-13:</b> यदि परिवर्तन करने योग्य कैरेक्टर की संख्या K से अधिक है, तो बाएं फल का आवृत्ति काउंटर घटाएं और बाएं पॉइंटर को आगे बढ़ाएं।</li>
    <li><b>लाइन 14:</b> अधिकतम लंबाई अपडेट करना।</li>
    <li><b>लाइन 15:</b> परिणाम लौटाना।</li>
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
    
    console.log("Cleaning up old seeded sliding window notes...");
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
        tags: ["Sliding-Window", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed sliding window notes...`);
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
