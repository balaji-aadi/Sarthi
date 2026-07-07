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
const parentTaskId = "69e75061c05bf5f0580b80f3";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 Two Pointers (STRINGS) Identification Blueprint</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize String Two Pointers Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      Apply String Two Pointers when elements are processed from both ends inwards (palindromes, reversals), when processing in-place characters (compression, deletions), or when expanding from center blocks.
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Algorithm Guidelines</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Problem Class</th>
          <th style="padding: 6px 4px; font-weight: 700;">Pointers Configuration & Operations</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Meet in the Middle</td>
          <td style="padding: 6px 4px;">Pointers <code>left = 0</code> and <code>right = n - 1</code>. Compare or swap inward.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Read / Write Pointers</td>
          <td style="padding: 6px 4px;">Fast reader pointer scans values. Slow writer pointer records updates in-place (compression).</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Expand Around Center</td>
          <td style="padding: 6px 4px;">Loop each index <code>i</code>. Expand outwards for odd <code>(i, i)</code> and even <code>(i, i+1)</code> palindromes.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">Backspace String Compare</td>
          <td style="padding: 6px 4px;">Pointers at ends moving backwards. Skip characters dynamically based on backspace count.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #4f46e5; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 0;">📐 टू पॉइंटर्स (STRINGS) पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #3730a3; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 स्ट्रिंग टू पॉइंटर्स समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #312e81; line-height: 1.5;">
      टू पॉइंटर्स का उपयोग तब करें जब स्ट्रिंग में दोनों छोरों से तुलना की जाए (पैलिंड्रोम, रिवर्सल), इन-प्लेस कैरेक्टर रिप्लेस किए जाएं (कंप्रेशन, डिलीशन), या केंद्र से बाहर विस्तार किया जाए।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य श्रेणियां</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">समस्या श्रेणी</th>
          <th style="padding: 6px 4px; font-weight: 700;">पॉइंटर्स कॉन्फ़िगरेशन और क्रियाएं</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">मध्य में मिलें (Meet in the Middle)</td>
          <td style="padding: 6px 4px;">पॉइंटर्स <code>left = 0</code> और <code>right = n - 1</code>। अंदर की ओर तुलना करें या बदलें।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">रीड / राइट पॉइंटर्स</td>
          <td style="padding: 6px 4px;">तेज़ रीडर पॉइंटर स्कैन करता है। धीमा राइटर पॉइंटर इन-प्लेस बदलाव रिकॉर्ड करता है।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">केंद्र से बाहर विस्तार करें</td>
          <td style="padding: 6px 4px;">प्रत्येक इंडेक्स <code>i</code> पर लूप चलाएं। विषम <code>(i, i)</code> और सम <code>(i, i+1)</code> पैलिंड्रोम के लिए विस्तार करें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #4f46e5;">बैकस्पेस स्ट्रिंग तुलना</td>
          <td style="padding: 6px 4px;">छोरों से पीछे की ओर चलने वाले पॉइंटर्स। बैकस्पेस (hash) काउंट के आधार पर स्किप करें।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Two Pointer String Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Two-Pointers-Strings", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e75061c05bf5f0580b80f5",
    title: "Valid palindrome Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers Squeeze)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers at both ends. Skip non-alphanumeric values. Compare lowercased characters, return False if mismatched.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
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
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and isPalindrome method signature.</li>
    <li><b>Line 3:</b> Set pointers at start and end coordinates.</li>
    <li><b>Line 4:</b> Loop while left pointer is smaller than right.</li>
    <li><b>Line 5-8:</b> Shift pointers past non-alphanumeric characters.</li>
    <li><b>Line 9-10:</b> Compare lowercased characters. Return False on mismatch.</li>
    <li><b>Line 11-12:</b> Shift pointers inward.</li>
    <li><b>Line 13:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers Squeeze)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">पॉइंटर्स को दोनों छोरों पर रखें। गैर-अक्षरों को छोड़ें। लोअरकेस मानों की तुलना करें, विषम होने पर सीधे False लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
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
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> पॉइंटर्स को बाएं और दाएं छोर पर स्थापित करना।</li>
    <li><b>लाइन 4:</b> लूप चलाना जब तक पॉइंटर्स आपस में न मिलें।</li>
    <li><b>लाइन 5-8:</b> गैर-अक्षरों (non-alphanumeric) को स्किप करना।</li>
    <li><b>लाइन 9-10:</b> लोअरकेस में अक्षरों की तुलना करना, विषम होने पर False लौटाना।</li>
    <li><b>लाइन 11-12:</b> पॉइंटर्स को अंदर की ओर खिसकाना।</li>
    <li><b>लाइन 13:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b80f7",
    title: "Reverse string Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers swap in-place)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers at both ends. Swap characters, move inward until pointers cross.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def reverseString(self, s: List[str]) -> None:
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and reverseString method signature.</li>
    <li><b>Line 3:</b> Set pointers at start and end indices.</li>
    <li><b>Line 4:</b> Loop until pointers cross.</li>
    <li><b>Line 5:</b> Swap values in-place.</li>
    <li><b>Line 6-7:</b> Shift pointers inward.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (इन-प्लेस स्वैप)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">पॉइंटर्स को दोनों छोरों पर रखें। अक्षरों को आपस में बदलें, पॉइंटर्स को अंदर की ओर तब तक खिसकाएं जब तक वे पार न हो जाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def reverseString(self, s: List[str]) -> None:
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> पॉइंटर्स को बाएं और दाएं छोर पर घोषित करना।</li>
    <li><b>लाइन 4:</b> लूप चलाना जब तक <code>left < right</code> हो।</li>
    <li><b>लाइन 5:</b> इन-प्लेस कैरेक्टर अदला-बदली (swap) करना।</li>
    <li><b>लाइन 6-7:</b> पॉइंटर्स को अंदर की ओर खिसकाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b80f9",
    title: "Reverse Words in a String Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Split and Reverse list)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Split string into list of words (this strips multiple whitespaces automatically). Swap elements in word list using two pointers. Join list with spaces.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def reverseWords(self, s: str) -> str:
        words = s.split()
        left, right = 0, len(words) - 1
        while left < right:
            words[left], words[right] = words[right], words[left]
            left += 1
            right -= 1
        return " ".join(words)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Dry Run (s = "  hello world  ")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - words = ["hello", "world"]. left = 0, right = 1.<br/>
    - Swap words -> words = ["world", "hello"]. left = 1, right = 0.<br/>
    - Joins output with spaces -> "world hello". (Correct!)
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and reverseWords method parameters.</li>
    <li><b>Line 3:</b> Split string to remove duplicate spaces and return array of words.</li>
    <li><b>Line 4:</b> Set pointers at start and end of words list.</li>
    <li><b>Line 5:</b> Loop until pointers cross.</li>
    <li><b>Line 6-8:</b> Swap words in list, shift pointers.</li>
    <li><b>Line 9:</b> Join words list with space separator.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Split and Reverse list)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">स्ट्रिंग को शब्दों की सूची में विभाजित (split) करें (यह खाली स्थानों को स्वतः हटा देता है)। दो पॉइंटर्स से शब्दों को आपस में बदलें। अंत में स्पेस से जोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def reverseWords(self, s: str) -> str:
        words = s.split()
        left, right = 0, len(words) - 1
        while left < right:
            words[left], words[right] = words[right], words[left]
            left += 1
            right -= 1
        return " ".join(words)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 ड्राई रन (s = "  hello world  ")</h3>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
    - words = ["hello", "world"] | left = 0, right = 1।<br/>
    - स्वैप -> words = ["world", "hello"]।<br/>
    - परिणाम: "world hello"।
  </div>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> <code>split()</code> फ़ंक्शन द्वारा शब्दों का एरे बनाना (अतिरिक्त रिक्त स्थान हटाकर)।</li>
    <li><b>लाइन 4:</b> शब्दों के एरे पर बाएं और दाएं पॉइंटर्स सेट करना।</li>
    <li><b>लाइन 5:</b> लूप चलाना जब तक पॉइंटर्स आपस में पार न हों।</li>
    <li><b>लाइन 6-8:</b> शब्दों को आपस में बदलना और पॉइंटर्स खिसकाना।</li>
    <li><b>लाइन 9:</b> शब्दों को स्पेस के साथ जोड़कर स्ट्रिंग लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b80fb",
    title: "Longest Palindromic Substring Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Expand Around Center Pointers</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">For each character index i, expand outward. A palindrome center can either be:
      - Odd length: single character center <code>(i, i)</code>.
      - Even length: gap center <code>(i, i+1)</code>.
      Track start and end coordinates of largest palindrome substring.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N²) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""
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
            if max_len > end - start:
                start = i - (max_len - 1) // 2
                end = i + max_len // 2
        return s[start:end + 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-5:</b> Return empty if blank, initialize start and end indices of longest substring.</li>
    <li><b>Line 7-11:</b> Helper function: expand outward while characters match, return length of palindrome.</li>
    <li><b>Line 13-16:</b> Loop indices. Expand odd length and even length palindromes, fetch max length.</li>
    <li><b>Line 17-19:</b> Update start/end coordinates if larger palindrome is found.</li>
    <li><b>Line 20:</b> Return longest palindrome substring.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 केंद्र से बाहर विस्तार करने का नियम (Expand Around Center)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">प्रत्येक इंडेक्स पर केंद्र मानकर बाहर की ओर बढ़ें। पैलिंड्रोम केंद्र दो हो सकते हैं:
      - विषम लंबाई: एक सिंगल कैरेक्टर केंद्र <code>(i, i)</code>।
      - सम लंबाई: गैप केंद्र <code>(i, i+1)</code>।
      सबसे बड़े पैलिंड्रोम की शुरुआत और अंत सीमा ट्रैक करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N²) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""
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
            if max_len > end - start:
                start = i - (max_len - 1) // 2
                end = i + max_len // 2
        return s[start:end + 1]</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> खाली इनपुट जांच, और अधिकतम सीमा वेरिएबल्स (start, end) को 0 रखना।</li>
    <li><b>लाइन 7-11:</b> सहायक फ़ंक्शन (expand): अक्षरों के मिलने तक बाहर की तरफ बढ़ना और लंबाई मापना।</li>
    <li><b>लाइन 13-16:</b> प्रत्येक इंडेक्स पर विषम और सम पैलिंड्रोम के विस्तार की लंबाई ज्ञात करना।</li>
    <li><b>लाइन 17-19:</b> बड़ी लंबाई मिलने पर start और end के निर्देशांकों को अपडेट करना।</li>
    <li><b>लाइन 20:</b> सबस्ट्रिंग काटकर परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b80fd",
    title: "String compression Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 Copying to new Array</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Build a new compressed array or string. Uses extra memory space.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ Time: O(N) | 🧠 Space: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers Read/Write in-place)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep <code>write</code> pointer at index 0. Loop with <code>read</code> pointer. Count consecutive character duplicates. Write character to <code>write</code> index, then write count digits if count > 1. Return <code>write</code> index.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def compress(self, chars: List[str]) -> int:
        write = 0
        read = 0
        n = len(chars)
        while read < n:
            char = chars[read]
            count = 0
            while read < n and chars[read] == char:
                read += 1
                count += 1
            chars[write] = char
            write += 1
            if count > 1:
                for digit in str(count):
                    chars[write] = digit
                    write += 1
        return write</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and method signature.</li>
    <li><b>Line 3-5:</b> Initialize write and read pointers, get array length.</li>
    <li><b>Line 6-7:</b> Loop until read scans full array. Record current character.</li>
    <li><b>Line 8-11:</b> Loop to count consecutive matching duplicates.</li>
    <li><b>Line 12-13:</b> Write current character to write index and shift write pointer.</li>
    <li><b>Line 14-17:</b> If duplicate count > 1, convert count to string and write each digit to write index, shifting write.</li>
    <li><b>Line 18:</b> Return write index (length of compressed array).</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔴 नए एरे में कॉपी करना</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">एक नया संपीड़ित (compressed) एरे या स्ट्रिंग बनाना।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ef4444;">⏱️ समय: O(N) | 🧠 स्थान: O(N)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers in-place)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्स 0 पर <code>write</code> पॉइंटर रखें। <code>read</code> पॉइंटर से लूप चलाएं। लगातार आने वाले डुप्लिकेट अक्षरों की संख्या गिनें। अक्षर को write पर दर्ज करें, फिर count > 1 होने पर संख्या के अंकों को दर्ज करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def compress(self, chars: List[str]) -> int:
        write = 0
        read = 0
        n = len(chars)
        while read < n:
            char = chars[read]
            count = 0
            while read < n and chars[read] == char:
                read += 1
                count += 1
            chars[write] = char
            write += 1
            if count > 1:
                for digit in str(count):
                    chars[write] = digit
                    write += 1
        return write</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> write, read और लंबाई (n) वेरिएबल्स घोषित करना।</li>
    <li><b>लाइन 6-7:</b> लूप चलाना जब तक read एरे को पूरा स्कैन न कर ले।</li>
    <li><b>लाइन 8-11:</b> लूप चलाकर लगातार समान अक्षरों की आवृत्ति गिनना।</li>
    <li><b>लाइन 12-13:</b> अक्षर को write स्थान पर लिखना और write को 1 आगे बढ़ाना।</li>
    <li><b>लाइन 14-17:</b> यदि आवृत्ति > 1 है, तो संख्या को अंकों में बदलकर write स्थान पर लिखना।</li>
    <li><b>लाइन 18:</b> संपीड़ित एरे का अंतिम इंडेक्स लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b80ff",
    title: "Merge strings alternately Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Use two pointers <code>i</code> and <code>j</code> on both strings. Alternately append word1[i] and word2[j] to answer list. Append any leftover suffix characters at the end.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N + M) | 🧠 Space: O(N + M) for answer</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def mergeAlternately(self, word1: str, word2: str) -> str:
        i, j = 0, 0
        ans = []
        n1, n2 = len(word1), len(word2)
        while i < n1 or j < n2:
            if i < n1:
                ans.append(word1[i])
                i += 1
            if j < n2:
                ans.append(word2[j])
                j += 1
        return "".join(ans)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and mergeAlternately method signature.</li>
    <li><b>Line 3-5:</b> Setup pointers i & j, empty result list, and lengths of input strings.</li>
    <li><b>Line 6:</b> Loop while either pointer is within bounds.</li>
    <li><b>Line 7-9:</b> If i is valid, append character from word1, increment i.</li>
    <li><b>Line 10-12:</b> If j is valid, append character from word2, increment j.</li>
    <li><b>Line 13:</b> Return joined result.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दोनों स्ट्रिंग्स पर दो पॉइंटर्स <code>i</code> और <code>j</code> रखें। उत्तर सूची में बारी-बारी से word1[i] और word2[j] जोड़ें। अंत में बचे हुए अक्षरों को जोड़ें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N + M) | 🧠 स्थान: O(N + M)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def mergeAlternately(self, word1: str, word2: str) -> str:
        i, j = 0, 0
        ans = []
        n1, n2 = len(word1), len(word2)
        while i < n1 or j < n2:
            if i < n1:
                ans.append(word1[i])
                i += 1
            if j < n2:
                ans.append(word2[j])
                j += 1
        return "".join(ans)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> पॉइंटर्स i, j, खाली परिणाम लिस्ट और दोनों स्ट्रिंग्स की लंबाई मापना।</li>
    <li><b>लाइन 6:</b> लूप चलाना जब तक कोई भी पॉइंटर सीमा में रहे।</li>
    <li><b>लाइन 7-9:</b> यदि i सीमा में है, तो word1 से अक्षर जोड़ें, i आगे बढ़ाएं।</li>
    <li><b>लाइन 10-12:</b> यदि j सीमा में है, तो word2 से अक्षर जोड़ें, j आगे बढ़ाएं।</li>
    <li><b>लाइन 13:</b> परिणामी स्ट्रिंग लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b8101",
    title: "Backspace string compare Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Backwards Two Pointers Skip Counts</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Pointers at the end of both strings. Track skip counters <code>skip_s</code> and <code>skip_t</code>. Loop backwards: if '#' found, increment skip count. If regular character and skip count > 0, decrement skip count and skip. Compare actual valid characters.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N + M) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        i, j = len(s) - 1, len(t) - 1
        skip_s, skip_t = 0, 0
        while i >= 0 or j >= 0:
            # Get next valid index for s
            while i >= 0:
                if s[i] == '#':
                    skip_s += 1
                    i -= 1
                elif skip_s > 0:
                    skip_s -= 1
                    i -= 1
                else:
                    break
            # Get next valid index for t
            while j >= 0:
                if t[j] == '#':
                    skip_t += 1
                    j -= 1
                elif skip_t > 0:
                    skip_t -= 1
                    j -= 1
                else:
                    break
            # Compare characters
            if i >= 0 and j >= 0:
                if s[i] != t[j]:
                    return False
            elif (i >= 0) != (j >= 0):
                return False
            i -= 1
            j -= 1
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-4:</b> Setup pointers at ends of strings, set skip counters.</li>
    <li><b>Line 5:</b> Loop while either pointer is valid.</li>
    <li><b>Line 6-16:</b> Find next valid character in s by skipping according to backspaces.</li>
    <li><b>Line 17-27:</b> Find next valid character in t.</li>
    <li><b>Line 28-30:</b> If both characters are valid, compare values. Return False if mismatched.</li>
    <li><b>Line 31-32:</b> If one string ends but other has valid characters left, return False.</li>
    <li><b>Line 33-34:</b> Decrement pointers.</li>
    <li><b>Line 35:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 पीछे से टू पॉइंटर्स और स्किप काउंटर</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">दोनों छोरों से शुरू होने वाले पॉइंटर्स। स्किप काउंटर <code>skip_s</code> और <code>skip_t</code> रखें। पीछे से चलें: यदि '#' है, तो स्किप काउंटर बढ़ाएं। यदि सामान्य अक्षर है और स्किप > 0 है, तो स्किप घटाएं। बाकी बचे अक्षरों की तुलना करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N + M) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        i, j = len(s) - 1, len(t) - 1
        skip_s, skip_t = 0, 0
        while i >= 0 or j >= 0:
            # Get next valid index for s
            while i >= 0:
                if s[i] == '#':
                    skip_s += 1
                    i -= 1
                elif skip_s > 0:
                    skip_s -= 1
                    i -= 1
                else:
                    break
            # Get next valid index for t
            while j >= 0:
                if t[j] == '#':
                    skip_t += 1
                    j -= 1
                elif skip_t > 0:
                    skip_t -= 1
                    j -= 1
                else:
                    break
            # Compare characters
            if i >= 0 and j >= 0:
                if s[i] != t[j]:
                    return False
            elif (i >= 0) != (j >= 0):
                return False
            i -= 1
            j -= 1
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> पीछे से पॉइंटर्स i, j और स्किप काउंटर्स सहेजने वाले वेरिएबल्स घोषित करना।</li>
    <li><b>लाइन 5:</b> लूप चलाना जब तक कोई भी पॉइंटर सीमा में रहे।</li>
    <li><b>लाइन 6-16:</b> s स्ट्रिंग में बैकस्पेस के अनुसार स्किप करके अगला वैध अक्षर स्थान खोजना।</li>
    <li><b>लाइन 17-27:</b> t स्ट्रिंग में स्किप करके अगला वैध अक्षर स्थान खोजना।</li>
    <li><b>लाइन 28-30:</b> यदि दोनों स्थानों पर अक्षर मौजूद हैं, तो मानों की तुलना करना, विषम होने पर False लौटाना।</li>
    <li><b>लाइन 31-32:</b> यदि एक स्ट्रिंग खत्म हो गई है पर दूसरी में अभी भी अक्षर बचे हैं, तो False लौटाना।</li>
    <li><b>लाइन 33-34:</b> पॉइंटर्स घटाना।</li>
    <li><b>लाइन 35:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b8103",
    title: "One edit distance Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Find Mismatch Substring Slices</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Compare lengths: if difference > 1, return False. Find first character mismatch index <code>i</code>:
      - If lengths are equal: check if <code>s[i+1:] == t[i+1:]</code> (replace).
      - If <code>len(s) < len(t)</code>: check if <code>s[i:] == t[i+1:]</code> (insert).
      - If <code>len(s) > len(t)</code>: check if <code>s[i+1:] == t[i:]</code> (delete).</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isOneEditDistance(self, s: str, t: str) -> bool:
        ns, nt = len(s), len(t)
        if abs(ns - nt) > 1:
            return False
        for i in range(min(ns, nt)):
            if s[i] != t[i]:
                if ns == nt:
                    return s[i + 1:] == t[i + 1:]
                elif ns < nt:
                    return s[i:] == t[i + 1:]
                else:
                    return s[i + 1:] == t[i:]
        return abs(ns - nt) == 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-5:</b> Fetch sizes, return False if length difference is greater than 1.</li>
    <li><b>Line 6-7:</b> Loop and locate first character mismatch.</li>
    <li><b>Line 8-9:</b> Equal lengths: verify if remaining suffixes are identical (1 character replacement operation).</li>
    <li><b>Line 10-11:</b> s is shorter: verify if remaining s equals remaining t from index i+1 (1 character insertion).</li>
    <li><b>Line 12-13:</b> s is longer: verify if remaining s from index i+1 equals remaining t (1 character deletion).</li>
    <li><b>Line 14:</b> Fallback: check if difference is exactly 1 (1 character addition at the end).</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 मवाद अंतर सबस्ट्रिंग स्लाइस नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">लंबाई तुलना करें: यदि अंतर > 1 है, तो False लौटाएं। पहला विषम अक्षर इंडेक्स <code>i</code> खोजें:
      - समान लंबाई होने पर: <code>s[i+1:] == t[i+1:]</code> (बदलना)।
      - s छोटा होने पर: <code>s[i:] == t[i+1:]</code> (जोड़ना)।
      - s बड़ा होने पर: <code>s[i+1:] == t[i:]</code> (हटाना)।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isOneEditDistance(self, s: str, t: str) -> bool:
        ns, nt = len(s), len(t)
        if abs(ns - nt) > 1:
            return False
        for i in range(min(ns, nt)):
            if s[i] != t[i]:
                if ns == nt:
                    return s[i + 1:] == t[i + 1:]
                elif ns < nt:
                    return s[i:] == t[i + 1:]
                else:
                    return s[i + 1:] == t[i:]
        return abs(ns - nt) == 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> दोनों की लंबाई मापना, लंबाई में अंतर 1 से अधिक होने पर सीधे False लौटाना।</li>
    <li><b>लाइन 6-7:</b> विषम अक्षर स्थान खोजना।</li>
    <li><b>लाइन 8-9:</b> लंबाई बराबर होने पर: जांचना कि शेष भाग समान हैं (रिप्लेस ऑपरेशन)।</li>
    <li><b>लाइन 10-11:</b> s छोटा होने पर: जांचना कि s का शेष भाग t के i+1 से आगे के समान है (इंसर्ट ऑपरेशन)।</li>
    <li><b>लाइन 12-13:</b> s बड़ा होने पर: जांचना कि s का i+1 से आगे का भाग t के शेष के समान है (डिलीट ऑपरेशन)।</li>
    <li><b>लाइन 14:</b> यदि लूप में कोई विषम अक्षर नहीं मिला, तो जांचना कि क्या लंबाई का अंतर ठीक 1 है (अंत में एक अक्षर का अंतर)।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b8105",
    title: "Remove Duplicates from Sorted Array Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers in-place write)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep <code>write</code> pointer at index 1. Loop <code>read</code> pointer from index 1. If <code>chars[read] != chars[read-1]</code>, copy element to write index, and increment write pointer.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def removeDuplicates(self, s: List[str]) -> int:
        if not s:
            return 0
        write = 1
        for read in range(1, len(s)):
            if s[read] != s[read - 1]:
                s[write] = s[read]
                write += 1
        return write</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3-4:</b> Return 0 if empty.</li>
    <li><b>Line 5:</b> Set write index pointer to 1.</li>
    <li><b>Line 6-9:</b> Loop indices. If current character is unique, copy to write index and shift write.</li>
    <li><b>Line 10:</b> Return unique characters count.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers in-place write)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्स 1 पर <code>write</code> पॉइंटर रखें। <code>read</code> पॉइंटर से इंडेक्स 1 से लूप चलाएं। अनोखा अक्षर मिलने पर उसे write पर लिखें और write आगे बढ़ाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def removeDuplicates(self, s: List[str]) -> int:
        if not s:
            return 0
        write = 1
        for read in range(1, len(s)):
            if s[read] != s[read - 1]:
                s[write] = s[read]
                write += 1
        return write</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> खाली होने पर 0 लौटाना।</li>
    <li><b>लाइन 5:</b> राइटर पॉइंटर (write) को इंडेक्स 1 पर सेट करना।</li>
    <li><b>लाइन 6-9:</b> इंडेक्स 1 से अंत तक लूप चलाना। पिछला अक्षर भिन्न होने पर उसे write इंडेक्स पर लिखना।</li>
    <li><b>लाइन 10:</b> अनोखे कैरेक्टर की संख्या (write) लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75061c05bf5f0580b8107",
    title: " Minimum Swaps to Move Zeros to End Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pointers swap zeros)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Keep <code>write</code> pointer at 0. Loop with <code>read</code> pointer. If current character is not '0', swap with element at <code>write</code> index, and increment write pointer.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def moveZeroes(self, s: List[str]) -> None:
        write = 0
        for read in range(len(s)):
            if s[read] != '0':
                s[write], s[read] = s[read], s[write]
                write += 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function signature.</li>
    <li><b>Line 3:</b> Set write index pointer to 0.</li>
    <li><b>Line 4:</b> Loop characters list.</li>
    <li><b>Line 5-7:</b> If character is not '0', swap values and increment write pointer index.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pointers swap zeros)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">इंडेक्स 0 पर <code>write</code> पॉइंटर रखें। <code>read</code> पॉइंटर से लूप चलाएं। यदि वर्तमान अक्षर '0' नहीं है, तो उसे write इंडेक्स के अक्षर से बदलें (swap) और write आगे बढ़ाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def moveZeroes(self, s: List[str]) -> None:
        write = 0
        for read in range(len(s)):
            if s[read] != '0':
                s[write], s[read] = s[read], s[write]
                write += 1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3:</b> राइटर पॉइंटर (write) को 0 सेट करना।</li>
    <li><b>लाइन 4:</b> एरे पर लूप चलाना।</li>
    <li><b>लाइन 5-7:</b> यदि वर्तमान अक्षर '0' नहीं है, तो उसे swap करें और write पॉइंटर आगे बढ़ाएं।</li>
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
    
    console.log("Cleaning up old seeded Two Pointers (STRINGS) notes...");
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
        tags: ["Two-Pointers-Strings", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed Two Pointers (STRINGS) notes...`);
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
