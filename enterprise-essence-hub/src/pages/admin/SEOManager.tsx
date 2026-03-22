import GenericCRUD from "./GenericCRUD";

export default function SEOManager() {
  return (
    <GenericCRUD
      title="SEO Metadata"
      table="page_seo"
      fields={[
        { key: "page_path", label: "Page Path", type: "text", required: true, showInTable: true },
        { key: "title", label: "Title", type: "text", showInTable: true },
        { key: "description", label: "Description", type: "textarea", showInTable: true },
        { key: "og_image", label: "OG Image URL", type: "text" },
        { key: "canonical_url", label: "Canonical URL", type: "text" },
        { key: "schema_markup", label: "Schema Markup (JSON-LD)", type: "json" },
        { key: "no_index", label: "No Index", type: "boolean" },
      ]}
    />
  );
}
