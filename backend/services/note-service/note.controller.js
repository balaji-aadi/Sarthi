import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Note } from "../../models/note.model.js";
import axios from "axios";

const noteController = {};

/**
 * Get all notes for the authenticated user
 */
noteController.getNotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notes = await Note.find({ userId }).sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notes, "Notes retrieved successfully")
  );
});

/**
 * Create a new sticky note
 */
noteController.createNote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { content, imageUrl, color, position, size, isPinned, title, tags } = req.body;

  const newNote = await Note.create({
    userId,
    content: content || "",
    imageUrl: imageUrl || "",
    color: color || "#fef08a",
    position: position || { x: 100, y: 100 },
    size: size || { width: 250, height: 180 },
    isPinned: isPinned || false,
    title: title || "",
    tags: tags || []
  });

  return res.status(201).json(
    new ApiResponse(201, newNote, "Note created successfully")
  );
});

/**
 * Update an existing sticky note
 */
noteController.updateNote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    throw new ApiError(404, "Note not found or unauthorized");
  }

  // Update properties if provided in body
  const fields = ["content", "imageUrl", "color", "position", "size", "isPinned", "title", "tags"];
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      note[field] = req.body[field];
    }
  });

  await note.save();

  return res.status(200).json(
    new ApiResponse(200, note, "Note updated successfully")
  );
});

/**
 * Delete a sticky note
 */
noteController.deleteNote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const note = await Note.findOneAndDelete({ _id: id, userId });
  if (!note) {
    throw new ApiError(404, "Note not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Note deleted successfully")
  );
});

/**
 * AI - Enhance an individual note (expand, summarize, checklist, clarify)
 */
noteController.aiEnhance = asyncHandler(async (req, res) => {
  const { content, action } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!content) {
    throw new ApiError(400, "Content is required for AI enhancement");
  }
  if (!apiKey) {
    throw new ApiError(500, "Groq API key is not configured on backend server");
  }

  const prompt = `
Task: Rewrite the following note content according to the requested action: "${action || 'clarify'}".
Current Note Content: "${content}"

Requirements:
- If action is "expand", add detailed subtasks or context (maximum 60 words).
- If action is "summarize", write a punchy, ultra-concise summary (maximum 20 words).
- If action is "checklist", format it as a clean markdown todo list (e.g., "- [ ] Task item").
- If action is "clarify", improve grammar, styling, and professionalism.

Return ONLY the plain text of the updated note content. Do not write any introduction, explanation, markdown headers, or JSON wrapping. Just return the raw text.
`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const rewrittenText = response.data?.choices?.[0]?.message?.content?.trim() || content;

    return res.status(200).json(
      new ApiResponse(200, { enhancedContent: rewrittenText }, "Content enhanced successfully")
    );
  } catch (error) {
    console.error("Groq Enhance Error:", error.response?.data || error.message);
    throw new ApiError(500, `AI enhancement failed: ${error.message}`);
  }
});

/**
 * AI - Suggest missing notes on the board based on a user requirement
 */
noteController.aiSuggest = asyncHandler(async (req, res) => {
  const { notes, requirement } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!requirement) {
    throw new ApiError(400, "Requirement description is required");
  }
  if (!apiKey) {
    throw new ApiError(500, "Groq API key is not configured on backend server");
  }

  const existingNotesSummary = notes && notes.length > 0 
    ? notes.map((n, i) => `Note ${i+1}: Content: "${n.content}", Position: {x: ${n.position?.x || 100}, y: ${n.position?.y || 100}}`).join("\n")
    : "No notes currently exist on the board.";

  const prompt = `
You are an expert product and coding assistant. The user is managing a whiteboard layout of sticky notes for a project.
The user is working on the following overall requirement:
"${requirement}"

Here are the current sticky notes on their board:
${existingNotesSummary}

Task:
1. Review the current sticky notes and identify missing tasks, security measures, optimizations, testing requirements, or documentation steps necessary to build this project or feature fully.
2. Formulate a brief, helpful recommendation summary (1-2 sentences) of what they are missing.
3. Suggest between 3 and 5 new sticky notes that should be added to the board. For each suggested note:
   - Provide a concise text content (maximum 15-20 words).
   - Suggest a coordinate placement (x, y) that is offset from existing notes to avoid overlapping. Use a grid layout around where other notes are, or starting around x: 100, y: 100 if board is empty. Space notes at least 300px apart horizontally or vertically.
   - Suggest a color hex representing one of these pastel colors:
     - Pastel Yellow: "#fef08a"
     - Pastel Blue: "#bfdbfe"
     - Pastel Green: "#bbf7d0"
     - Pastel Pink: "#fbcfe8"
     - Pastel Purple: "#e9d5ff"

You MUST respond ONLY with a valid JSON object matching this schema. Do not output any markdown formatting other than raw JSON.
JSON Schema:
{
  "recommendation": "Brief explanation summarizing the gaps identified.",
  "suggestedNotes": [
    {
      "content": "Concise text for the suggested sticky note",
      "position": { "x": number, "y": number },
      "color": "hex color string"
    }
  ]
}
`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_object"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    let responseText = response.data?.choices?.[0]?.message?.content || "";
    
    // Clean up potential markdown formatting wrapping the JSON
    if (responseText.includes("```json")) {
      responseText = responseText.split("```json")[1].split("```")[0];
    } else if (responseText.includes("```")) {
      responseText = responseText.split("```")[1].split("```")[0];
    }

    const result = JSON.parse(responseText.trim());

    return res.status(200).json(
      new ApiResponse(200, result, "AI suggestions fetched successfully")
    );
  } catch (error) {
    console.error("Groq Suggest Error:", error.response?.data || error.message);
    throw new ApiError(500, `AI suggestions failed: ${error.message}`);
  }
});

export default noteController;
