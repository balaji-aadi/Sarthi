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
const parentTaskId = "69e7505fc05bf5f0580b80b1";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #6b21a8; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e9d5ff; padding-bottom: 6px; margin-top: 0;">📐 Palindrome Strings Identification Blueprint</h3>
  
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Palindrome Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
      You should think of Palindrome approaches when the problem involves checking symmetry in strings, finding contiguous symmetric substrings, partitions where every component must read same backward as forward, or calculating minimum character edits to make a sequence symmetric.
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Algorithm Paradigms</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Pattern Type</th>
          <th style="padding: 6px 4px; font-weight: 700;">Strategy / Formula</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Validation & Checks</td>
          <td style="padding: 6px 4px;">Two Pointers (Meet in the middle): Compare <code>s[left]</code> and <code>s[right]</code> moving inwards.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Longest Substring</td>
          <td style="padding: 6px 4px;">Expand from Center: odd centers (i, i) and even centers (i, i+1) in O(N²) time.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Longest Subsequence</td>
          <td style="padding: 6px 4px;">Dynamic Programming: <code>dp[i][j]</code> length of LPS. Recurrence: <code>dp[i+1][j-1] + 2</code> if match, else <code>max(dp[i+1][j], dp[i][j-1])</code>.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Partitions / Edits</td>
          <td style="padding: 6px 4px;">Backtracking (DFS) with Palindrome pre-check DP, or min insertions computed as <code>n - LPS(s)</code>.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #6b21a8; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e9d5ff; padding-bottom: 6px; margin-top: 0;">📐 पैलिंड्रोम स्ट्रिंग्स पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 पैलिंड्रोम समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
      आपको पैलिंड्रोम तकनीकों के बारे में सोचना चाहिए जब समस्या में स्ट्रिंग्स में समरूपता (symmetry) की जांच करना, सन्निहित (contiguous) सममित सबस्ट्रिंग्स को ढूंढना, ऐसे विभाजन (partitions) बनाना जहां प्रत्येक भाग आगे और पीछे से समान पढ़ा जाए, या किसी अनुक्रम को सममित बनाने के लिए न्यूनतम कैरेक्टर संपादन (edits) की गणना करना शामिल हो।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य एल्गोरिदम प्रतिमान (Paradigms)</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">पैटर्न प्रकार</th>
          <th style="padding: 6px 4px; font-weight: 700;">रणनीति / सूत्र</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">सत्यापन और जाँच</td>
          <td style="padding: 6px 4px;">दो पॉइंटर्स (बीच में मिलना): अंदर की ओर बढ़ते हुए <code>s[left]</code> और <code>s[right]</code> की तुलना करें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">सबसे लंबी सबस्ट्रिंग</td>
          <td style="padding: 6px 4px;">केंद्र से विस्तार (Expand from Center): O(N²) समय में विषम केंद्र (i, i) और सम केंद्र (i, i+1) का विस्तार करें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">सबसे लंबा उपक्रम (Subsequence)</td>
          <td style="padding: 6px 4px;">डायनेमिक प्रोग्रामिंग: <code>dp[i][j]</code> LPS की लंबाई है। यदि कैरेक्टर्स मेल खाते हैं तो <code>dp[i+1][j-1] + 2</code>, अन्यथा <code>max(dp[i+1][j], dp[i][j-1])</code>।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">विभाजन / संपादन</td>
          <td style="padding: 6px 4px;">पैलिंड्रोम पूर्व-जांच DP के साथ बैकट्रैकिंग (DFS), या <code>n - LPS(s)</code> के रूप में गणना किए गए न्यूनतम संपादन।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Palindrome Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Symmetric", "Two-Pointers", "DP", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e7505fc05bf5f0580b80b3",
    title: "Valid Palindrome Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Extract alphanumeric characters to a helper string, lowercase them, and check if equals reversed string.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(N) (creates copy)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Place pointers at start (<code>left</code>) and end (<code>right</code>). Move inward skipping non-alphanumeric characters. Compare characters case-insensitively.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1) in-place</div>
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
    - Strip symbols & lowercase gives: <code>"amanaplanacanalpanama"</code> (Length = 21)<br/>
    - Initialize pointers: <code>left = 0</code>, <code>right = 20</code><br/>
    - Loop execution:<br/>
    &nbsp;&nbsp;• <code>left=0 ('a')</code> vs <code>right=20 ('a')</code> -> Match. Pointers move: <code>left=1</code>, <code>right=19</code><br/>
    &nbsp;&nbsp;• <code>left=1 ('m')</code> vs <code>right=19 ('m')</code> -> Match. Pointers move: <code>left=2</code>, <code>right=18</code><br/>
    &nbsp;&nbsp;• ... (all characters match moving inward)<br/>
    &nbsp;&nbsp;• Pointers meet at middle index 10 (<code>'a'</code>). Loop terminates.<br/>
    - Returns <code>True</code> (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Declares <code>Solution</code> class and the main <code>isPalindrome</code> function.</li>
    <li><b>Line 3:</b> Set pointer boundaries at <code>left = 0</code> and <code>right = len(s) - 1</code>.</li>
    <li><b>Line 4:</b> Runs while pointers don't cross (<code>left < right</code>).</li>
    <li><b>Line 5-6:</b> Skips non-alphanumeric symbols from the left.</li>
    <li><b>Line 7-8:</b> Skips non-alphanumeric symbols from the right.</li>
    <li><b>Line 9-10:</b> Check if lowercase characters mismatch. Returns <code>False</code> on mismatch.</li>
    <li><b>Line 11-12:</b> Advance pointers closer to the middle.</li>
    <li><b>Line 13:</b> Loop completes successfully, meaning it is symmetric. Returns <code>True</code>.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 ब्रूट फ़ोर्स दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">अल्फ़ान्यूमेरिक कैरेक्टर्स को एक अलग स्ट्रिंग में कॉपी करें, उसे लोअरकेस में बदलें, और जाँचें कि क्या उल्टा करने पर वह मूल के समान है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय जटिलता: O(N) | 🧠 स्थान जटिलता: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दो पॉइंटर्स रखें - एक शुरुआत में (<code>left</code>) और एक अंत में (<code>right</code>)। गैर-अल्फ़ान्यूमेरिक अक्षरों को छोड़ते हुए पॉइंटर्स को आगे-पीछे बढ़ाएं, और तुलना करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय जटिलता: O(N) | 🧠 स्थान जटिलता: O(1) (इन-प्लेस)</div>
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
    - सिंबल हटाने पर स्ट्रिंग बनती है: <code>"amanaplanacanalpanama"</code><br/>
    - शुरुआत में: <code>left = 0</code>, <code>right = 20</code><br/>
    - लूप चरण:<br/>
    &nbsp;&nbsp;• <code>left=0 ('a')</code> बनाम <code>right=20 ('a')</code> -> मेल खाया। पॉइंटर्स खिसके: <code>left=1</code>, <code>right=19</code><br/>
    &nbsp;&nbsp;• <code>left=1 ('m')</code> बनाम <code>right=19 ('m')</code> -> मेल खाया। पॉइंटर्स खिसके: <code>left=2</code>, <code>right=18</code><br/>
    &nbsp;&nbsp;• सभी कैरेक्टर्स आपस में मेल खाते हैं और अंततः पॉइंटर्स बीच के इंडेक्स 10 (<code>'a'</code>) पर मिलते हैं।<br/>
    - परिणाम: <code>True</code>
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और <code>isPalindrome</code> फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> <code>left</code> और <code>right</code> को क्रमशः एरे के पहले और आखिरी स्थान पर सेट करना।</li>
    <li><b>लाइन 4:</b> जब तक पॉइंटर्स पार न करें (<code>left < right</code>) तब तक लूप चलता है।</li>
    <li><b>लाइन 5-6:</b> बायीं तरफ के विशेष चिन्हों या खाली स्थानों को अनदेखा करना।</li>
    <li><b>लाइन 7-8:</b> दायीं तरफ के विशेष चिन्हों या खाली स्थानों को अनदेखा करना।</li>
    <li><b>लाइन 9-10:</b> कैरेक्टर्स को लोअरकेस में बदलकर तुलना करना। मेल न खाने पर <code>False</code> लौटाना।</li>
    <li><b>लाइन 11-12:</b> पॉइंटर्स को आगे-पीछे बढ़ाना।</li>
    <li><b>लाइन 13:</b> सभी जांच सफल रहने पर <code>True</code> लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80b5",
    title: "Longest Palindromic Substring Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Dynamic Programming Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Define <code>dp[i][j]</code> as true if substring <code>s[i...j]</code> is palindrome. Subproblem: <code>dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N²) | 🧠 Space: O(N²)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Expand from Center)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Every index can act as a center. Expand outwards for odd lengths (center <code>i</code>) and even lengths (centers <code>i, i+1</code>). Update maximum bounds.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N²) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s: return ""
        start, end = 0, 0
        
        def expand(left, right):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return right - left - 1
            
        for i in range(len(s)):
            len1 = expand(i, i)
            len2 = expand(i, i + 1)
            max_len = max(len1, len2)
            if max_len > end - start + 1:
                start = i - (max_len - 1) // 2
                end = i + max_len // 2
        return s[start:end + 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "babad")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Start values: <code>start = 0</code>, <code>end = 0</code><br/>
    - Center loop index <code>i = 1</code> (character <code>'a'</code>):<br/>
    &nbsp;&nbsp;• <code>expand(1, 1)</code> (Odd length): <code>s[1]=='a'</code>. Expands to <code>s[0..2] = "bab"</code>. Limits: <code>left = -1</code>, <code>right = 3</code>. Returns <code>3 - (-1) - 1 = 3</code>.<br/>
    &nbsp;&nbsp;• <code>expand(1, 2)</code> (Even length): <code>s[1]!='s[2]'</code> ('a' vs 'b'). Returns <code>0</code>.<br/>
    &nbsp;&nbsp;• <code>max_len = 3</code>. Since <code>3 > 1</code> (current window size), update: <code>start = 1 - 1 = 0</code>, <code>end = 1 + 1 = 2</code>. Current longest: <code>s[0:3] = "bab"</code>.<br/>
    - Next indices expansions do not exceed length 3.<br/>
    - Result output: <code>"bab"</code> (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class definitions and empty string boundary check.</li>
    <li><b>Line 4:</b> Set range markers <code>start = 0, end = 0</code>.</li>
    <li><b>Line 6-10:</b> Helper function <code>expand</code> that checks character match from center outward.</li>
    <li><b>Line 12:</b> Main loop iterating through each character as a potential center.</li>
    <li><b>Line 13-14:</b> Check both odd-length (single center) and even-length (double center) palindromes.</li>
    <li><b>Line 15:</b> Find maximum length from current center.</li>
    <li><b>Line 16-18:</b> If new palindrome is longer, update <code>start</code> and <code>end</code> indexes.</li>
    <li><b>Line 19:</b> Return the longest palindromic substring slice.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 डायनेमिक प्रोग्रामिंग दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;"><code>dp[i][j]</code> को सत्य घोषित करें यदि सबस्ट्रिंग <code>s[i...j]</code> पैलिंड्रोम है। सूत्र: <code>dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]</code>।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय जटिलता: O(N²) | 🧠 स्थान जटिलता: O(N²)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Expand from Center)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक इंडेक्स को एक केंद्र मानें। विषम लंबाई (केंद्र <code>i</code>) और सम लंबाई (केंद्र <code>i, i+1</code>) के लिए बाहर की ओर विस्तार करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय जटिलता: O(N²) | 🧠 स्थान जटिलता: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s: return ""
        start, end = 0, 0
        
        def expand(left, right):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return right - left - 1
            
        for i in range(len(s)):
            len1 = expand(i, i)
            len2 = expand(i, i + 1)
            max_len = max(len1, len2)
            if max_len > end - start + 1:
                start = i - (max_len - 1) // 2
                end = i + max_len // 2
        return s[start:end + 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "babad")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - शुरुआती मान: <code>start = 0</code>, <code>end = 0</code><br/>
    - इंडेक्स <code>i = 1</code> पर (अक्षर <code>'a'</code> केंद्र):<br/>
    &nbsp;&nbsp;• <code>expand(1, 1)</code> (विषम लंबाई): <code>s[0..2] = "bab"</code> देता है। लंबाई = 3।<br/>
    &nbsp;&nbsp;• <code>expand(1, 2)</code> (सम लंबाई): <code>s[1]=='a' != s[2]=='b'</code>। लंबाई = 0।<br/>
    &nbsp;&nbsp;• चूंकि 3 वर्तमान विंडो (1) से बड़ा है, अपडेट करें: <code>start = 0</code>, <code>end = 2</code>। वर्तमान सबसे लंबी स्ट्रिंग: <code>"bab"</code>।<br/>
    - परिणामी सबस्ट्रिंग: <code>"bab"</code>
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> इनपुट स्ट्रिंग की खाली जांच करना।</li>
    <li><b>लाइन 4:</b> अधिकतम सीमा ट्रैक करने के लिए <code>start</code> और <code>end</code> वेरिएबल्स को 0 सेट करना।</li>
    <li><b>लाइन 6-10:</b> केंद्र से बाहर की ओर सममित अक्षरों की जांच करने वाला हेल्पर फंक्शन।</li>
    <li><b>लाइन 12:</b> प्रत्येक इंडेक्स पर लूप चलाना।</li>
    <li><b>लाइन 13-14:</b> विषम और सम लंबाई के लिए केंद्र-विस्तार फ़ंक्शन चलाना।</li>
    <li><b>लाइन 15:</b> दोनों में से अधिकतम लंबाई का चुनाव करना।</li>
    <li><b>लाइन 16-18:</b> यदि वर्तमान लंबाई पूर्व अधिकतम से अधिक है, तो <code>start</code> और <code>end</code> को अपडेट करना।</li>
    <li><b>लाइन 19:</b> अंतिम सबस्ट्रिंग को स्लाइस करके लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80b7",
    title: "Palindromic Substrings Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Generate all possible contiguous substrings (O(N²)) and check if each is a palindrome (O(N)).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N³) | 🧠 Space: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Expand from Center)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">For each center index, expand outwards as long as characters match. Increment count at each match step.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N²) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def countSubstrings(self, s: str) -> int:
        count = 0
        
        def expand(left, right):
            cnt = 0
            while left >= 0 and right < len(s) and s[left] == s[right]:
                cnt += 1
                left -= 1
                right += 1
            return cnt
            
        for i in range(len(s)):
            count += expand(i, i)
            count += expand(i, i + 1)
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "abc")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Loop <code>i = 0</code> ('a'):<br/>
    &nbsp;&nbsp;• <code>expand(0, 0)</code> matches s[0]=='a'. <code>cnt=1</code>. Left shifts out of bounds. Returns 1.<br/>
    &nbsp;&nbsp;• <code>expand(0, 1)</code> mismatch ('a' vs 'b'). Returns 0. Total = 1.<br/>
    - Loop <code>i = 1</code> ('b'):<br/>
    &nbsp;&nbsp;• <code>expand(1, 1)</code> matches s[1]=='b'. <code>cnt=1</code>. Returns 1.<br/>
    &nbsp;&nbsp;• <code>expand(1, 2)</code> mismatch. Returns 0. Total = 2.<br/>
    - Loop <code>i = 2</code> ('c'):<br/>
    &nbsp;&nbsp;• <code>expand(2, 2)</code> matches s[2]=='c'. <code>cnt=1</code>. Returns 1. Total = 3.<br/>
    - Result count = 3 (substrings: "a", "b", "c") (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and <code>countSubstrings</code> function definition. Set <code>count = 0</code>.</li>
    <li><b>Line 5:</b> <code>expand(left, right)</code> expands outward to count matching palindromes.</li>
    <li><b>Line 7:</b> Expand while indexes are valid and characters match.</li>
    <li><b>Line 8-10:</b> Increment counter and expand pointers.</li>
    <li><b>Line 11:</b> Return the count of palindromes found for this center.</li>
    <li><b>Line 13:</b> Loop through each index in the string.</li>
    <li><b>Line 14-15:</b> Run and accumulate odd-length and even-length expansions.</li>
    <li><b>Line 16:</b> Return final accumulated count.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 ब्रूट फ़ोर्स दृष्टिकोण</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सभी संभव सबस्ट्रिंग्स बनाएं (O(N²)) और प्रत्येक सबस्ट्रिंग को चेक करें कि वह पैलिंड्रोम है या नहीं (O(N))।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय जटिलता: O(N³) | 🧠 स्थान जटिलता: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Expand from Center)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक कैरेक्टर को केंद्र मानकर बाहर की ओर तब तक बढ़ें जब तक अक्षर समान रहें। हर कदम पर गिनती (cnt) को बढ़ाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय जटिलता: O(N²) | 🧠 स्थान जटिलता: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def countSubstrings(self, s: str) -> int:
        count = 0
        
        def expand(left, right):
            cnt = 0
            while left >= 0 and right < len(s) and s[left] == s[right]:
                cnt += 1
                left -= 1
                right += 1
            return cnt
            
        for i in range(len(s)):
            count += expand(i, i)
            count += expand(i, i + 1)
        return count</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "abc")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - इंडेक्स <code>i = 0</code> पर: विषम विस्तार 'a' खोजता है (cnt=1)। सम विस्तार खाली है (0)। कुल = 1।<br/>
    - इंडेक्स <code>i = 1</code> पर: विषम विस्तार 'b' खोजता है (cnt=1)। सम विस्तार खाली है (0)। कुल = 1 + 1 = 2।<br/>
    - इंडेक्स <code>i = 2</code> पर: विषम विस्तार 'c' खोजता है (cnt=1)। कुल = 2 + 1 = 3।<br/>
    - कुल पैलिंड्रोम सबस्ट्रिंग्स = 3 ("a", "b", "c")
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> फ़ंक्शन और <code>count</code> काउंटर की घोषणा।</li>
    <li><b>लाइन 5:</b> <code>expand</code> हेल्पर फ़ंक्शन जो इंडेक्स मैच होने पर काउंट बढ़ाता है।</li>
    <li><b>लाइन 7:</b> सीमाओं के भीतर सममित अक्षरों की जाँच।</li>
    <li><b>लाइन 8-10:</b> काउंट बढ़ाना और पॉइंटर्स का विस्तार।</li>
    <li><b>लाइन 11:</b> एक केंद्र से मिलने वाले पैलिंड्रोम्स की कुल संख्या लौटाना।</li>
    <li><b>लाइन 13:</b> प्रत्येक इंडेक्स पर लूप।</li>
    <li><b>लाइन 14-15:</b> सम और विषम केंद्र विस्तार जोड़ना।</li>
    <li><b>लाइन 16:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80b9",
    title: "Longest Palindrome Subsequence Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 DP State Definition</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Let <code>dp[i][j]</code> be the length of the longest palindromic subsequence in <code>s[i...j]</code>. If <code>s[i] == s[j]</code>, then <code>dp[i][j] = dp[i+1][j-1] + 2</code>. Otherwise, <code>dp[i][j] = max(dp[i+1][j], dp[i][j-1])</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N²) | 🧠 Space: O(N) optimized space</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [0] * n
        for i in range(n - 1, -1, -1):
            new_dp = [0] * n
            new_dp[i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    new_dp[j] = dp[j - 1] + 2
                else:
                    new_dp[j] = max(dp[j], new_dp[j - 1])
            dp = new_dp
        return dp[n - 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "bbbab")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Initialization: <code>dp = [0, 0, 0, 0, 0]</code> (Size 5)<br/>
    - Outer loop <code>i = 3</code> (s[3]='a'):<br/>
    &nbsp;&nbsp;• <code>new_dp[3] = 1</code><br/>
    &nbsp;&nbsp;• <code>j = 4</code> (s[4]='b'): <code>'a' != 'b'</code> -> <code>new_dp[4] = max(dp[4], new_dp[3]) = max(0, 1) = 1</code>. <code>dp</code> becomes: <code>[0, 0, 0, 1, 1]</code><br/>
    - Outer loop <code>i = 2</code> (s[2]='b'):<br/>
    &nbsp;&nbsp;• <code>new_dp[2] = 1</code><br/>
    &nbsp;&nbsp;• <code>j = 3</code>: <code>'b' != 'a'</code> -> <code>new_dp[3] = max(dp[3], new_dp[2]) = 1</code>.<br/>
    &nbsp;&nbsp;• <code>j = 4</code>: <code>s[2] == s[4]</code> ('b'=='b') -> <code>new_dp[4] = dp[3] + 2 = 1 + 2 = 3</code>. <code>dp</code> becomes: <code>[0, 0, 1, 1, 3]</code><br/>
    - ... (propagates matches)<br/>
    - Final returns: <code>dp[4] = 4</code> (subsequence: "bbbb") (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Function definition and <code>dp</code> array instantiation.</li>
    <li><b>Line 4:</b> Loop from end of string <code>n - 1</code> down to 0 to fill bottom-up.</li>
    <li><b>Line 5-6:</b> Create <code>new_dp</code> list and set base case (single character palindrome length is 1).</li>
    <li><b>Line 7:</b> Inner loop scanning characters forward from <code>i + 1</code>.</li>
    <li><b>Line 8-9:</b> If matches, length increases by 2 from subproblem state (<code>dp[j - 1]</code>).</li>
    <li><b>Line 10-11:</b> If mismatch, take maximum of excluding either left or right boundary.</li>
    <li><b>Line 12:</b> Assign current state array to <code>dp</code>.</li>
    <li><b>Line 13:</b> Return LPS length stored at <code>dp[n - 1]</code>.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 DP स्टेट परिभाषा</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">मान लें कि <code>dp[i][j]</code> सबस्ट्रिंग <code>s[i...j]</code> में सबसे लंबे पैलिंड्रोम उपक्रम की लंबाई है। यदि <code>s[i] == s[j]</code> है, तो <code>dp[i][j] = dp[i+1][j-1] + 2</code>। अन्यथा, <code>dp[i][j] = max(dp[i+1][j], dp[i][j-1])</code>।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N²) | 🧠 स्थान: O(N) (अनुकूलित)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [0] * n
        for i in range(n - 1, -1, -1):
            new_dp = [0] * n
            new_dp[i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    new_dp[j] = dp[j - 1] + 2
                else:
                    new_dp[j] = max(dp[j], new_dp[j - 1])
            dp = new_dp
        return dp[n - 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "bbbab")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - शुरुआत: <code>dp = [0, 0, 0, 0, 0]</code><br/>
    - जब <code>i = 2</code> (s[2]='b'):<br/>
    &nbsp;&nbsp;• <code>new_dp[2] = 1</code><br/>
    &nbsp;&nbsp;• <code>j = 3</code> ('b' vs 'a'): <code>new_dp[3] = max(dp[3], 1) = 1</code>.<br/>
    &nbsp;&nbsp;• <code>j = 4</code> ('b' == 'b'): <code>new_dp[4] = dp[3] + 2 = 1 + 2 = 3</code>.<br/>
    &nbsp;&nbsp;• <code>dp</code> अपडेट: <code>[0, 0, 1, 1, 3]</code><br/>
    - अंत में <code>dp[4]</code> की वैल्यू <code>4</code> हो जाती है (उपक्रम: "bbbb")।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> इनपुट स्ट्रिंग की लंबाई और DP एरे बनाना।</li>
    <li><b>लाइन 4:</b> स्ट्रिंग के पीछे से लूप शुरू करना (बॉटम-अप दृष्टिकोण)।</li>
    <li><b>लाइन 5-6:</b> एक नया <code>new_dp</code> बनाना और बेस केस (एक कैरेक्टर की लंबाई 1) सेट करना।</li>
    <li><b>Line 7:</b> इंडेक्स <code>i + 1</code> से आगे की ओर लूप चलाना।</li>
    <li><b>लाइन 8-9:</b> यदि अक्षर मेल खाते हैं, तो सबप्रॉब्लम स्टेट (<code>dp[j - 1]</code>) में 2 जोड़ना।</li>
    <li><b>लाइन 10-11:</b> मेल न खाने पर, सीमाओं में से अधिकतम मान चुनना।</li>
    <li><b>लाइन 12:</b> वर्तमान स्थिति को मुख्य <code>dp</code> एरे में स्थानांतरित करना।</li>
    <li><b>लाइन 13:</b> अंतिम स्थान पर संचित LPS मान लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80bb",
    title: "Palindrome Partitioning Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Backtracking Algorithm Strategy</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Try slicing at every boundary. If prefix slice is a palindrome, recurse on remainder. Backtrack upon returning.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N * 2^N) | 🧠 Space: O(N²)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def partition(self, s: str) -> List[List[str]]:
        res = []
        part = []
        n = len(s)
        
        # Precompute palindromes
        dp = [[False] * n for _ in range(n)]
        for length in range(1, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                if s[i] == s[j]:
                    dp[i][j] = True if j - i < 2 else dp[i + 1][j - 1]
                    
        def dfs(i):
            if i >= n:
                res.append(part.copy())
                return
            for j in range(i, n):
                if dp[i][j]:
                    part.append(s[i:j + 1])
                    dfs(j + 1)
                    part.pop()
                    
        dfs(0)
        return res</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "aab")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Precomputed DP Table: <code>dp[0][0]=True ("a")</code>, <code>dp[1][1]=True ("a")</code>, <code>dp[2][2]=True ("b")</code>, <code>dp[0][1]=True ("aa")</code>. Others are False.<br/>
    - Backtracking execution:<br/>
    &nbsp;&nbsp;• <code>dfs(0)</code> tries splits:<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;- <code>j = 0</code>: <code>dp[0][0]</code> is True. <code>part = ["a"]</code>. Calls <code>dfs(1)</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* <code>dfs(1)</code>: <code>j = 1</code>: <code>dp[1][1]</code> is True. <code>part = ["a", "a"]</code>. Calls <code>dfs(2)</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;o <code>dfs(2)</code>: <code>j = 2</code>: <code>dp[2][2]</code> is True. <code>part = ["a", "a", "b"]</code>. Calls <code>dfs(3)</code> -> Base case! Add <code>["a", "a", "b"]</code> to results. Pop <code>"b"</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* Pop <code>"a"</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;- <code>j = 1</code>: <code>dp[0][1]</code> is True. <code>part = ["aa"]</code>. Calls <code>dfs(2)</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* <code>dfs(2)</code>: <code>j = 2</code>: <code>dp[2][2]</code> is True. <code>part = ["aa", "b"]</code>. Calls <code>dfs(3)</code> -> Base case! Add <code>["aa", "b"]</code> to results. Pop <code>"b"</code>.<br/>
    - Result list: <code>[["a", "a", "b"], ["aa", "b"]]</code> (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Initialize output <code>res</code> and current partition path tracker <code>part</code>.</li>
    <li><b>Line 8-13:</b> DP table structure setup to precompute palindrome matches for O(1) checks.</li>
    <li><b>Line 15:</b> <code>dfs(i)</code> recursive helper starting at index <code>i</code>.</li>
    <li><b>Line 16-18:</b> Leaf condition. If <code>i</code> exceeds boundary, append current path copy to result.</li>
    <li><b>Line 19:</b> Scan every ending position <code>j</code>.</li>
    <li><b>Line 20:</b> Check if substring <code>s[i...j]</code> is symmetric.</li>
    <li><b>Line 21-23:</b> Add candidate prefix slice to path, recurse on remainder, and pop suffix to backtrack.</li>
    <li><b>Line 25-26:</b> Start solver at index 0 and return accumulated result lists.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 बैकट्रैकिंग एल्गोरिदम रणनीति</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">हर संभव सीमा पर सबस्ट्रिंग काटें। यदि उपसर्ग (prefix) पैलिंड्रोम है, तो शेष भाग पर पुनरावृत्ति (recurse) करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N * 2^N) | 🧠 स्थान: O(N²)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def partition(self, s: str) -> List[List[str]]:
        res = []
        part = []
        n = len(s)
        
        # पैलिंड्रोम की पूर्व-गणना
        dp = [[False] * n for _ in range(n)]
        for length in range(1, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                if s[i] == s[j]:
                    dp[i][j] = True if j - i < 2 else dp[i + 1][j - 1]
                    
        def dfs(i):
            if i >= n:
                res.append(part.copy())
                return
            for j in range(i, n):
                if dp[i][j]:
                    part.append(s[i:j + 1])
                    dfs(j + 1)
                    part.pop()
                    
        dfs(0)
        return res</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "aab")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - पूर्व-गणना DP: <code>dp[0][0]=True ("a")</code>, <code>dp[1][1]=True ("a")</code>, <code>dp[0][1]=True ("aa")</code>, <code>dp[2][2]=True ("b")</code>.<br/>
    - निष्पादन:<br/>
    &nbsp;&nbsp;• <code>dfs(0)</code>:<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;- <code>j = 0</code> ("a" पैलिंड्रोम): <code>part = ["a"]</code>. कॉल <code>dfs(1)</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* <code>dfs(1)</code>: <code>j = 1</code> ("a" पैलिंड्रोम): <code>part = ["a", "a"]</code>. कॉल <code>dfs(2)</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;o <code>dfs(2)</code>: <code>j = 2</code> ("b" पैलिंड्रोम): <code>part = ["a", "a", "b"]</code>. <code>dfs(3)</code> (बेस केस!) -> <code>["a", "a", "b"]</code> सहेजा।<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;- <code>j = 1</code> ("aa" पैलिंड्रोम): <code>part = ["aa"]</code>. कॉल <code>dfs(2)</code>.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* <code>dfs(2)</code>: <code>part = ["aa", "b"]</code>. बेस केस! -> <code>["aa", "b"]</code> सहेजा।<br/>
    - अंतिम परिणाम: <code>[["a", "a", "b"], ["aa", "b"]]</code>
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-4:</b> रिजल्ट लिस्ट <code>res</code> और पाथ ट्रैकर <code>part</code> बनाना।</li>
    <li><b>लाइन 7-13:</b> O(1) चेक करने के लिए सभी सबस्ट्रिंग समरूपता की पहले से तालिका गणना करना।</li>
    <li><b>लाइन 15:</b> DFS रिकर्सिव फंक्शन की घोषणा।</li>
    <li><b>लाइन 16-18:</b> यदि इंडेक्स <code>i</code> स्ट्रिंग की लंबाई के बराबर हो, तो पाथ कॉपी को रिजल्ट में जोड़ना।</li>
    <li><b>लाइन 19:</b> इंडेक्स <code>i</code> से अंत तक विभाजन स्लाइस ट्राई करना।</li>
    <li><b>लाइन 20:</b> यदि उपसर्ग पैलिंड्रोम है।</li>
    <li><b>लाइन 21-23:</b> लिस्ट में सबस्ट्रिंग जोड़ना, अगले इंडेक्स पर जाना, और बैकट्रैक (pop) करना।</li>
    <li><b>लाइन 25-26:</b> DFS शुरू करना और लिस्ट लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e7505fc05bf5f0580b80bd",
    title: "Shortest Palindrome Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Problem Logic</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Prepending minimum characters implies finding the longest symmetric prefix in <code>S</code>. The remaining suffix tail must be reversed and added to the front.</p>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (KMP / LPS Array)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Create string <code>temp = S + "#" + rev(S)</code>. The KMP prefix table value of the last index (<code>lps[-1]</code>) determines the length of the longest palindromic prefix.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def shortestPalindrome(self, s: str) -> str:
        if not s: return ""
        rev_s = s[::-1]
        temp = s + "#" + rev_s
        
        lps = [0] * len(temp)
        for i in range(1, len(temp)):
            j = lps[i - 1]
            while j > 0 and temp[i] != temp[j]:
                j = lps[j - 1]
            if temp[i] == temp[j]:
                j += 1
            lps[i] = j
            
        pal_len = lps[-1]
        suffix_to_reverse = s[pal_len:]
        return suffix_to_reverse[::-1] + s</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "aacecaaa")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Input: <code>s = "aacecaaa"</code>. Reversed: <code>rev_s = "aaacecaa"</code><br/>
    - Temp setup: <code>temp = "aacecaaa#aaacecaa"</code><br/>
    - Populate KMP <code>lps</code> table. The last index value matches prefix <code>"aacecaa"</code> (length = 7).<br/>
    - Palindrome prefix length: <code>pal_len = 7</code><br/>
    - Remaining suffix: <code>s[7:] = "a"</code><br/>
    - Prepend reversed suffix to front: <code>"a" + "aacecaaa" = "aaacecaaa"</code> (Correct shortest palindrome!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class setup and check boundary for empty string.</li>
    <li><b>Line 4-5:</b> Reverse string and generate KMP helper template <code>s + "#" + rev_s</code>.</li>
    <li><b>Line 7:</b> Create <code>lps</code> lookup table array.</li>
    <li><b>Line 8-14:</b> KMP prefix index computation loop.</li>
    <li><b>Line 16:</b> Read prefix length of symmetry from last table element.</li>
    <li><b>Line 17-18:</b> Reverse suffix portion, prepend to front, and return.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 समस्या तर्क</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">न्यूनतम कैरेक्टर जोड़ने के लिए हमें सबसे लंबे पैलिंड्रोम उपसर्ग (prefix) को ढूंढना होगा। शेष अंत भाग को उलटकर सामने जोड़ा जाता है।</p>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (KMP / LPS सरणी)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">स्ट्रिंग <code>temp = S + "#" + rev(S)</code> बनाएं। KMP LPS तालिका का अंतिम मान सबसे लंबे पैलिंड्रोम उपसर्ग की लंबाई तय करता है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def shortestPalindrome(self, s: str) -> str:
        if not s: return ""
        rev_s = s[::-1]
        temp = s + "#" + rev_s
        
        lps = [0] * len(temp)
        for i in range(1, len(temp)):
            j = lps[i - 1]
            while j > 0 and temp[i] != temp[j]:
                j = lps[j - 1]
            if temp[i] == temp[j]:
                j += 1
            lps[i] = j
            
        pal_len = lps[-1]
        suffix_to_reverse = s[pal_len:]
        return suffix_to_reverse[::-1] + s</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "aacecaaa")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - इनपुट: <code>s = "aacecaaa"</code>, <code>rev_s = "aaacecaa"</code><br/>
    - KMP स्ट्रिंग: <code>temp = "aacecaaa#aaacecaa"</code><br/>
    - LPS तालिका गणना में अंतिम मान 7 आता है ("aacecaa" उपसर्ग मैच)।<br/>
    - उपसर्ग लंबाई = 7। बचा हिस्सा = "a"।<br/>
    - उलटकर जोड़ने पर: <code>"a" + "aacecaaa" = "aaacecaaa"</code>।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> फ़ंक्शन की घोषणा और खाली स्ट्रिंग जांच।</li>
    <li><b>लाइन 4-5:</b> स्ट्रिंग को उलटना और KMP टेम्पलेट स्ट्रिंग बनाना।</li>
    <li><b>लाइन 7:</b> <code>lps</code> लुकअप एरे बनाना।</li>
    <li><b>लाइन 8-14:</b> KMP उपसर्ग मान भरने वाला लूप।</li>
    <li><b>लाइन 16:</b> अंतिम स्थान पर स्टोर उपसर्ग लंबाई प्राप्त करना।</li>
    <li><b>लाइन 17-18:</b> प्रत्यय को उलटना, सामने जोड़ना और लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75060c05bf5f0580b80bf",
    title: "Break a Palindrome Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Greedy Selection Rules</h4>
    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
      <li>If string length is 1, it is impossible to form a non-palindrome. Return empty string <code>""</code>.</li>
      <li>Examine first half of string. Replace first non-<code>'a'</code> character with <code>'a'</code>.</li>
      <li>If all characters in the first half are <code>'a'</code>, change the very last character of the entire string to <code>'b'</code>.</li>
    </ul>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #4f46e5;">⏱️ Time: O(N) | 🧠 Space: O(N) (mutability list conversion)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def breakPalindrome(self, palindrome: str) -> str:
        n = len(palindrome)
        if n <= 1: return ""
        
        arr = list(palindrome)
        for i in range(n // 2):
            if arr[i] != 'a':
                arr[i] = 'a'
                return "".join(arr)
                
        arr[-1] = 'b'
        return "".join(arr)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (palindrome = "abccba")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Length <code>n = 6</code>. Loop range: <code>i = 0 to 2</code> (first half: "abc").<br/>
    - Index <code>i = 0</code> ('a'): character is 'a', continue.<br/>
    - Index <code>i = 1</code> ('b'): character is NOT 'a'. Modify to 'a'. String becomes: <code>"aaccba"</code>.<br/>
    - Joined output: <code>"aaccba"</code> (Correct lexicographically smallest choice!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Define function and check if string has 1 or fewer characters. Returns <code>""</code>.</li>
    <li><b>Line 5:</b> Convert to list for element replacement.</li>
    <li><b>Line 6:</b> Loop through indices of the first half of the string.</li>
    <li><b>Line 7-9:</b> If any character is not 'a', set it to 'a' and return immediately.</li>
    <li><b>Line 11-12:</b> If first half consists only of 'a's (e.g., "aba"), replace last character with 'b' and return.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 लालची (Greedy) चयन नियम</h4>
    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
      <li>यदि स्ट्रिंग की लंबाई 1 है, तो पैलिंड्रोम तोड़ना संभव नहीं है। खाली स्ट्रिंग <code>""</code> लौटाएं।</li>
      <li>स्ट्रिंग के पहले आधे हिस्से की जांच करें। पहले गैर-<code>'a'</code> कैरेक्टर को <code>'a'</code> से बदलें।</li>
      <li>यदि पहले आधे हिस्से में सभी अक्षर <code>'a'</code> हैं, तो पूरी स्ट्रिंग के आखिरी कैरेक्टर को <code>'b'</code> से बदलें।</li>
    </ul>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #4f46e5;">⏱️ समय जटिलता: O(N) | 🧠 स्थान जटिलता: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def breakPalindrome(self, palindrome: str) -> str:
        n = len(palindrome)
        if n <= 1: return ""
        
        arr = list(palindrome)
        for i in range(n // 2):
            if arr[i] != 'a':
                arr[i] = 'a'
                return "".join(arr)
                
        arr[-1] = 'b'
        return "".join(arr)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (palindrome = "abccba")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - लंबाई = 6। पहला आधा भाग: "abc"।<br/>
    - इंडेक्स <code>i = 0</code> ('a'): अक्षर 'a' है, आगे बढ़ें।<br/>
    - इंडेक्स <code>i = 1</code> ('b'): अक्षर 'a' नहीं है। इसे 'a' से बदलें। स्ट्रिंग: <code>"aaccba"</code>।<br/>
    - परिणाम: <code>"aaccba"</code>
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> लंबाई 1 या उससे कम होने पर सीधे खाली स्ट्रिंग <code>""</code> लौटाना।</li>
    <li><b>लाइन 5:</b> स्ट्रिंग को लिस्ट में बदलना ताकि अक्षरों को बदला जा सके।</li>
    <li><b>लाइन 6:</b> स्ट्रिंग के पहले आधे भाग के लिए लूप।</li>
    <li><b>लाइन 7-9:</b> यदि कोई भी अक्षर 'a' नहीं है, तो उसे 'a' से बदलकर स्ट्रिंग लौटाना।</li>
    <li><b>लाइन 11-12:</b> यदि पहले आधे भाग में केवल 'a' हैं, तो अंतिम कैरेक्टर को 'b' से बदलना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75060c05bf5f0580b80c1",
    title: "Palindrome Pairs Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Mathematical Analysis</h4>
    <p style="margin: 0; font-size: 13px; color: #581c87; line-height: 1.5;">Split any word <code>w1 = prefix + suffix</code>. If <code>suffix</code> is a palindrome, then <code>w2</code> must be reverse of <code>prefix</code>. If <code>prefix</code> is a palindrome, then <code>w2</code> must be reverse of <code>suffix</code>.</p>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal (Hash Map Lookup)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Map each word to its index. Split words at every possible position and look up reversed parts in O(1).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(K² * N) (K = word size) | 🧠 Space: O(N * K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def palindromePairs(self, words: List[str]) -> List[List[int]]:
        words_map = {word: i for i, word in enumerate(words)}
        res = []
        
        for i, word in enumerate(words):
            for j in range(len(word) + 1):
                pref = word[:j]
                suff = word[j:]
                
                if pref == pref[::-1]:
                    rev_suff = suff[::-1]
                    if rev_suff in words_map and words_map[rev_suff] != i:
                        res.append([words_map[rev_suff], i])
                        
                if j > 0 and suff == suff[::-1]:
                    rev_pref = pref[::-1]
                    if rev_pref in words_map and words_map[rev_pref] != i:
                        res.append([i, words_map[rev_pref]])
                        
        return res</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (words = ["abcd", "dcba", "lls", "s", "sssll"])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Map: <code>{"abcd": 0, "dcba": 1, "lls": 2, "s": 3, "sssll": 4}</code><br/>
    - Word 0 (<code>"abcd"</code>): Splits at 0: prefix="", suffix="abcd". Prefix is palindrome. Reversed suffix = "dcba" (index 1). Valid pair: <code>[1, 0]</code>.<br/>
    - Word 2 (<code>"lls"</code>): Splits at 2: prefix="ll", suffix="s". Prefix is palindrome ("ll"). Reversed suffix = "s" (index 3). Valid pair: <code>[3, 2]</code> ("slls").<br/>
    - Result list: <code>[[1, 0], [3, 2], ...]</code> (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and word-to-index mapping dictionary instantiation.</li>
    <li><b>Line 5:</b> Main loop iterating through each word.</li>
    <li><b>Line 6:</b> Partitioning loop splitting word from <code>j = 0</code> to length.</li>
    <li><b>Line 7-8:</b> Slice prefix and suffix.</li>
    <li><b>Line 10-13:</b> Check if prefix is palindrome. Look up reversed suffix in map. Append pair on match.</li>
    <li><b>Line 15-18:</b> Check if suffix is palindrome. Look up reversed prefix. Append pair (avoiding duplicate checks using <code>j > 0</code>).</li>
    <li><b>Line 20:</b> Return accumulated result list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 गणितीय विश्लेषण</h4>
    <p style="margin: 0; font-size: 13px; color: #581c87; line-height: 1.5;">किसी शब्द को विभाजित करें <code>w1 = prefix + suffix</code>। यदि <code>suffix</code> पैलिंड्रोम है, तो <code>w2</code> को <code>prefix</code> का उल्टा होना चाहिए। यदि <code>prefix</code> पैलिंड्रोम है, तो <code>w2</code> को <code>suffix</code> का उल्टा होना चाहिए।</p>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Hash Map Lookup)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक शब्द को इंडेक्स के साथ मैप करें। फिर O(1) समय में उल्टे भागों की खोज करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(K² * N) | 🧠 स्थान: O(N * K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def palindromePairs(self, words: List[str]) -> List[List[int]]:
        words_map = {word: i for i, word in enumerate(words)}
        res = []
        
        for i, word in enumerate(words):
            for j in range(len(word) + 1):
                pref = word[:j]
                suff = word[j:]
                
                if pref == pref[::-1]:
                    rev_suff = suff[::-1]
                    if rev_suff in words_map and words_map[rev_suff] != i:
                        res.append([words_map[rev_suff], i])
                        
                if j > 0 and suff == suff[::-1]:
                    rev_pref = pref[::-1]
                    if rev_pref in words_map and words_map[rev_pref] != i:
                        res.append([i, words_map[rev_pref]])
                        
        return res</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (words = ["abcd", "dcba", "lls", "s", "sssll"])</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - मैप: <code>{"abcd": 0, "dcba": 1, "lls": 2, "s": 3, "sssll": 4}</code><br/>
    - शब्द 2 (<code>"lls"</code>): <code>j = 2</code> पर: उपसर्ग = "ll" (पैलिंड्रोम है), प्रत्यय = "s"। उल्टा प्रत्यय = "s" (इंडेक्स 3)। वैध जोड़ी: <code>[3, 2]</code>।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> शब्दों को इंडेक्स के साथ मैप करके डिक्शनरी बनाना।</li>
    <li><b>लाइन 5:</b> हर एक शब्द के लिए लूप।</li>
    <li><b>लाइन 6:</b> शब्द को 0 से लंबाई तक विभाजन करने के लिए लूप।</li>
    <li><b>लाइन 7-8:</b> उपसर्ग (prefix) और प्रत्यय (suffix) बनाना।</li>
    <li><b>लाइन 10-13:</b> यदि उपसर्ग पैलिंड्रोम है, तो बचे हुए प्रत्यय के उल्टे भाग को खोजना और जोड़ी बनाना।</li>
    <li><b>लाइन 15-18:</b> यदि प्रत्यय पैलिंड्रोम है, तो उपसर्ग को उल्टा कर खोजना।</li>
    <li><b>लाइन 20:</b> परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75060c05bf5f0580b80c3",
    title: "Minimum Insertions to Palindrome Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Formula logic</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep the longest palindromic subsequence intact. Insert matching characters for the rest. Formula: <code>Insertions = Length of S - LPS(S)</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N²) | 🧠 Space: O(N) optimized DP</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minInsertions(self, s: str) -> int:
        n = len(s)
        dp = [0] * n
        for i in range(n - 1, -1, -1):
            new_dp = [0] * n
            new_dp[i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    new_dp[j] = dp[j - 1] + 2
                else:
                    new_dp[j] = max(dp[j], new_dp[j - 1])
            dp = new_dp
        return n - dp[n - 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "mbadm")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - String length <code>n = 5</code>.<br/>
    - LPS DP computes the longest palindromic subsequence. The LPS length is 3 (subsequence "mam" or "mbm").<br/>
    - Calculate insertions: <code>Insertions = 5 - LPS_Length = 5 - 3 = 2</code>.<br/>
    - Output returned: <code>2</code> (insert 'd' and 'b' to form "mbdadbm") (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class setup and DP array initialization.</li>
    <li><b>Line 4:</b> Scan string backward.</li>
    <li><b>Line 5-6:</b> Temporary array setup, set single character palindrome base case length to 1.</li>
    <li><b>Line 7:</b> Forward search loop.</li>
    <li><b>Line 8-9:</b> Check character match. Add 2 to the diagonal subproblem.</li>
    <li><b>Line 10-11:</b> Mismatch case. Take max of excluding boundaries.</li>
    <li><b>Line 12:</b> Copy current state array.</li>
    <li><b>Line 13:</b> Return result as string length minus LPS length.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 सूत्र लॉजिक</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">सबसे लंबे पैलिंड्रोम सबसीक्वेंस (LPS) को वैसे ही रखें। बाकी के लिए मिलान अक्षर डालें। सूत्र: <code>न्यूनतम जोड़ = S की लंबाई - LPS(S)</code>।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N²) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def minInsertions(self, s: str) -> int:
        n = len(s)
        dp = [0] * n
        for i in range(n - 1, -1, -1):
            new_dp = [0] * n
            new_dp[i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    new_dp[j] = dp[j - 1] + 2
                else:
                    new_dp[j] = max(dp[j], new_dp[j - 1])
            dp = new_dp
        return n - dp[n - 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "mbadm")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - स्ट्रिंग लंबाई <code>n = 5</code>।<br/>
    - LPS DP गणना: सबसे लंबा उपक्रम "mam" या "mbm" है (लंबाई = 3)।<br/>
    - न्यूनतम जोड़ = <code>5 - 3 = 2</code>।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> इनपुट लंबाई और DP एरे सेटअप।</li>
    <li><b>लाइन 4:</b> स्ट्रिंग को पीछे की ओर लूप करना।</li>
    <li><b>लाइन 5-6:</b> एकल कैरेक्टर बेस केस (लंबाई 1) इनिशियलाइज़ करना।</li>
    <li><b>लाइन 7:</b> आगे की ओर जांच करने वाला लूप।</li>
    <li><b>लाइन 8-9:</b> यदि अक्षर मेल खाते हैं, तो 2 जोड़ना।</li>
    <li><b>लाइन 10-11:</b> अन्यथा सीमाओं से अधिकतम मान चुनना।</li>
    <li><b>लाइन 12:</b> डीपी तालिका अपडेट करना।</li>
    <li><b>लाइन 13:</b> परिणाम <code>n - lps</code> लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75060c05bf5f0580b80c5",
    title: "Partition Labels Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Problem Constraint</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Slices must keep each letter isolated inside a single partition. If we include a letter, the partition boundary must extend to its last occurrence index.</p>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Greedy Last-Occurrence Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Find last occurrence index of each character. Scan string, updating current partition boundary <code>j = max(j, last_occurrence[char])</code>. Split when index reaches <code>j</code>.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1) (max 26 entries)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {c: i for i, c in enumerate(s)}
        res = []
        anchor = 0
        j = 0
        for i, c in enumerate(s):
            j = max(j, last[c])
            if i == j:
                res.append(i - anchor + 1)
                anchor = i + 1
        return res</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "ababcbacadefegdehijhklij")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - Map: <code>{"a": 8, "b": 5, "c": 7, "d": 14, ...}</code><br/>
    - Initialize: <code>anchor = 0</code>, <code>j = 0</code><br/>
    - Iterate <code>i = 0 ('a')</code>: <code>j = max(0, 8) = 8</code><br/>
    - Iterate <code>i = 1 ('b')</code>: <code>j = max(8, 5) = 8</code><br/>
    - ... (continues until index 8)<br/>
    - Iterate <code>i = 8 ('a')</code>: <code>i == j</code> (8 == 8). Split partition! Size: <code>8 - 0 + 1 = 9</code>. <code>anchor = 9</code>.<br/>
    - Result list: <code>[9, 7, 8]</code> (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Set up character-to-last-index lookup dictionary.</li>
    <li><b>Line 4-5:</b> Initialize boundary trackers. <code>anchor</code> records partition start index.</li>
    <li><b>Line 6:</b> Main loop iterating through characters and indices.</li>
    <li><b>Line 7:</b> Expand boundary <code>j</code> to fit last occurrence of current character.</li>
    <li><b>Line 8-10:</b> Split partition when index reaches boundary. Record size and update <code>anchor</code>.</li>
    <li><b>Line 11:</b> Return sizes list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 समस्या की बाधा</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">विभाजन इस तरह होना चाहिए कि प्रत्येक अक्षर एक ही भाग में रहे। यदि कोई अक्षर शामिल किया जाता है, तो अंतिम सूचकांक तक सीमा बढ़ाई जानी चाहिए।</p>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Greedy Last-Occurrence Map)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक कैरेक्टर के अंतिम सूचकांक को रिकॉर्ड करें। लूप में सीमा को <code>j = max(j, last_occurrence[char])</code> द्वारा बढ़ाएं। इंडेक्स <code>j</code> पर विभाजन करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {c: i for i, c in enumerate(s)}
        res = []
        anchor = 0
        j = 0
        for i, c in enumerate(s):
            j = max(j, last[c])
            if i == j:
                res.append(i - anchor + 1)
                anchor = i + 1
        return res</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "ababcbacadefegdehijhklij")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - अंतिम मैप: <code>{"a": 8, "b": 5, "c": 7, "d": 14, ...}</code><br/>
    - शुरुआत में: <code>anchor = 0</code>, <code>j = 0</code><br/>
    - इंडेक्स <code>i = 0 ('a')</code> पर: <code>j = max(0, last['a']) = 8</code><br/>
    - इंडेक्स <code>i = 8 ('a')</code> पर: <code>i == j</code> (8 == 8)। विभाजन करें! आकार: <code>8 - 0 + 1 = 9</code>। <code>anchor = 9</code>।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> वर्णमाला के अंतिम स्थान की लुकअप डिक्शनरी बनाना।</li>
    <li><b>लाइन 4-5:</b> वर्तमान विभाजन शुरुआत सूचकांक (<code>anchor</code>) और सीमा (<code>j</code>) इनिशियलाइज़ करना।</li>
    <li><b>लाइन 6:</b> प्रत्येक अक्षर पर लूप।</li>
    <li><b>लाइन 7:</b> अंतिम सूचकांक के अनुसार सीमा <code>j</code> बढ़ाना।</li>
    <li><b>लाइन 8-10:</b> सीमा पर पहुँचने पर स्लाइस का आकार जोडना और <code>anchor</code> को अगले इंडेक्स पर सेट करना।</li>
    <li><b>लाइन 11:</b> विभाजन आकारों की लिस्ट लौटाना।</li>
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

    // Delete existing notes with matching taskIds so we don't duplicate them
    // This is safe since we only re-seed the notes we created in the previous step
    const parentId = new mongoose.Types.ObjectId(parentTaskId);
    const childIds = rawNotes.map(raw => new mongoose.Types.ObjectId(raw.taskId));
    const allIds = [parentId, ...childIds];
    
    console.log("Cleaning up old seeded palindrome notes from previous run...");
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
        tags: ["Palindrome", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed palindrome notes...`);
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
