import { z } from "zod";

export const categorySchema = z.enum([
  "BAN",
  "FILTER_OLI",
  "REM_KAMPAS",
  "TRANSMISI",
  "MESIN",
  "ELEKTRIKAL",
  "OTHERS"
]);

export const conditionSchema = z.enum(["LAYAK_JUAL", "RUSAK"]);
export const vehicleCodeSchema = z.enum(["CDE", "CDD", "BV", "L300"]);
export const vehicleTypeSchema = z.enum(["ENGKEL", "DOUBLE", "BLIND_VAN", "L300"]);
export const buyerTypeSchema = z.enum(["PELANGGAN_UMUM", "MITRA_BENGKEL", "INTERNAL"]);
export const saleStatusSchema = z.enum(["APPROVAL", "TERJUAL", "BATAL"]);

const optionalDateInput = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const sparepartInputSchema = z.object({
  pjpp: z.string().trim().min(1, "No PJPP wajib diisi"),
  branchId: z.string().trim().min(1, "Cabang wajib dipilih"),
  removedDate: optionalDateInput,
  name: z.string().trim().min(1, "Nama sparepart wajib diisi"),
  category: categorySchema,
  plateNumber: z.string().trim().min(1, "Nopol wajib diisi"),
  vehicleCode: vehicleCodeSchema,
  vehicleType: vehicleTypeSchema,
  condition: conditionSchema,
  storageLocation: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable()
});

export const sparepartUpdateSchema = sparepartInputSchema.partial().extend({
  id: z.string().trim().min(1)
});

export const sparepartFiltersSchema = z
  .object({
    query: z.string().trim().optional(),
    condition: conditionSchema.optional(),
    category: categorySchema.optional(),
    branchId: z.string().trim().optional(),
    vehicleType: vehicleTypeSchema.optional()
  })
  .optional();

export const saleOrderInputSchema = z.object({
  sparepartId: z.string().trim().min(1, "Sparepart wajib dipilih"),
  buyerName: z.string().trim().min(1, "Nama pembeli wajib diisi"),
  buyerType: buyerTypeSchema,
  price: z.coerce.number().positive("Harga jual wajib lebih dari 0"),
  saleDate: z.string().trim().min(1, "Tanggal penjualan wajib diisi"),
  status: saleStatusSchema.default("APPROVAL")
});

export type SparepartInput = z.infer<typeof sparepartInputSchema>;
export type SparepartUpdateInput = z.infer<typeof sparepartUpdateSchema>;
export type SparepartFilters = z.infer<typeof sparepartFiltersSchema>;
export type SaleOrderInput = z.infer<typeof saleOrderInputSchema>;
