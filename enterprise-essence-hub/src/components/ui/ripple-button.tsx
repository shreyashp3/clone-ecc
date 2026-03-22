import { Button, ButtonProps } from "./button";
import { motion } from "framer-motion";
import { forwardRef, useState } from "react";

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
}

const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, rippleColor = "rgba(255, 255, 255, 0.5)", className, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { id, x, y }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      // Call original onMouseDown if it exists
      props.onMouseDown?.(e);
    };

    return (
      <Button
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        onMouseDown={handleMouseDown}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            initial={{
              width: 0,
              height: 0,
              backgroundColor: rippleColor,
              opacity: 1,
            }}
            animate={{
              width: 200,
              height: 200,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </Button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export { RippleButton };
