import { Briefcase, Users, Clock, Wrench } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { icon: Briefcase, value: 200, label: "Successful Projects", suffix: "+" },
  { icon: Users, value: 50, label: "Satisfied Clients", suffix: "+" },
  { icon: Clock, value: 60, label: "Years of Total Experience", suffix: "+" },
  { icon: Wrench, value: 50, label: "DevOps Tools Expertise", suffix: "+" },
];

const StatCard = ({ stat, index }: { stat: typeof stats[0]; index: number }) => {
  const { count, ref } = useCountUp(stat.value, 2500);

  return (
    <div
      key={stat.label}
      ref={ref}
      className="home-panel p-6 text-center sm:p-8 hero-fade-up"
      style={{ animationDelay: `${index * 0.08 + 0.1}s` }}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
      </div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
        {count}{stat.suffix}
      </div>
      <div className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">{stat.label}</div>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="relative z-20 mt-8 sm:mt-10 lg:mt-12 xl:mt-14 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
