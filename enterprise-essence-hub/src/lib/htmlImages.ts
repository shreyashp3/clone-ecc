const ensureImgAttribute = (html: string, attr: string, value: string) => {
  const pattern = new RegExp(`<img(?![^>]*\\s${attr}=)([^>]*)>`, "gi");
  return html.replace(pattern, `<img ${attr}="${value}"$1>`);
};

export const enhanceHtmlImages = (html?: string | null) => {
  if (!html) return html;
  let result = ensureImgAttribute(html, "loading", "lazy");
  result = ensureImgAttribute(result, "decoding", "async");
  return result;
};
