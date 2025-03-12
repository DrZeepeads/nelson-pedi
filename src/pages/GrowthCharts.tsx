
import { Card } from "@/components/ui/card";

const GrowthCharts = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pediatric Growth Charts</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">
          Growth charts feature is coming soon. It will support WHO & CDC percentiles for weight, height, BMI, and head circumference.
        </p>
      </Card>
    </div>
  );
};

export default GrowthCharts;
