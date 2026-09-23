export function digitsOnly(value: string, max: number) {
  return value.replace(/\D/g, "").slice(0, max);
}

export function formatCardInput(value: string) {
  const d = digitsOnly(value, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiryInput(value: string) {
  const d = digitsOnly(value, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function formatCvvInput(value: string) {
  return digitsOnly(value, 4);
}

/** Display on card face — typed digits show live, rest masked */
export function displayCardNumber(value: string) {
  const d = digitsOnly(value, 16);
  const groups = [0, 1, 2, 3].map((i) => {
    const chunk = d.slice(i * 4, i * 4 + 4);
    if (!chunk) return "xxxx";
    return chunk.padEnd(4, "x");
  });
  return groups.join(" ");
}

export function displayCardName(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : "PERSON NAME";
}

export function displayExpiry(value: string) {
  const d = digitsOnly(value, 4);
  if (!d) return "MM/YY";
  if (d.length <= 2) return `${d.padEnd(2, "M")}/YY`;
  return `${d.slice(0, 2)}/${d.slice(2).padEnd(2, "Y")}`;
}

export function displayCvv(value: string) {
  const d = digitsOnly(value, 4);
  return d ? d.padEnd(3, "•") : "•••";
}

export function cardBrand(number: string): "mastercard" | "visa" | "generic" {
  const d = digitsOnly(number, 1);
  if (d.startsWith("4")) return "visa";
  if (d.startsWith("5") || d.startsWith("2")) return "mastercard";
  return "generic";
}
