import { describe, it, expect, vi, beforeEach } from "vitest";
import * as groupsService from "../src/services/supabase-groups";
import { supabase } from "../src/services/supabase";

// 🔹 Mock supabase
vi.mock("../src/services/supabase", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

describe("groups service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------
  // getUserGroups
  // ------------------------------
  describe("getUserGroups", () => {
    it("throws if user is not authenticated", async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(groupsService.getUserGroups()).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("returns groups with roles and member counts", async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      });

      const mockFromGroups = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            { id: "group1", name: "Test Group 1" },
            { id: "group2", name: "Test Group 2" },
          ],
          error: null,
        }),
      };

      const mockFromMemberships = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { group_id: "group1", role: "admin" },
            { group_id: "group2", role: "member" },
          ],
        }),
      };

      const mockFromCounts = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { group_id: "group1" },
            { group_id: "group1" },
            { group_id: "group2" },
          ],
        }),
      };

      (supabase.from as any)
        .mockImplementationOnce(() => mockFromGroups)
        .mockImplementationOnce(() => mockFromMemberships)
        .mockImplementationOnce(() => mockFromCounts);

      const result = await groupsService.getUserGroups();

      expect(result).toEqual([
        {
          id: "group1",
          name: "Test Group 1",
          user_role: "admin",
          member_count: 2,
        },
        {
          id: "group2",
          name: "Test Group 2",
          user_role: "member",
          member_count: 1,
        },
      ]);
    });
  });

  // ------------------------------
  // createGroup
  // ------------------------------
  describe("createGroup", () => {
    it("creates a group successfully", async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: "newGroup", name: "My Group" }],
          error: null,
        }),
      };

      (supabase.from as any).mockReturnValue(mockInsert);

      const result = await groupsService.createGroup({ name: "My Group" });
      expect(result).toEqual({ id: "newGroup", name: "My Group" });
    });
  });

  // ------------------------------
  // joinGroup
  // ------------------------------
  describe("joinGroup", () => {
    it("joins group successfully", async () => {
      const mockInsert = {
        insert: vi.fn().mockResolvedValue({ data: [{}], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockInsert);

      const result = await groupsService.joinGroup("group1");
      expect(result).toEqual({});
    });
  });

  // ------------------------------
  // updateGroup
  // ------------------------------
  describe("updateGroup", () => {
    it("updates group successfully", async () => {
      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ id: "group1", name: "Updated" }],
          error: null,
        }),
      };

      (supabase.from as any).mockReturnValue(mockUpdate);

      const result = await groupsService.updateGroup("group1", {
        name: "Updated",
      });
      expect(result).toEqual({ id: "group1", name: "Updated" });
    });
  });
});
