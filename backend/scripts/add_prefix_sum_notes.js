import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// HTML Templates for Prefix Sum notes
const parentBlueprintHTML = `<div style="font-family: inherit;">
  <h3 style="color: #6b21a8; font-size: 1.25rem; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #e9d5ff; padding-bottom: 6px;">📐 Prefix Sum Identification Blueprint</h3>
  <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
    <h4 style="color: #7e22ce; font-weight: 750; margin: 0 0 6px 0; font-size: 1rem;">🔍 How to Recognize Prefix Sum Problems?</h4>
    <p style="margin: 0 0 8px 0; font-size: 0.875rem; color: #4b5563; line-height: 1.5;">You should think of Prefix Sum when the problem involves:</p>
    <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem; color: #4b5563; line-height: 1.5;">
      <li>Repeated range sum queries on an array that doesn't change (static array).</li>
      <li>Finding subarrays that sum to a target value <code>K</code>, or are divisible by <code>K</code>.</li>
      <li>Range update operations (Difference Array technique).</li>
      <li>Continuous/cumulative metrics (like product, frequency, parity counts).</li>
    </ul>
  </div>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
    <h4 style="color: #1e293b; font-weight: 750; margin: 0 0 8px 0; font-size: 0.95rem;">💡 Core Mathematical Formulas</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #334155;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 6px; font-weight: 700;">Problem Type</th>
          <th style="padding: 6px; font-weight: 700;">Formula / Key Idea</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px; font-weight: 600; color: #4f46e5;">Range Sum Query [L, R]</td>
          <td style="padding: 6px;"><code>Sum(L, R) = Prefix[R + 1] - Prefix[L]</code></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px; font-weight: 600; color: #4f46e5;">Subarray Sum = K</td>
          <td style="padding: 6px;">Find if <code>Prefix[R] - Prefix[L-1] = K</code>, tracking <code>Prefix[R] - K</code> in a Hash Map.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px; font-weight: 600; color: #4f46e5;">Subarray Sum Divisible by K</td>
          <td style="padding: 6px;"><code>Prefix[R] % K == Prefix[L-1] % K</code> (normalizing negative remainders).</td>
        </tr>
        <tr>
          <td style="padding: 6px; font-weight: 600; color: #4f46e5;">Range Updates [L, R] by V</td>
          <td style="padding: 6px;">Difference Array: <code>Diff[L] += V</code> and <code>Diff[R + 1] -= V</code>. Retrieve final array using prefix sum.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;

const notesData = [
  {
    taskId: "6a49011bb80dc9d6090441a8", // Range sum query
    title: "Range Sum Query - Prefix Sum",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Iterate through the array from the left index to the right index and calculate the sum for each query.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(N) per query | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Prefix Sum)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Precompute a prefix sum array of size <code>N + 1</code>. The sum of range <code>[L, R]</code> is calculated instantly in O(1) time as <code>prefix[R + 1] - prefix[L]</code>.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) Preprocessing, O(1) per query | 🧠 Space Complexity: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">NumArray</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">__init__</span>(self, nums: List[int]):
        self.prefix = [<span style="color: #f472b6;">0</span>] * (len(nums) + <span style="color: #f472b6;">1</span>)
        <span style="color: #38bdf8;">for</span> i <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">range</span>(len(nums)):
            self.prefix[i + <span style="color: #f472b6;">1</span>] = self.prefix[i] + nums[i]

    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">sumRange</span>(self, left: int, right: int) -> int:
        <span style="color: #38bdf8;">return</span> self.prefix[right + <span style="color: #f472b6;">1</span>] - self.prefix[left]</pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441a9", // Subarray sum equals K
    title: "Subarray Sum Equals K",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Generate all possible subarrays and find their sums using nested loops.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(N²) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Prefix Sum + Hash Map)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Track prefix sums in a hash map. If <code>curr_sum - K</code> exists in the map, it means there exists a subarray with sum <code>K</code>. Update the count by its frequency.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) | 🧠 Space Complexity: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">subarraySum</span>(self, nums: List[int], k: int) -> int:
        count = <span style="color: #f472b6;">0</span>
        curr_sum = <span style="color: #f472b6;">0</span>
        prefix_sums = {<span style="color: #f472b6;">0</span>: <span style="color: #f472b6;">1</span>}
        <span style="color: #38bdf8;">for</span> num <span style="color: #38bdf8;">in</span> nums:
            curr_sum += num
            <span style="color: #38bdf8;">if</span> curr_sum - k <span style="color: #38bdf8;">in</span> prefix_sums:
                count += prefix_sums[curr_sum - k]
            prefix_sums[curr_sum] = prefix_sums.get(curr_sum, <span style="color: #f472b6;">0</span>) + <span style="color: #f472b6;">1</span>
        <span style="color: #38bdf8;">return</span> count</pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441aa", // Continuous subarray sum
    title: "Continuous Subarray Sum",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Check all subarrays of size >= 2 and see if their sum is a multiple of K.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(N²) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Prefix Sum Modulo Map)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Store the first index of <code>curr_sum % k</code>. If the same remainder is seen again at index <code>i</code> and <code>i - prev_index >= 2</code>, a valid subarray exists.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) | 🧠 Space Complexity: O(min(N, K))</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">checkSubarraySum</span>(self, nums: List[int], k: int) -> bool:
        rem_map = {<span style="color: #f472b6;">0</span>: -<span style="color: #f472b6;">1</span>}
        curr_sum = <span style="color: #f472b6;">0</span>
        <span style="color: #38bdf8;">for</span> i, num <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">enumerate</span>(nums):
            curr_sum += num
            rem = curr_sum % k <span style="color: #38bdf8;">if</span> k != <span style="color: #f472b6;">0</span> <span style="color: #38bdf8;">else</span> curr_sum
            <span style="color: #38bdf8;">if</span> rem <span style="color: #38bdf8;">in</span> rem_map:
                <span style="color: #38bdf8;">if</span> i - rem_map[rem] >= <span style="color: #f472b6;">2</span>:
                    <span style="color: #38bdf8;">return</span> <span style="color: #38bdf8;">True</span>
            <span style="color: #38bdf8;">else:</span>
                rem_map[rem] = i
        <span style="color: #38bdf8;">return</span> <span style="color: #38bdf8;">False</span></pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441ab", // Subarrays divisible by K
    title: "Subarrays Divisible by K",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Check all subarray sums and see if they are divisible by K.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(N²) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Remainder Frequency Hash Map)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Store frequencies of <code>curr_sum % k</code>. Normalize negative remainders. If a remainder has been seen, add its frequency to the count.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) | 🧠 Space Complexity: O(K)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">subarraysDivByK</span>(self, nums: List[int], k: int) -> int:
        count = <span style="color: #f472b6;">0</span>
        curr_sum = <span style="color: #f472b6;">0</span>
        rem_freq = {<span style="color: #f472b6;">0</span>: <span style="color: #f472b6;">1</span>}
        <span style="color: #38bdf8;">for</span> num <span style="color: #38bdf8;">in</span> nums:
            curr_sum += num
            rem = curr_sum % k
            <span style="color: #38bdf8;">if</span> rem < <span style="color: #f472b6;">0</span>:
                rem += k
            <span style="color: #38bdf8;">if</span> rem <span style="color: #38bdf8;">in</span> rem_freq:
                count += rem_freq[rem]
            rem_freq[rem] = rem_freq.get(rem, <span style="color: #f472b6;">0</span>) + <span style="color: #f472b6;">1</span>
        <span style="color: #38bdf8;">return</span> count</pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441ac", // Count subarrays with equal 0 and 1
    title: "Count Subarrays with Equal 0 and 1",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Check all subarrays and count number of 0s and 1s.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(N²) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Replace 0 with -1 + Hash Map)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Treat <code>0</code> as <code>-1</code>. The problem becomes finding the number of subarrays that sum to 0. Track running prefix sum frequencies in a map.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) | 🧠 Space Complexity: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">findMaxLengthSubarrays</span>(self, nums: List[int]) -> int:
        count = <span style="color: #f472b6;">0</span>
        curr_sum = <span style="color: #f472b6;">0</span>
        prefix_sums = {<span style="color: #f472b6;">0</span>: <span style="color: #f472b6;">1</span>}
        <span style="color: #38bdf8;">for</span> num <span style="color: #38bdf8;">in</span> nums:
            curr_sum += <span style="color: #f472b6;">1</span> <span style="color: #38bdf8;">if</span> num == <span style="color: #f472b6;">1</span> <span style="color: #38bdf8;">else</span> -<span style="color: #f472b6;">1</span>
            <span style="color: #38bdf8;">if</span> curr_sum <span style="color: #38bdf8;">in</span> prefix_sums:
                count += prefix_sums[curr_sum]
            prefix_sums[curr_sum] = prefix_sums.get(curr_sum, <span style="color: #f472b6;">0</span>) + <span style="color: #f472b6;">1</span>
        <span style="color: #38bdf8;">return</span> count</pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441ad", // Maximum size subarray sum = K
    title: "Max Size Subarray Sum Equals K",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Check all subarray sums and find the max length among those which sum to K.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(N²) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (First Occurrence Map)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Store the first index of each prefix sum. If <code>curr_sum - K</code> has been seen, calculate length. Keep only the earliest index for each prefix sum to maximize length.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) | 🧠 Space Complexity: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">maxSubArrayLen</span>(self, nums: List[int], k: int) -> int:
        max_len = <span style="color: #f472b6;">0</span>
        curr_sum = <span style="color: #f472b6;">0</span>
        first_occur = {<span style="color: #f472b6;">0</span>: -<span style="color: #f472b6;">1</span>}
        <span style="color: #38bdf8;">for</span> i, num <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">enumerate</span>(nums):
            curr_sum += num
            <span style="color: #38bdf8;">if</span> curr_sum - k <span style="color: #38bdf8;">in</span> first_occur:
                max_len = <span style="color: #fbbf24;">max</span>(max_len, i - first_occur[curr_sum - k])
            <span style="color: #38bdf8;">if</span> curr_sum <span style="color: #38bdf8;">not in</span> first_occur:
                first_occur[curr_sum] = i
        <span style="color: #38bdf8;">return</span> max_len</pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441ae", // Difference array basics
    title: "Difference Array Basics",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">For each range update, iterate through all indices from <code>L</code> to <code>R</code> and add value.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(Q × N) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Difference Array)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Represent array in terms of adjacent differences: <code>Diff[i] = A[i] - A[i-1]</code>. To update <code>[L, R]</code> with <code>V</code>: perform <code>Diff[L] += V</code> and <code>Diff[R+1] -= V</code>. Reconstruct using Prefix Sum.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(1) per update, O(N) retrieve | 🧠 Space Complexity: O(N)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">DifferenceArray</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">__init__</span>(self, arr: List[int]):
        self.diff = [<span style="color: #f472b6;">0</span>] * len(arr)
        self.diff[<span style="color: #f472b6;">0</span>] = arr[<span style="color: #f472b6;">0</span>]
        <span style="color: #38bdf8;">for</span> i <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">range</span>(<span style="color: #f472b6;">1</span>, len(arr)):
            self.diff[i] = arr[i] - arr[i-<span style="color: #f472b6;">1</span>]

    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">update</span>(self, l: int, r: int, val: int):
        self.diff[l] += val
        <span style="color: #38bdf8;">if</span> r + <span style="color: #f472b6;">1</span> < <span style="color: #fbbf24;">len</span>(self.diff):
            self.diff[r + <span style="color: #f472b6;">1</span>] -= val

    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">get_result</span>(self) -> List[int]:
        res = [<span style="color: #f472b6;">0</span>] * <span style="color: #fbbf24;">len</span>(self.diff)
        res[<span style="color: #f472b6;">0</span>] = self.diff[<span style="color: #f472b6;">0</span>]
        <span style="color: #38bdf8;">for</span> i <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">range</span>(<span style="color: #f472b6;">1</span>, <span style="color: #fbbf24;">len</span>(self.diff)):
            res[i] = res[i-<span style="color: #f472b6;">1</span>] + self.diff[i]
        <span style="color: #38bdf8;">return</span> res</pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441af", // Car pooling
    title: "Car Pooling - Diff Array",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Allocate passenger array for all possible stops. Loop through each trip and increment passenger counts. Check if count exceeds capacity.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(Trips × Distance) | 🧠 Space Complexity: O(Distance)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Difference Array Timeline)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Track passenger count changes at each stop: <code>changes[start] += num</code> and <code>changes[end] -= num</code>. Take a running prefix sum of passenger count changes to see if load exceeds capacity.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) where N is number of trips | 🧠 Space Complexity: O(Distance)</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">carPooling</span>(self, trips: List[List[int]], capacity: int) -> bool:
        timeline = [<span style="color: #f472b6;">0</span>] * <span style="color: #f472b6;">1001</span>
        <span style="color: #38bdf8;">for</span> num, start, end <span style="color: #38bdf8;">in</span> trips:
            timeline[start] += num
            timeline[end] -= num
            
        curr_passengers = <span style="color: #f472b6;">0</span>
        <span style="color: #38bdf8;">for</span> change <span style="color: #38bdf8;">in</span> timeline:
            curr_passengers += change
            <span style="color: #38bdf8;">if</span> curr_passengers > capacity:
                <span style="color: #38bdf8;">return</span> <span style="color: #38bdf8;">False</span>
        <span style="color: #38bdf8;">return</span> <span style="color: #38bdf8;">True</span></pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441b0", // Range addition
    title: "Range Addition - Diff Array",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">For each update query <code>[start, end, val]</code>, loop through the indices and add <code>val</code>.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(Q × N) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Difference Array Updates)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Increment at start index, and decrement at end+1 index: <code>arr[start] += val</code> and <code>arr[end + 1] -= val</code>. Rebuild the final array using a prefix sum.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(Q + N) | 🧠 Space Complexity: O(1) auxiliary space</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">getModifiedArray</span>(self, length: int, updates: List[List[int]]) -> List[int]:
        res = [<span style="color: #f472b6;">0</span>] * length
        <span style="color: #38bdf8;">for</span> start, end, val <span style="color: #38bdf8;">in</span> updates:
            res[start] += val
            <span style="color: #38bdf8;">if</span> end + <span style="color: #f472b6;">1</span> < length:
                res[end + <span style="color: #f472b6;">1</span>] -= val
                
        <span style="color: #38bdf8;">for</span> i <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">range</span>(<span style="color: #f472b6;">1</span>, length):
            res[i] += res[i-<span style="color: #f472b6;">1</span>]
        <span style="color: #38bdf8;">return</span> res</pre>
</div>`
  },
  {
    taskId: "6a49011bb80dc9d6090441b1", // Product of array except self
    title: "Product of Array Except Self",
    color: "#fef08a",
    isPinned: false,
    content: `<div style="font-family: inherit;">
  <h3 style="color: #1e293b; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">💡 Revision Notes</h3>
  <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #991b1b; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🔴 Brute Force Approach</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Calculate prefix products and suffix products using nested loops for each element.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444;">⏱️ Time Complexity: O(N²) | 🧠 Space Complexity: O(1)</div>
  </div>
  <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
    <h4 style="color: #166534; font-weight: 750; margin: 0 0 6px 0; font-size: 0.95rem;">🟢 Optimal Approach (Prefix & Suffix Accumulator)</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Initialize output array with prefix products from left to right. Then traverse backwards from right to left, maintaining a running suffix product accumulator and multiplying it with the prefix products.</p>
    <div style="margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #15803d;">⏱️ Time Complexity: O(N) | 🧠 Space Complexity: O(1) auxiliary space</div>
  </div>
  <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">🐍 Python 3 Code</h3>
  <pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.5; overflow-x: auto; margin: 0;">
<span style="color: #38bdf8;">class</span> <span style="color: #fbbf24;">Solution</span>:
    <span style="color: #38bdf8;">def</span> <span style="color: #fbbf24;">productExceptSelf</span>(self, nums: List[int]) -> List[int]:
        n = <span style="color: #fbbf24;">len</span>(nums)
        res = [<span style="color: #f472b6;">1</span>] * n
        <span style="color: #38bdf8;">for</span> i <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">range</span>(<span style="color: #f472b6;">1</span>, n):
            res[i] = res[i-<span style="color: #f472b6;">1</span>] * nums[i-<span style="color: #f472b6;">1</span>]
            
        right_prod = <span style="color: #f472b6;">1</span>
        <span style="color: #38bdf8;">for</span> i <span style="color: #38bdf8;">in</span> <span style="color: #fbbf24;">range</span>(n-<span style="color: #f472b6;">1</span>, -<span style="color: #f472b6;">1</span>, -<span style="color: #f472b6;">1</span>):
            res[i] *= right_prod
            right_prod *= nums[i]
        <span style="color: #38bdf8;">return</span> res</pre>
</div>`
  }
];

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const Note = mongoose.connection.collection('notes');
    const userId = new mongoose.Types.ObjectId("6993047f16e85ff3e4efd9a3");
    const parentTaskId = new mongoose.Types.ObjectId("69e7504fc05bf5f0580b802d");

    // 1. Insert Parent Blueprint Note if it doesn't exist
    const existingParentNote = await Note.findOne({ title: "Blueprint to Identify Prefix Sum Problems", userId });
    if (!existingParentNote) {
      const parentNoteDoc = {
        userId,
        title: "Blueprint to Identify Prefix Sum Problems",
        content: parentBlueprintHTML,
        imageUrl: "",
        color: "#d8b4fe", // purple
        position: { x: 300, y: 1500 },
        size: { width: 350, height: 280 },
        isPinned: true,
        tags: ["LOCKED"],
        taskId: parentTaskId,
        taskIds: [parentTaskId],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await Note.insertOne(parentNoteDoc);
      console.log(`Inserted parent blueprint note. ID: ${result.insertedId}`);
    } else {
      console.log("Parent blueprint note already exists.");
    }

    // 2. Insert Child Notes if they don't exist
    let insertedCount = 0;
    for (const note of notesData) {
      const childTaskId = new mongoose.Types.ObjectId(note.taskId);
      const existingChildNote = await Note.findOne({ taskId: childTaskId, userId });
      if (!existingChildNote) {
        const childNoteDoc = {
          userId,
          title: note.title,
          content: note.content,
          imageUrl: "",
          color: note.color,
          position: { x: 250 + insertedCount * 300, y: 1900 },
          size: { width: 380, height: 350 },
          isPinned: false,
          tags: [],
          taskId: childTaskId,
          taskIds: [childTaskId],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await Note.insertOne(childNoteDoc);
        console.log(`Inserted child note for taskId: ${note.taskId}. ID: ${result.insertedId}`);
        insertedCount++;
      } else {
        console.log(`Child note for taskId ${note.taskId} already exists.`);
      }
    }

    console.log(`Seeding completed. Inserted ${insertedCount} child notes.`);
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

run();
