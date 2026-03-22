import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionHeading from "@/components/shared/SectionHeading";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Clock, Award, Users } from "lucide-react";
import { submitLead } from "@/lib/submitLead";

const ContactFormSection = () => {
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState("");
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const { data, error, message } = await submitLead({
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      phone: (formData.get("phone") as string) || null,
      company: (formData.get("company") as string) || null,
      interest: interest || null,
      message: (formData.get("message") as string) || null,
      form_type: "contact",
      source_page: location.pathname,
      honeypot: (formData.get("website") as string) || null,
    });

    if (error) {
      toast.error(message || "Something went wrong. Please try again.");
    } else {
      toast.success("Thank you! We'll be in touch shortly.");
      form.reset();
      setInterest("");
    }
    setLoading(false);
  };

  const benefits = [
    { icon: Clock, label: "Response Time", value: "Under 2 hours" },
    { icon: Award, label: "Free Consultation", value: "30-minute assessment" },
    { icon: Users, label: "Certified Team", value: "AWS & Azure certified architects" },
  ];

  return (
    <section id="contact-form" className="home-section bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,247,255,0.78))]">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <SectionHeading
              badge="Get In Touch"
              title="Let's Build Something Great"
              description="Tell us about your project and we'll connect you with the right team."
              align="left"
            />
            <div className="mt-8 space-y-4">
              {benefits.map((item) => (
                <div key={item.label} className="home-panel flex items-center gap-3 p-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base text-muted-foreground">
                    <strong className="text-foreground">{item.label}:</strong> {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="home-panel space-y-5 p-8"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Full Name" name="name" required className="h-12 text-base" />
              <Input placeholder="Work Email" type="email" name="email" required className="h-12 text-base" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Phone" type="tel" name="phone" className="h-12 text-base" />
              <Input placeholder="Company" name="company" className="h-12 text-base" />
            </div>
            <Select value={interest} onValueChange={setInterest}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select Service/Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aws">AWS Cloud Services</SelectItem>
                <SelectItem value="azure">Azure Cloud Services</SelectItem>
                <SelectItem value="devops">DevOps Consulting</SelectItem>
                <SelectItem value="ai">AI & Automation</SelectItem>
                <SelectItem value="managed">Managed IT Services</SelectItem>
                <SelectItem value="product-aicloudinsights">AI Cloud Insights</SelectItem>
                <SelectItem value="product-gpu">GPU on Cloud</SelectItem>
                <SelectItem value="product-ticketly">Ticketly Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Tell us about your project..." name="message" rows={4} className="text-base" />
            <input
              type="text"
              name="website"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <Button type="submit" className="w-full bg-gradient-electric hover:opacity-90 h-13 text-base font-semibold text-white" size="lg" disabled={loading}>
              {loading ? "Sending..." : "Send Inquiry"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to our <a href="/privacy-policy" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
