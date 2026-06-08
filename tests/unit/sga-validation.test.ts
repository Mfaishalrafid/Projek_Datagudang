import { afterEach, describe, expect, it, vi } from "vitest";
import { sgaEligibilityStatusOptions } from "@/data/options";
import { normalizeTlsNumber } from "@/lib/sga";
import { sgaInputSchema } from "@/lib/validations";

const validPayload = {
  branchId: "branch-sirclo",
  inputDate: "2026-05-23",
  tlsNumber: "tls-2026-001",
  itemName: "Meja kantor bekas",
  quantity: 5,
  picName: "Ardi",
  eligibilityStatus: "LAYAK_JUAL" as const,
  note: ""
};

describe("SGA validation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("normalizes TLS number by trimming and uppercasing", () => {
    expect(normalizeTlsNumber(" tls-2026-001 ")).toBe("TLS-2026-001");
    expect(sgaInputSchema.parse(validPayload).tlsNumber).toBe("TLS-2026-001");
  });

  it("treats duplicate TLS candidates with different casing as the same normalized value", () => {
    const existing = normalizeTlsNumber("TLS-2026-001");
    const incoming = normalizeTlsNumber(" tls-2026-001 ");

    expect(incoming).toBe(existing);
  });

  it("requires TLS, branch, name, PIC, and positive quantity", () => {
    expect(sgaInputSchema.safeParse({ ...validPayload, tlsNumber: "" }).success).toBe(false);
    expect(sgaInputSchema.safeParse({ ...validPayload, branchId: "" }).success).toBe(false);
    expect(sgaInputSchema.safeParse({ ...validPayload, itemName: "" }).success).toBe(false);
    expect(sgaInputSchema.safeParse({ ...validPayload, picName: "" }).success).toBe(false);
    expect(sgaInputSchema.safeParse({ ...validPayload, quantity: 0 }).success).toBe(false);
    expect(sgaInputSchema.safeParse({ ...validPayload, quantity: -1 }).success).toBe(false);
  });

  it("defaults inputDate to today when omitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T04:00:00.000Z"));

    const parsed = sgaInputSchema.parse({ ...validPayload, inputDate: undefined });

    expect(parsed.inputDate).toBe("2026-06-05");
  });

  it("only accepts final SGA eligibility statuses and has no unit option", () => {
    expect(sgaInputSchema.safeParse({ ...validPayload, eligibilityStatus: "RUSAK" }).success).toBe(false);
    expect(sgaEligibilityStatusOptions.map((item) => item.label)).toEqual(["LAYAK JUAL", "TIDAK LAYAK"]);
  });
});
