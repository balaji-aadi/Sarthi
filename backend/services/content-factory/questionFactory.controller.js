import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { questionFactoryService } from './questionFactory.service.js';

export const generateProblemDraft = asyncHandler(async (req, res) => {
  const { pattern, difficulty, directives } = req.body;
  const userId = req.user?._id || null;

  if (!pattern) {
    throw new ApiError(400, "Algorithmic pattern (e.g. 'Sliding Window', 'Two Pointers') is required.");
  }

  const draft = await questionFactoryService.generateDraft({
    pattern,
    difficulty: difficulty || 'Medium',
    directives: directives || '',
    userId
  });

  return res.status(201).json(
    new ApiResponse(201, draft, "DSA problem draft generated and validated successfully")
  );
});

export const getDrafts = asyncHandler(async (req, res) => {
  const { page, limit, status, difficulty } = req.query;
  const result = await questionFactoryService.getDrafts({ page, limit, status, difficulty });

  return res.status(200).json(
    new ApiResponse(200, result, "Question Factory drafts retrieved successfully")
  );
});

export const getDraftById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const draft = await questionFactoryService.getDraftById(id);

  return res.status(200).json(
    new ApiResponse(200, draft, "Draft details retrieved successfully")
  );
});

export const validateDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedDraft = await questionFactoryService.revalidateDraft(id);

  return res.status(200).json(
    new ApiResponse(200, validatedDraft, "Draft revalidated successfully")
  );
});

export const approveDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const reviewedBy = req.user?._id || null;

  const publishedProblem = await questionFactoryService.approveDraft(id, {
    reviewedBy,
    adminNotes
  });

  return res.status(200).json(
    new ApiResponse(200, publishedProblem, "Draft problem approved and published to Question Bank successfully")
  );
});

export const rejectDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const reviewedBy = req.user?._id || null;

  const rejectedProblem = await questionFactoryService.rejectDraft(id, {
    reviewedBy,
    reason
  });

  return res.status(200).json(
    new ApiResponse(200, rejectedProblem, "Draft problem rejected and archived successfully")
  );
});
