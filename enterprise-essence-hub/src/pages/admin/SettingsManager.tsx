import GenericCRUD from "./GenericCRUD";

export default function SettingsManager() {
  return (
    <GenericCRUD
      title="Site Settings"
      table="site_settings"
      fields={[
        { key: "key", label: "Setting Key", type: "text", required: true, showInTable: true },
        { key: "value", label: "Value (JSON)", type: "json", showInTable: true },
      ]}
    />
  );
}
