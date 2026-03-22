import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const CTASection = () => {
  const { openEnquiry } = useQuickEnquiry();

  return (
    <section className="py-20 lg:py-28 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-teal blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
            Need Help with Cloud Transformation, DevOps, or FinOps?
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-white/55">
            Get a free consultation from our team of certified cloud architects and DevOps engineers. No obligations — just actionable insights.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-electric hover:opacity-90 text-base sm:text-lg px-8 sm:px-10 h-13 sm:h-14 font-semibold text-white"
              onClick={() => openEnquiry({ interest: "consultation" })}
            >
              Book Free Consultation <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              size="lg"
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20 text-base sm:text-lg h-13 sm:h-14 font-semibold"
              onClick={() => openEnquiry()}
            >
              <MessageSquare className="w-5 h-5 mr-1" /> Talk to Our Experts
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
