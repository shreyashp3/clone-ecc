import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Mail } from "lucide-react";
import { primaryContactMethods, salesEmail, toTelHref } from "@/data/contactInfo";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openEnquiry } = useQuickEnquiry();

  const variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: i * 0.1 },
    }),
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <div className="fixed bottom-6 right-24 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-0 space-y-3 flex flex-col"
          >
            <motion.a
              href={toTelHref(primaryContactMethods[0].phone)}
              custom={0}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              title="Call us"
            >
              <Phone className="w-6 h-6" />
            </motion.a>

            <motion.a
              href={`mailto:${salesEmail}`}
              custom={1}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              title="Email us"
            >
              <Mail className="w-6 h-6" />
            </motion.a>

            <motion.div
              custom={2}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                type="button"
                onClick={() => {
                  openEnquiry({ interest: "consultation" });
                  setIsOpen(false);
                }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                title="Contact us"
              >
                <Mail className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-shadow relative z-50"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
