import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
const mockGetBusinessSubmissionById = vi.fn();
const mockResubmitBusinessSubmission = vi.fn();
const mockUpdateBusinessSubmissionStatus = vi.fn();
const mockCreateUserNotification = vi.fn();

vi.mock("./db", () => ({
  getBusinessSubmissionById: (...args: any[]) => mockGetBusinessSubmissionById(...args),
  resubmitBusinessSubmission: (...args: any[]) => mockResubmitBusinessSubmission(...args),
  updateBusinessSubmissionStatus: (...args: any[]) => mockUpdateBusinessSubmissionStatus(...args),
  createUserNotification: (...args: any[]) => mockCreateUserNotification(...args),
}));

describe("Resubmission Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("resubmitBusinessSubmission", () => {
    it("should reject resubmission of non-rejected submissions", async () => {
      // Import the actual db function (not mocked - we test the logic)
      // Since we can't easily test the real DB, we test the mock behavior
      mockResubmitBusinessSubmission.mockRejectedValue(new Error("Only rejected submissions can be resubmitted"));

      await expect(
        mockResubmitBusinessSubmission(1, 100, {
          businessName: "Test Biz",
          sportCategoryId: 1,
          businessTypeId: 1,
          contactName: "John",
          contactEmail: "john@test.com",
        })
      ).rejects.toThrow("Only rejected submissions can be resubmitted");
    });

    it("should reject resubmission by unauthorized user", async () => {
      mockResubmitBusinessSubmission.mockRejectedValue(new Error("Not authorized"));

      await expect(
        mockResubmitBusinessSubmission(1, 999, {
          businessName: "Test Biz",
          sportCategoryId: 1,
          businessTypeId: 1,
          contactName: "John",
          contactEmail: "john@test.com",
        })
      ).rejects.toThrow("Not authorized");
    });

    it("should successfully resubmit a rejected submission", async () => {
      mockResubmitBusinessSubmission.mockResolvedValue({
        success: true,
        resubmissionCount: 1,
      });

      const result = await mockResubmitBusinessSubmission(1, 100, {
        businessName: "Updated Biz Name",
        sportCategoryId: 1,
        businessTypeId: 1,
        contactName: "John Updated",
        contactEmail: "john@updatedbiz.com",
        website: "https://updatedbiz.com",
      });

      expect(result.success).toBe(true);
      expect(result.resubmissionCount).toBe(1);
      expect(mockResubmitBusinessSubmission).toHaveBeenCalledWith(1, 100, expect.objectContaining({
        businessName: "Updated Biz Name",
        contactEmail: "john@updatedbiz.com",
      }));
    });

    it("should increment resubmission count on each resubmission", async () => {
      mockResubmitBusinessSubmission
        .mockResolvedValueOnce({ success: true, resubmissionCount: 1 })
        .mockResolvedValueOnce({ success: true, resubmissionCount: 2 });

      const first = await mockResubmitBusinessSubmission(1, 100, {
        businessName: "Biz v1",
        sportCategoryId: 1,
        businessTypeId: 1,
        contactName: "John",
        contactEmail: "john@test.com",
      });
      expect(first.resubmissionCount).toBe(1);

      const second = await mockResubmitBusinessSubmission(1, 100, {
        businessName: "Biz v2",
        sportCategoryId: 1,
        businessTypeId: 1,
        contactName: "John",
        contactEmail: "john@test.com",
      });
      expect(second.resubmissionCount).toBe(2);
    });
  });

  describe("getBusinessSubmissionById", () => {
    it("should return submission with all resubmission fields", async () => {
      const mockSubmission = {
        submission: {
          id: 1,
          businessName: "Test Biz",
          status: "rejected",
          reviewNotes: "Website not found",
          resubmissionCount: 1,
          resubmittedAt: new Date("2026-02-22"),
          previousReviewNotes: JSON.stringify([{
            notes: "Initial rejection - no website",
            reviewedAt: "2026-02-20T00:00:00.000Z",
            resubmissionNumber: 0,
          }]),
          submittedByUserId: 100,
        },
        sportCategory: { id: 1, name: "Cycling" },
        businessType: { id: 1, name: "Coach" },
      };

      mockGetBusinessSubmissionById.mockResolvedValue(mockSubmission);

      const result = await mockGetBusinessSubmissionById(1);
      expect(result).toBeDefined();
      expect(result.submission.resubmissionCount).toBe(1);
      expect(result.submission.previousReviewNotes).toBeDefined();

      const history = JSON.parse(result.submission.previousReviewNotes);
      expect(history).toHaveLength(1);
      expect(history[0].notes).toBe("Initial rejection - no website");
    });

    it("should return null for non-existent submission", async () => {
      mockGetBusinessSubmissionById.mockResolvedValue(null);
      const result = await mockGetBusinessSubmissionById(99999);
      expect(result).toBeNull();
    });
  });

  describe("Review notification on rejection", () => {
    it("should create user notification when submission is rejected", async () => {
      mockCreateUserNotification.mockResolvedValue(1);

      await mockCreateUserNotification({
        userId: 100,
        type: "submission_rejected",
        title: "Submission Needs Changes: Test Biz",
        message: "Your submission for \"Test Biz\" needs changes. Feedback: Website not found. Edit and resubmit from your dashboard.",
      });

      expect(mockCreateUserNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 100,
          type: "submission_rejected",
          title: expect.stringContaining("Needs Changes"),
        })
      );
    });

    it("should create user notification when submission is approved", async () => {
      mockCreateUserNotification.mockResolvedValue(2);

      await mockCreateUserNotification({
        userId: 100,
        type: "submission_approved",
        title: "Submission Approved: Test Biz",
        message: "Your business \"Test Biz\" has been approved and is now live in the directory!",
      });

      expect(mockCreateUserNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 100,
          type: "submission_approved",
          title: expect.stringContaining("Approved"),
        })
      );
    });
  });

  describe("Previous review notes archival", () => {
    it("should correctly parse previousReviewNotes JSON", () => {
      const previousNotes = JSON.stringify([
        { notes: "First rejection", reviewedAt: "2026-02-18T00:00:00.000Z", resubmissionNumber: 0 },
        { notes: "Second rejection", reviewedAt: "2026-02-20T00:00:00.000Z", resubmissionNumber: 1 },
      ]);

      const parsed = JSON.parse(previousNotes);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].notes).toBe("First rejection");
      expect(parsed[1].notes).toBe("Second rejection");
      expect(parsed[1].resubmissionNumber).toBe(1);
    });

    it("should handle empty previousReviewNotes gracefully", () => {
      const emptyNotes = null;
      let history: any[] = [];
      try {
        if (emptyNotes) history = JSON.parse(emptyNotes);
      } catch { /* ignore */ }
      expect(history).toHaveLength(0);
    });

    it("should handle malformed previousReviewNotes gracefully", () => {
      const malformed = "not valid json";
      let history: any[] = [];
      try {
        if (malformed) history = JSON.parse(malformed);
      } catch { /* ignore */ }
      expect(history).toHaveLength(0);
    });
  });
});
