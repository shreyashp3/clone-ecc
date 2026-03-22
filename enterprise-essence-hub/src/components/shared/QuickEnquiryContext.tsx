import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { submitLead } from "@/lib/submitLead";

type EnquiryDefaults = {
  interest?: string;
  message?: string;
};

type QuickEnquiryContextValue = {
  openEnquiry: (defaults?: EnquiryDefaults) => void;
};

const QuickEnquiryContext = createContext<QuickEnquiryContextValue | null>(null);

const interestOptions = [
  { value: "consultation", label: "Free Consultation" },
  { value: "assessment", label: "Free Assessment" },
  { value: "audit", label: "Free Audit" },
  { value: "product_demo", label: "Product Demo" },
  { value: "aws", label: "AWS Cloud Services" },
  { value: "azure", label: "Azure Cloud Services" },
  { value: "devops", label: "DevOps Consulting" },
  { value: "ai", label: "AI & Automation" },
  { value: "managed", label: "Managed IT Services" },
  { value: "other", label: "Other" },
];

const QuickEnquiryModal = ({
  open,
  onOpenChange,
  defaults,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  defaults: EnquiryDefaults;
}) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setInterest(defaults.interest || "");
      setMessage(defaults.message || "");
    }
  }, [open, defaults.interest, defaults.message]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const result = await submitLead({
      name: (fd.get("name") as string) || "",
      email: (fd.get("email") as string) || "",
      phone: (fd.get("phone") as string) || null,
      company: (fd.get("company") as string) || null,
      interest: interest || null,
      message: message || null,
      form_type: "quick_enquiry",
      source_page: location.pathname,
      honeypot: (fd.get("website") as string) || null,
    });

    if (result.error) {
      toast.error(result.message || "Something went wrong. Please try again.");
    } else {
      toast.success("Thanks! We'll be in touch shortly.");
      form.reset();
      setInterest("");
      setMessage("");
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-[1.05fr_1.4fr]">
          <div className="bg-navy text-white p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold text-white">
                Quick Enquiry
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Share a few details and our team will reach out within one business day.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-3 text-sm text-white/70">
              <p>Response time: under 24 hours</p>
              <p>Certified cloud & DevOps experts</p>
              <p>No commitment required</p>
            </div>
            <div className="mt-6 text-xs text-white/50">
              Prefer details? You can still visit the full contact page anytime.
            </div>
          </div>

          <form className="p-6 sm:p-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Full Name" name="name" required className="h-11" />
              <Input placeholder="Work Email" type="email" name="email" required className="h-11" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Phone" type="tel" name="phone" className="h-11" />
              <Input placeholder="Company" name="company" className="h-11" />
            </div>
            <Select value={interest} onValueChange={setInterest}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Service/Product" />
              </SelectTrigger>
              <SelectContent>
                {interestOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Tell us about your project..."
              name="message"
              rows={4}
              className="text-base"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <input
              type="text"
              name="website"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <Button type="submit" className="w-full bg-gradient-electric text-white h-11" disabled={loading}>
              {loading ? "Sending..." : "Send Enquiry"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const QuickEnquiryProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [defaults, setDefaults] = useState<EnquiryDefaults>({});

  const openEnquiry = (next?: EnquiryDefaults) => {
    setDefaults(next || {});
    setOpen(true);
  };

  const value = useMemo(() => ({ openEnquiry }), []);

  return (
    <QuickEnquiryContext.Provider value={value}>
      {children}
      <QuickEnquiryModal open={open} onOpenChange={setOpen} defaults={defaults} />
    </QuickEnquiryContext.Provider>
  );
};

export const useQuickEnquiry = () => {
  const ctx = useContext(QuickEnquiryContext);
  if (!ctx) {
    throw new Error("useQuickEnquiry must be used within QuickEnquiryProvider");
  }
  return ctx;
};
