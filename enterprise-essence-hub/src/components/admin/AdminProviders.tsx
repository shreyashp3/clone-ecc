import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";

const AdminProviders = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AdminProviders;
