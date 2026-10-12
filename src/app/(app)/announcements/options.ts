import { AUDIENCE } from "@/lib/constants";

// Tuple form for zod enum validation.
export const ALL_AUDIENCES_TUPLE = [
  AUDIENCE.ALL,
  AUDIENCE.RESIDENTS,
  AUDIENCE.BOARD,
] as const;
