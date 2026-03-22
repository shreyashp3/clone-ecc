import GenericCRUD from "./GenericCRUD";

export default function CareersManager() {
  return (
    <GenericCRUD
      title="Careers"
      table={"careers" as any}
      fields={[
        { key: "title", label: "Job Title", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        { key: "department", label: "Department", type: "text" },
        { key: "location", label: "Location", type: "text" },
        { key: "employment_type", label: "Employment Type", type: "text" },
        { key: "experience_level", label: "Experience Level", type: "text" },
        { key: "summary", label: "Short Summary", type: "textarea" },
        { key: "description", label: "Full Description", type: "textarea" },
        { key: "responsibilities", label: "Responsibilities (JSON)", type: "json" },
        { key: "requirements", label: "Requirements (JSON)", type: "json" },
        { key: "benefits", label: "Benefits (JSON)", type: "json" },
        { key: "apply_email", label: "Application Email", type: "text" },
        { key: "apply_link", label: "Apply Link (URL)", type: "text" },
        { key: "is_published", label: "Published", type: "boolean" },
        { key: "sort_order", label: "Sort Order", type: "number" },
      ]}
    />
  );
}
