import { describe, expect, it } from "vitest";
import { branchInputSchema, userCreateSchema, userUpdateSchema } from "@/lib/validations";

describe("v4 branch and user validations", () => {
  it("requires branch code and name", () => {
    expect(branchInputSchema.safeParse({ code: "IGR-CPT", name: "IGR CIPUTAT", isActive: true }).success).toBe(true);
    expect(branchInputSchema.safeParse({ code: "", name: "IGR CIPUTAT", isActive: true }).success).toBe(false);
    expect(branchInputSchema.safeParse({ code: "IGR-CPT", name: "", isActive: true }).success).toBe(false);
  });

  it("requires branchId for cabang users and forbids SUPER_ADMIN creation", () => {
    expect(
      userCreateSchema.safeParse({
        name: "Admin Cabang",
        email: "admin.cabang@barkas.local",
        password: "Secret123",
        role: "ADMIN_CABANG",
        branchId: "branch-a",
        isActive: true
      }).success
    ).toBe(true);

    expect(
      userCreateSchema.safeParse({
        name: "Admin Cabang",
        email: "admin.cabang@barkas.local",
        password: "Secret123",
        role: "ADMIN_CABANG",
        branchId: "",
        isActive: true
      }).success
    ).toBe(false);

    expect(
      userCreateSchema.safeParse({
        name: "Super",
        email: "super@barkas.local",
        password: "Secret123",
        role: "SUPER_ADMIN",
        branchId: null,
        isActive: true
      }).success
    ).toBe(false);
  });

  it("keeps update user role assignment within non-super-admin options", () => {
    expect(userUpdateSchema.safeParse({ id: "user-a", role: "ADMIN_PUSAT", branchId: null }).success).toBe(true);
    expect(userUpdateSchema.safeParse({ id: "user-a", role: "SUPER_ADMIN", branchId: null }).success).toBe(false);
  });
});
