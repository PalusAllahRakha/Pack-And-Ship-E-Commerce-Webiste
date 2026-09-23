import type { AddressType } from "@/lib/types";

const OFFICE_KEYWORDS = [
  "office",
  "suite",
  "ste",
  "floor",
  "fl",
  "building",
  "bldg",
  "plaza",
  "corp",
  "corporate",
  "business",
  "hq",
  "tower",
  "park",
  "industrial",
  "warehouse",
  "unit",
];

export function inferAddressType(address: string, city: string): AddressType {
  const text = `${address} ${city}`.toLowerCase();
  if (OFFICE_KEYWORDS.some((word) => text.includes(word))) return "office";
  return "home";
}

export function resolveAddressType(
  shipping: { address: string; city: string; addressType?: AddressType },
): AddressType {
  return shipping.addressType ?? inferAddressType(shipping.address, shipping.city);
}
