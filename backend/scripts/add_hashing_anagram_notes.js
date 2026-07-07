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
const parentTaskId = "69e75061c05bf5f0580b8109";

const parentEn = `<div style="font-family: sans-serif;">
  <h3 style="color: #0369a1; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0f2fe; padding-bottom: 6px; margin-top: 0;">📐 Hashing & Anagram (STRINGS) Identification Blueprint</h3>
  
  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0369a1; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 How to Recognize Hashing & Anagram Problems?</h4>
    <p style="margin: 0; font-size: 13px; color: #075985; line-height: 1.5;">
      Apply Hashing & Anagram patterns when verifying string character frequency maps, group permutations, isomorphic word shapes, mappings, or first unique indices in a string.
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 Core Algorithm Guidelines</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">Problem Class</th>
          <th style="padding: 6px 4px; font-weight: 700;">Map Strategy</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Valid Anagrams</td>
          <td style="padding: 6px 4px;">Frequencies counts matching: <code>Counter(s) == Counter(t)</code>.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Group Anagrams</td>
          <td style="padding: 6px 4px;">Sorted word string <code>"".join(sorted(s))</code> as map key. Value is a list of matching words.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Isomorphic Strings</td>
          <td style="padding: 6px 4px;">Two maps to track bidirectional mapping logic: s character mapped to t, t mapped to s.</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">Sliding Window Anagrams</td>
          <td style="padding: 6px 4px;">Slide window. Count current window frequencies. Add right character, drop left character count.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentHi = `<div style="font-family: sans-serif;">
  <h3 style="color: #0369a1; font-size: 15px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e0f2fe; padding-bottom: 6px; margin-top: 0;">📐 हैशिंग और एनेग्राम (STRINGS) पहचान ब्लूप्रिंट</h3>
  
  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #0369a1; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🔍 हैशिंग और एनेग्राम समस्याओं को कैसे पहचानें?</h4>
    <p style="margin: 0; font-size: 13px; color: #075985; line-height: 1.5;">
      हैशिंग और एनेग्राम पैटर्न्स का उपयोग तब करें जब स्ट्रिंग में अक्षरों की आवृत्तियों की तुलना करनी हो, क्रमपरिवर्तन (permutations) को समूहबद्ध करना हो, या एक-से-एक (one-to-one) कैरेक्टर मैपिंग करनी हो।
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <h4 style="color: #1e293b; font-weight: 700; margin: 0 0 8px 0; font-size: 13px;">💡 मुख्य नियम</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px 4px; font-weight: 700;">समस्या श्रेणी</th>
          <th style="padding: 6px 4px; font-weight: 700;">मानचित्रण रणनीति (Map Strategy)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">वैध एनेग्राम (Valid Anagram)</td>
          <td style="padding: 6px 4px;">आवृत्तियों की मिलान जांच: <code>Counter(s) == Counter(t)</code>।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">ग्रुप एनेग्राम्स</td>
          <td style="padding: 6px 4px;">सॉर्ट की हुई स्ट्रिंग <code>"".join(sorted(s))</code> को मैप की कुंजी (key) बनाएं।</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">आइसोमॉर्फिक स्ट्रिंग्स</td>
          <td style="padding: 6px 4px;">दोनों दिशाओं में एक-से-एक मैपिंग सुनिश्चित करने के लिए दो हैश मैप रखें।</td>
        </tr>
        <tr>
          <td style="padding: 6px 4px; font-weight: 600; color: #0284c7;">स्लाइडिंग विंडो एनेग्राम</td>
          <td style="padding: 6px 4px;">विंडो सरकाएं। वर्तमान विंडो आवृत्ति मापें। दायाँ कैरेक्टर जोड़ें, बायाँ हटाएँ।</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const parentBlueprintNote = {
  taskId: new mongoose.Types.ObjectId(parentTaskId),
  title: "Blueprint to Identify Hashing & Anagram String Problems",
  color: "#fef08a",
  isPinned: false,
  content: compressHtml(generateBilingualNote(parentTaskId, parentEn, parentHi)),
  tags: ["Hashing-Anagrams", "Design-Pattern", "Blueprint"]
};

// ----------------------------------------------------
// 2. Child Notes Content Definitions (Bilingual)
// ----------------------------------------------------
const rawNotes = [
  {
    taskId: "69e75062c05bf5f0580b810b",
    title: "Valid anagram Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Counter comparison)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Verify if character frequencies in both strings are identical. Using <code>Counter</code> in Python is clean.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1) (size of alphabet is 26)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return Counter(s) == Counter(t)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1:</b> Import Counter collections class.</li>
    <li><b>Line 2-3:</b> Class and function declaration.</li>
    <li><b>Line 4:</b> Directly compare character count frequencies of s and t.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Counter comparison)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">जांचें कि क्या दोनों स्ट्रिंग्स में अक्षरों की आवृत्ति समान है। पायथन में <code>Counter</code> का उपयोग सर्वोत्तम है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1) (26 वर्ण)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return Counter(s) == Counter(t)</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1:</b> Counter मॉड्यूल इम्पोर्ट करना।</li>
    <li><b>लाइन 2-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4:</b> दोनों स्ट्रिंग्स के अक्षरों की गणना की तुलना करके सीधे परिणाम लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75062c05bf5f0580b810d",
    title: "Group anagrams Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Sorted Word as Map Key)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Initialize a hash map. For each word, sort its letters to form a key. Insert word into the list corresponding to sorted key. Return map values.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N * L log L) where L is max word length | 🧠 Space: O(N * L)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        anagrams = defaultdict(list)
        for s in strs:
            key = "".join(sorted(s))
            anagrams[key].append(s)
        return list(anagrams.values())</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1:</b> Import defaultdict.</li>
    <li><b>Line 2-3:</b> Class and function declaration.</li>
    <li><b>Line 4:</b> Setup default dictionary of list type values.</li>
    <li><b>Line 5:</b> Loop string array elements.</li>
    <li><b>Line 6-7:</b> Sort letters of s to form the unique map key. Append s to key list.</li>
    <li><b>Line 8:</b> Return values array.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (सॉर्टेड शब्द कुंजी के रूप में)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">एक हैश मैप बनाएं। प्रत्येक शब्द के लिए उसके वर्णों को सॉर्ट करके कुंजी बनाएं। शब्द को उस सॉर्टेड कुंजी वाली लिस्ट में जोड़ें। अंत में मैप के मानों की लिस्ट लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N * L log L) | 🧠 स्थान: O(N * L)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        anagrams = defaultdict(list)
        for s in strs:
            key = "".join(sorted(s))
            anagrams[key].append(s)
        return list(anagrams.values())</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1:</b> defaultdict इम्पोर्ट करना।</li>
    <li><b>लाइन 2-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4:</b> खाली एनेग्राम समूह मैप (defaultdict) बनाना।</li>
    <li><b>लाइन 5:</b> स्ट्रिंग्स के एरे पर लूप चलाना।</li>
    <li><b>लाइन 6-7:</b> प्रत्येक स्ट्रिंग को सॉर्ट करके कुंजी बनाना, और शब्द को तदनुसार लिस्ट में जोड़ना।</li>
    <li><b>लाइन 8:</b> समूहबद्ध लिस्ट को परिणाम में लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75062c05bf5f0580b810f",
    title: "Find All Anagrams in a String Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Sliding Window Frequency Counts</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Maintain sliding window of size <code>len(p)</code>. Keep window frequency count map. Add right character, compare maps, and record matches. Remove left boundary character count to slide window.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1) (frequency map has max 26 characters)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        ns, np = len(s), len(p)
        if ns < np:
            return []
            
        p_count = Counter(p)
        s_count = Counter(s[:np - 1])
        ans = []
        
        for i in range(np - 1, ns):
            s_count[s[i]] += 1
            if s_count == p_count:
                ans.append(i - np + 1)
            left_char = s[i - np + 1]
            s_count[left_char] -= 1
            if s_count[left_char] == 0:
                del s_count[left_char]
                
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and function declaration.</li>
    <li><b>Line 4-6:</b> Return blank list if s is shorter than target window size.</li>
    <li><b>Line 8-10:</b> Count p occurrences. Init s_count window with first np-1 chars of s. Set start indices answer array.</li>
    <li><b>Line 12-15:</b> Loop. Add current character to count. If maps match, append window start index.</li>
    <li><b>Line 16-19:</b> Remove count of leftmost character to shift window. Delete key from map if count is 0.</li>
    <li><b>Line 21:</b> Return answer indices list.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 स्लाइडिंग विंडो फ्रीक्वेंसी मैप</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">आकार <code>len(p)</code> की स्लाइडिंग विंडो रखें। विंडो का फ्रीक्वेंसी मैप बनाए रखें। दायाँ अक्षर जोड़ें, तुलना करें, और इंडेक्स दर्ज करें। खिसकाने के लिए बायाँ अक्षर हटाएँ।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1) (26 वर्ण)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        ns, np = len(s), len(p)
        if ns < np:
            return []
            
        p_count = Counter(p)
        s_count = Counter(s[:np - 1])
        ans = []
        
        for i in range(np - 1, ns):
            s_count[s[i]] += 1
            if s_count == p_count:
                ans.append(i - np + 1)
            left_char = s[i - np + 1]
            s_count[left_char] -= 1
            if s_count[left_char] == 0:
                del s_count[left_char]
                
        return ans</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4-6:</b> यदि s की लंबाई p से कम है, तो खाली सूची लौटाना।</li>
    <li><b>लाइन 8-10:</b> p के अक्षरों की गणना करना, और s विंडो की शुरुआती गणना करना।</li>
    <li><b>लाइन 12-15:</b> स्लाइडिंग विंडो लूप: नया अक्षर गणना में जोड़ना, मैप मिलने पर शुरुआती इंडेक्स दर्ज करना।</li>
    <li><b>लाइन 16-19:</b> विंडो खिसकाने के लिए बाईं सीमा का अक्षर घटाना (शून्य होने पर हटाना)।</li>
    <li><b>लाइन 21:</b> परिणामी इंडेक्स लिस्ट लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75062c05bf5f0580b8113",
    title: "Minimum Number of Steps to Make Two Strings Anagram Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Positive Difference Sum)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies of s and t. Sum the positive differences of frequencies of characters in s vs t. The total sum is the minimum steps.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1) (alphabet size 26)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def minSteps(self, s: str, t: str) -> int:
        count_s = Counter(s)
        count_t = Counter(t)
        steps = 0
        for char, freq in count_s.items():
            if freq > count_t[char]:
                steps += freq - count_t[char]
        return steps</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and minSteps method signature.</li>
    <li><b>Line 4-5:</b> Count frequencies of both strings s and t.</li>
    <li><b>Line 6-9:</b> Loop s characters. If frequency in s is greater than t, add positive difference to steps.</li>
    <li><b>Line 10:</b> Return steps.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (सकारात्मक अंतर योग)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">s और t की आवृत्तियों को गिनें। s बनाम t में अक्षरों की आवृत्ति के केवल सकारात्मक अंतरों का योग करें। यही मान न्यूनतम चरण होगा।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1) (26 वर्ण)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def minSteps(self, s: str, t: str) -> int:
        count_s = Counter(s)
        count_t = Counter(t)
        steps = 0
        for char, freq in count_s.items():
            if freq > count_t[char]:
                steps += freq - count_t[char]
        return steps</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4-5:</b> दोनों स्ट्रिंग्स (s और t) के अक्षरों की आवृत्ति काउंटर मापना।</li>
    <li><b>लाइन 6-9:</b> s के अक्षरों पर लूप चलाना। यदि s में किसी अक्षर की आवृत्ति t से अधिक है, तो अंतर को चरणों (steps) में जोड़ना।</li>
    <li><b>लाइन 10:</b> कुल चरणों (steps) को लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75062c05bf5f0580b8115",
    title: "Ransom note Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Magazine frequency decrements)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies of characters in magazine. Loop ransomNote characters: decrement count. If count becomes < 0, return False.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N + M) | 🧠 Space: O(1) (max 26 unique character counts)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        count = Counter(magazine)
        for char in ransomNote:
            if count[char] <= 0:
                return False
            count[char] -= 1
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and canConstruct method parameters.</li>
    <li><b>Line 4:</b> Count character frequencies in magazine source.</li>
    <li><b>Line 5-8:</b> Loop ransomNote characters. If character is exhausted or missing, return False.</li>
    <li><b>Line 9:</b> Decrement frequency count.</li>
    <li><b>Line 10:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Magazine Counter Decrement)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">magazine के अक्षरों की आवृत्ति गिनें। ransomNote के अक्षरों पर लूप चलाएं: आवृत्ति घटाएं। यदि घटाने पर मान < 0 हो जाए, तो सीधे False लौटाएं।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N + M) | 🧠 स्थान: O(1) (26 वर्ण)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        count = Counter(magazine)
        for char in ransomNote:
            if count[char] <= 0:
                return False
            count[char] -= 1
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4:</b> magazine के अक्षरों का आवृत्ति काउंटर मापना।</li>
    <li><b>लाइन 5-8:</b> ransomNote के अक्षरों पर लूप: यदि वह अक्षर उपलब्ध नहीं है (count <= 0), तो False लौटाना।</li>
    <li><b>लाइन 9:</b> आवृत्ति 1 घटाना (ताकि दोबारा उपयोग न हो सके)।</li>
    <li><b>लाइन 10:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75062c05bf5f0580b8117",
    title: "Isomorphic Strings Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Bidirectional Character Maps</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Characters in s must map uniquely to t, and vice-versa. Keep two maps: s_to_t and t_to_s. Verify that character mapping values are unique and non-overlapping.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(1) (26 characters alphabet size)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        map_s_to_t = {}
        map_t_to_s = {}
        for char_s, char_t in zip(s, t):
            if char_s in map_s_to_t:
                if map_s_to_t[char_s] != char_t:
                    return False
            else:
                map_s_to_t[char_s] = char_t
                
            if char_t in map_t_to_s:
                if map_t_to_s[char_t] != char_s:
                    return False
            else:
                map_t_to_s[char_t] = char_s
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function declaration.</li>
    <li><b>Line 3-4:</b> Bidirectional hash maps mapping s to t, and t to s.</li>
    <li><b>Line 5:</b> Iterate both strings in parallel using zip.</li>
    <li><b>Line 6-10:</b> If char_s is already mapped, verify matching. Else, insert.</li>
    <li><b>Line 12-17:</b> Verify same mapped logic for char_t. Return False on clash.</li>
    <li><b>Line 18:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 दोतरफा हैश मैपिंग नियम</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">s के वर्णों का t से और t के वर्णों का s से अनूठा (unique) संबंध होना चाहिए। दो मैप (s_to_t, t_to_s) रखें और परस्पर विरोधी मानों की जांच करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(1) (26 वर्ण)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        map_s_to_t = {}
        map_t_to_s = {}
        for char_s, char_t in zip(s, t):
            if char_s in map_s_to_t:
                if map_s_to_t[char_s] != char_t:
                    return False
            else:
                map_s_to_t[char_s] = char_t
                
            if char_t in map_t_to_s:
                if map_t_to_s[char_t] != char_s:
                    return False
            else:
                map_t_to_s[char_t] = char_s
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-4:</b> दो खाली मैपिंग डिक्शनरी स्थापित करना।</li>
    <li><b>लाइन 5:</b> <code>zip()</code> द्वारा दोनों स्ट्रिंग्स के अक्षरों पर समानांतर रूप से लूप चलाना।</li>
    <li><b>लाइन 6-10:</b> यदि s का अक्षर पहले मैप किया जा चुका है, तो मिलान जांचना। अन्यथा मैप में डालना।</li>
    <li><b>लाइन 12-17:</b> यही अनूठी मैपिंग जांच t के अक्षर के लिए भी लागू करना।</li>
    <li><b>लाइन 18:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75062c05bf5f0580b8119",
    title: "Word pattern Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 Char to Word Map and Word to Char Map</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Split words list in s. Length must match pattern size. Verify bijection using two hash maps: mapping pattern characters to words and words to pattern characters.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ Time: O(N) | 🧠 Space: O(N) where N is number of words</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        words = s.split()
        if len(pattern) != len(words):
            return False
            
        map_char = {}
        map_word = {}
        for char, word in zip(pattern, words):
            if char in map_char:
                if map_char[char] != word:
                    return False
            else:
                map_char[char] = word
                
            if word in map_word:
                if map_word[word] != char:
                    return False
            else:
                map_word[word] = char
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-2:</b> Class and function declaration.</li>
    <li><b>Line 3-5:</b> Split s into words. If lengths do not match, return False.</li>
    <li><b>Line 7-8:</b> Maps: map_char (char -> word), map_word (word -> char).</li>
    <li><b>Line 9-21:</b> Parallel loop using zip. Verify bi-directional mappings are unique and match. Return False if mapping conflict.</li>
    <li><b>Line 22:</b> Return True.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🧠 कैरेक्टर-शब्द और शब्द-कैरेक्टर दोतरफा मैपिंग</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">s को शब्दों में विभाजित करें। लंबाई पैटर्न आकार के समान होनी चाहिए। दो हैश मैप का उपयोग करके द्विपक्षीय (bijection) संबंध सत्यापित करें।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #7e22ce;">⏱️ समय: O(N) | 🧠 स्थान: O(N) (शब्दों की संख्या)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        words = s.split()
        if len(pattern) != len(words):
            return False
            
        map_char = {}
        map_word = {}
        for char, word in zip(pattern, words):
            if char in map_char:
                if map_char[char] != word:
                    return False
            else:
                map_char[char] = word
                
            if word in map_word:
                if map_word[word] != char:
                    return False
            else:
                map_word[word] = char
        return True</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-2:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 3-5:</b> s को विभाजित करके शब्दों की सूची बनाना, लंबाई मेल न खाने पर False लौटाना।</li>
    <li><b>लाइन 7-8:</b> दो खाली मानचित्र डिक्शनरी (map_char, map_word) घोषित करना।</li>
    <li><b>लाइन 9-21:</b> zip द्वारा लूप चलाना: यह सुनिश्चित करना कि कोई अक्षर किसी अन्य शब्द पर, या कोई शब्द किसी अन्य अक्षर पर मैप न हो।</li>
    <li><b>लाइन 22:</b> परिणाम True लौटाना।</li>
  </ul>
</div>`
  },
  {
    taskId: "69e75062c05bf5f0580b811d",
    title: "First Unique Character in a String Revision Notes",
    color: "#fef08a",
    en: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 Revision Notes</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 Optimal Approach (Two Pass Frequency count)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">Count frequencies of characters in string. Loop s character indices: return first index where frequency count is exactly 1.</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ Time: O(N) | 🧠 Space: O(1) (max 26 character records)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def firstUniqChar(self, s: str) -> int:
        count = Counter(s)
        for i, char in enumerate(s):
            if count[char] == 1:
                return i
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 Code Line-by-Line Explanation</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>Line 1-3:</b> Class and function declaration.</li>
    <li><b>Line 4:</b> Count frequencies using Counter.</li>
    <li><b>Line 5-7:</b> Loop string indices. If count of current character is 1, return index.</li>
    <li><b>Line 8:</b> Return -1.</li>
  </ul>
</div>`,
    hi: `<div style="font-family: sans-serif;">
  <h3 style="color: #1e293b; font-size: 15px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">💡 मुख्य संशोधन पाठ</h3>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 13px;">🟢 अनुकूलतम दृष्टिकोण (Two Pass Counter)</h4>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">स्ट्रिंग के अक्षरों की आवृत्ति गिनें। स्ट्रिंग पर लूप चलाकर पहले ऐसे अक्षर का इंडेक्स लौटाएं जिसकी आवृत्ति ठीक 1 है।</p>
    <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #15803d;">⏱️ समय: O(N) | 🧠 स्थान: O(1) (26 वर्ण)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 14px; font-weight: 800; margin-bottom: 8px;">🐍 पायथन 3 कोड</h3>
  <pre class="ql-syntax" spellcheck="false">from collections import Counter

class Solution:
    def firstUniqChar(self, s: str) -> int:
        count = Counter(s)
        for i, char in enumerate(s):
            if count[char] == 1:
                return i
        return -1</pre>
  <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 4px;">📝 कोड की हर लाइन की व्याख्या</h3>
  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.5;">
    <li><b>लाइन 1-3:</b> क्लास और मुख्य फ़ंक्शन की घोषणा।</li>
    <li><b>लाइन 4:</b> अक्षरों की आवृत्तियाँ गिनना।</li>
    <li><b>लाइन 5-7:</b> इंडेक्स के साथ लूप चलाना: अनोखा अक्षर (frequency == 1) मिलने पर इंडेक्स लौटाना।</li>
    <li><b>लाइन 8:</b> कोई अनोखा अक्षर न मिलने पर -1 लौटाना।</li>
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
    
    console.log("Cleaning up old seeded Hashing & Anagram (STRINGS) notes...");
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
        tags: ["Hashing-Anagrams", "Revision"],
        createdAt: now,
        updatedAt: now
      };
      notesToInsert.push(note);
    }

    console.log(`Inserting ${notesToInsert.length} detailed Hashing & Anagram (STRINGS) notes...`);
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
