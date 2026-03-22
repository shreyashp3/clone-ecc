import GenericCRUD from "./GenericCRUD";

export default function TestimonialsManager() {
  return (
    <GenericCRUD
      title="Testimonials"
      table="testimonials"
      fields={[
        { key: "name", label: "Name", type: "text", required: true, showInTable: true },
        { key: "role", label: "Role / Title", type: "text", showInTable: true },
        { key: "company", label: "Company", type: "text", showInTable: true },
        { key: "content", label: "Testimonial", type: "textarea", required: true },
        { key: "rating", label: "Rating (1-5)", type: "number" },
        { key: "avatar_url", label: "Avatar URL", type: "text" },
        { key: "is_featured", label: "Featured", type: "boolean" },
        { key: "is_published", label: "Published", type: "boolean" },
        { key: "sort_order", label: "Sort Order", type: "number" },
      ]}
    />
  );
}
