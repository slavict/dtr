export function formatApiErrors(data, fallback = "Request failed.") {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return typeof data.detail === "string"
      ? data.detail
      : formatApiErrors(data.detail, fallback);
  }

  const payload = data.errors ?? data.user ?? data;
  const messages = [];

  const collect = (value) => {
    if (value == null) {
      return;
    }
    if (typeof value === "string") {
      messages.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    if (typeof value === "object") {
      Object.values(value).forEach(collect);
    }
  };

  collect(payload);
  return messages.length ? messages.join(" ") : fallback;
}
