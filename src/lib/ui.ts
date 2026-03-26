export interface ProtocolStyle {
  badge: string;
  text: string;
  shortLabel: string;
}

export interface CompatibilityStatusStyle {
  label: string;
  className: string;
}

export const PROTOCOL_STYLES: Record<string, ProtocolStyle> = {
  zigbee: { badge: "bg-zigbee", text: "text-zigbee", shortLabel: "ZG" },
  zwave: { badge: "bg-zwave", text: "text-zwave", shortLabel: "ZW" },
  matter: { badge: "bg-matter", text: "text-matter", shortLabel: "MT" },
  wifi: { badge: "bg-wifi", text: "text-wifi", shortLabel: "WF" },
  thread: { badge: "bg-thread", text: "text-thread", shortLabel: "TH" },
  bluetooth: {
    badge: "bg-bluetooth",
    text: "text-bluetooth",
    shortLabel: "BT",
  },
};

export const COMPATIBILITY_STATUS_STYLES: Record<string, CompatibilityStatusStyle> = {
  verified: {
    label: "Verified",
    className: "bg-green-subtle text-green",
  },
  supported: {
    label: "Supported",
    className: "bg-green-subtle text-green",
  },
  reported: {
    label: "Reported",
    className: "bg-amber-subtle text-amber",
  },
  untested: {
    label: "Untested",
    className: "bg-untested text-muted",
  },
  incompatible: {
    label: "Incompatible",
    className: "bg-red-subtle text-red",
  },
  unsupported: {
    label: "Unsupported",
    className: "bg-red-subtle text-red",
  },
};

export function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function getProtocolStyle(slug: string | null | undefined): ProtocolStyle {
  if (!slug) {
    return {
      badge: "bg-badge",
      text: "text-secondary",
      shortLabel: "SP",
    };
  }

  return PROTOCOL_STYLES[slug] ?? {
    badge: "bg-badge",
    text: "text-secondary",
    shortLabel: slug.slice(0, 2).toUpperCase() || "SP",
  };
}

export function formatProtocolLabel(slug: string | null | undefined): string {
  if (!slug) {
    return "Unknown";
  }

  if (slug === "wifi") {
    return "Wi-Fi";
  }

  if (slug === "zwave") {
    return "Z-Wave";
  }

  return sentenceCase(slug);
}

export function sentenceCase(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatCompatibilityStatusLabel(
  status: string | null | undefined,
  fallback = "Unknown",
) {
  if (!status) {
    return fallback;
  }

  return COMPATIBILITY_STATUS_STYLES[status]?.label ?? sentenceCase(status);
}

export function getCompatibilityStatusStyle(
  status: string | null | undefined,
  fallback = "Unknown",
): CompatibilityStatusStyle {
  if (!status) {
    return {
      label: fallback,
      className: "bg-badge text-secondary",
    };
  }

  return (
    COMPATIBILITY_STATUS_STYLES[status] ?? {
      label: sentenceCase(status),
      className: "bg-badge text-secondary",
    }
  );
}

export function formatBooleanFact(
  value: boolean | null | undefined,
  positive = "Yes",
  negative = "No",
) {
  if (value === true) {
    return positive;
  }

  if (value === false) {
    return negative;
  }

  return "Unknown";
}
