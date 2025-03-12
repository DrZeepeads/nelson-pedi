
import { Button } from "@/components/ui/button";
import { MessageSquare, Calculator, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    name: "AI Chat Assistant",
    description: "Get evidence-based answers from the Nelson Textbook of Pediatrics",
    icon: MessageSquare,
    href: "/chat",
  },
  {
    name: "Drug Calculator",
    description: "Calculate accurate pediatric drug dosages based on weight and age",
    icon: Calculator,
    href: "/calculator",
  },
  {
    name: "Growth Charts",
    description: "Track and visualize pediatric growth with WHO & CDC percentiles",
    icon: LineChart,
    href: "/growth-charts",
  },
];

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-primary mb-6">
        Welcome to Nelson-GPT
      </h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
        Your AI-powered pediatric assistant, powered by the Nelson Textbook of Pediatrics
      </p>
      
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="relative group bg-card p-6 rounded-lg border transition-all hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <feature.icon className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">{feature.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              <Button asChild className="mt-auto">
                <Link to={feature.href}>Get Started</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
