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
export const usedGoodsConditionSchema = z.enum(["LAYAK_JUAL", "TIDAK_LAYAK"]);
export const usedGoodsCategorySchema = z.enum([
  "KARDUS_KARTON",
  "PLASTIK",
  "BESI_LOGAM",
  "KERTAS_ARSIP",
  "KAYU_PALET",
  "ELEKTRONIK_BEKAS",
  "TEKSTIL_KAIN",
  "KACA",
  "LAINNYA"
]);
export const usedGoodsUnitSchema = z.enum(["PCS", "KG", "LEMBAR", "IKAT", "KARUNG", "UNIT", "SET", "ROLL", "DUS"]);

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

const optionalNumberInput = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().nullable()
);

export const usedGoodsInputSchema = z.object({
  branchId: z.string().trim().min(1, "Cabang / lokasi asal wajib dipilih"),
  inputDate: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value || new Date().toISOString().slice(0, 10)),
  name: z.string().trim().min(1, "Nama barang wajib diisi"),
  category: usedGoodsCategorySchema,
  qty: z.coerce.number().positive("Qty wajib lebih dari 0"),
  unit: usedGoodsUnitSchema,
  estimatedWeightKg: optionalNumberInput.refine((value) => value === null || value >= 0, "Estimasi berat tidak boleh negatif"),
  estimatedPrice: optionalNumberInput.refine((value) => value === null || value >= 0, "Estimasi harga tidak boleh negatif"),
  condition: usedGoodsConditionSchema,
  storageLocation: z.string().trim().optional().nullable(),
  pic: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable()
});

export const usedGoodsUpdateSchema = usedGoodsInputSchema.partial().extend({
  id: z.string().trim().min(1)
});

export const usedGoodsFiltersSchema = z
  .object({
    query: z.string().trim().optional(),
    condition: usedGoodsConditionSchema.optional(),
    category: usedGoodsCategorySchema.optional(),
    branchId: z.string().trim().optional()
  })
  .optional();

export type SparepartInput = z.infer<typeof sparepartInputSchema>;
export type SparepartUpdateInput = z.infer<typeof sparepartUpdateSchema>;
export type SparepartFilters = z.infer<typeof sparepartFiltersSchema>;
export type SaleOrderInput = z.infer<typeof saleOrderInputSchema>;
export type UsedGoodsInput = z.infer<typeof usedGoodsInputSchema>;
export type UsedGoodsUpdateInput = z.infer<typeof usedGoodsUpdateSchema>;
export type UsedGoodsFilters = z.infer<typeof usedGoodsFiltersSchema>;
