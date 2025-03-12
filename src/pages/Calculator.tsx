
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalculatorIcon, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Medication database with proper pediatric dosing
const MEDICATIONS = {
  respiratory: [
    { id: "salbutamol", name: "Salbutamol", dosePerKg: 0.1, maxDose: 5, unit: "mg", frequency: "Every 4-6 hours" },
    { id: "montelukast", name: "Montelukast", dosePerKg: 0.2, maxDose: 10, unit: "mg", frequency: "Once daily" },
    { id: "budesonide", name: "Budesonide", dosePerKg: 0.5, maxDose: 1, unit: "mg", frequency: "Twice daily" },
  ],
  cardiology: [
    { id: "furosemide", name: "Furosemide", dosePerKg: 1, maxDose: 40, unit: "mg", frequency: "Every 6-8 hours" },
    { id: "captopril", name: "Captopril", dosePerKg: 0.5, maxDose: 25, unit: "mg", frequency: "Three times daily" },
    { id: "propranolol", name: "Propranolol", dosePerKg: 0.5, maxDose: 10, unit: "mg", frequency: "Three times daily" },
  ],
  neurology: [
    { id: "phenobarbital", name: "Phenobarbital", dosePerKg: 3, maxDose: 100, unit: "mg", frequency: "Once daily" },
    { id: "diazepam", name: "Diazepam", dosePerKg: 0.2, maxDose: 10, unit: "mg", frequency: "Every 6-8 hours" },
    { id: "levetiracetam", name: "Levetiracetam", dosePerKg: 20, maxDose: 1000, unit: "mg", frequency: "Twice daily" },
  ],
  gastroenterology: [
    { id: "ranitidine", name: "Ranitidine", dosePerKg: 2, maxDose: 150, unit: "mg", frequency: "Twice daily" },
    { id: "ondansetron", name: "Ondansetron", dosePerKg: 0.15, maxDose: 8, unit: "mg", frequency: "Every 8 hours" },
    { id: "lactulose", name: "Lactulose", dosePerKg: 1, maxDose: 30, unit: "mL", frequency: "Twice daily" },
  ],
};

const MedicationCalculator = () => {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [category, setCategory] = useState("respiratory");
  const [medication, setMedication] = useState("");
  const [calculatedDose, setCalculatedDose] = useState<{
    dose: number;
    maxReached: boolean;
    singleDose: string;
    dailyDose: string;
    frequency: string;
  } | null>(null);
  const { toast } = useToast();

  const calculateDose = () => {
    if (!weight || !medication) {
      toast({
        title: "Missing information",
        description: "Please enter patient weight and select a medication",
        variant: "destructive",
      });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 150) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight between 0.1 and 150 kg",
        variant: "destructive",
      });
      return;
    }

    // Find selected medication
    const selectedMedication = Object.values(MEDICATIONS)
      .flat()
      .find((med) => med.id === medication);

    if (!selectedMedication) return;

    // Calculate dose based on weight
    let calculatedDose = weightNum * selectedMedication.dosePerKg;
    const maxReached = calculatedDose > selectedMedication.maxDose;
    
    // Cap at max dose if exceeded
    if (maxReached) {
      calculatedDose = selectedMedication.maxDose;
    }

    // Format the dose with appropriate precision
    const formattedDose = calculatedDose >= 1 
      ? calculatedDose.toFixed(1) 
      : calculatedDose.toFixed(2);

    // Calculate daily dose based on frequency
    let multiplier = 1;
    if (selectedMedication.frequency.includes("Twice")) multiplier = 2;
    if (selectedMedication.frequency.includes("Three times")) multiplier = 3;
    if (selectedMedication.frequency.includes("Every 4-6")) multiplier = 4;
    if (selectedMedication.frequency.includes("Every 6-8")) multiplier = 3;
    if (selectedMedication.frequency.includes("Every 8")) multiplier = 3;

    setCalculatedDose({
      dose: calculatedDose,
      maxReached,
      singleDose: `${formattedDose} ${selectedMedication.unit}`,
      dailyDose: `${(calculatedDose * multiplier).toFixed(1)} ${selectedMedication.unit}`,
      frequency: selectedMedication.frequency,
    });
  };

  const handleMedicationCategoryChange = (value: string) => {
    setCategory(value);
    setMedication("");
    setCalculatedDose(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5" />
          Medication Dose Calculator
        </CardTitle>
        <CardDescription>Calculate pediatric medication dosages based on weight</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Patient Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0.1"
                max="150"
                step="0.1"
                placeholder="Enter weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Patient Age (optional)</Label>
              <Input
                id="age"
                placeholder="Enter age (years)"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Medication Category</Label>
            <Select value={category} onValueChange={handleMedicationCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="respiratory">Respiratory</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Medication</Label>
            <Select value={medication} onValueChange={setMedication}>
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {MEDICATIONS[category as keyof typeof MEDICATIONS].map((med) => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateDose}>Calculate Dose</Button>

          {calculatedDose && (
            <div className="mt-4 p-4 border rounded-md bg-muted">
              <h3 className="font-semibold mb-2">Calculated Dosage:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Single dose:</span>
                  <span>{calculatedDose.singleDose}</span>
                  {calculatedDose.maxReached && (
                    <div className="flex items-center text-amber-500 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span>Maximum dose reached</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-medium">Frequency:</span> {calculatedDose.frequency}
                </div>
                <div>
                  <span className="font-medium">Daily dose:</span> {calculatedDose.dailyDose}
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground flex items-start mt-2">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Always verify dosages with a current drug reference and clinical judgment. This calculator is for reference only.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FluidCalculator = () => {
  const [weight, setWeight] = useState("");
  const [calculatedFluid, setCalculatedFluid] = useState<{
    maintenance: string;
    bolus: string;
    deficit: string;
  } | null>(null);
  const { toast } = useToast();

  const calculateFluids = () => {
    if (!weight) {
      toast({
        title: "Missing information",
        description: "Please enter patient weight",
        variant: "destructive",
      });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 150) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight between 0.1 and 150 kg",
        variant: "destructive",
      });
      return;
    }

    // Calculate maintenance fluid using Holliday-Segar method
    let maintenanceRate = 0;
    if (weightNum <= 10) {
      maintenanceRate = weightNum * 100;
    } else if (weightNum <= 20) {
      maintenanceRate = 1000 + (weightNum - 10) * 50;
    } else {
      maintenanceRate = 1500 + (weightNum - 20) * 20;
    }

    const hourlyRate = Math.round(maintenanceRate / 24);

    // Calculate bolus (20 mL/kg)
    const bolus = Math.round(weightNum * 20);

    // Calculate deficit replacement
    const deficit = Math.round(weightNum * 70); // Assuming moderate dehydration (7%)

    setCalculatedFluid({
      maintenance: `${maintenanceRate} mL/day (${hourlyRate} mL/hour)`,
      bolus: `${bolus} mL`,
      deficit: `${deficit} mL`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5" />
          Fluid Calculator
        </CardTitle>
        <CardDescription>Calculate maintenance fluids, bolus, and deficit replacement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="fluid-weight">Patient Weight (kg)</Label>
            <Input
              id="fluid-weight"
              type="number"
              min="0.1"
              max="150"
              step="0.1"
              placeholder="Enter weight in kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <Button onClick={calculateFluids}>Calculate Fluids</Button>

          {calculatedFluid && (
            <div className="mt-4 p-4 border rounded-md bg-muted">
              <h3 className="font-semibold mb-2">Fluid Calculations:</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Maintenance fluids:</span> {calculatedFluid.maintenance}
                </div>
                <div>
                  <span className="font-medium">IV Bolus (20 mL/kg):</span> {calculatedFluid.bolus}
                </div>
                <div>
                  <span className="font-medium">Deficit replacement (moderate dehydration):</span> {calculatedFluid.deficit}
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground flex items-start mt-2">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Fluid requirements may vary based on clinical condition. Always adjust based on patient assessment and laboratory values.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Calculator = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pediatric Calculators</h1>
      
      <Tabs defaultValue="medication" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="medication">Medication Dosing</TabsTrigger>
          <TabsTrigger value="fluids">Fluid Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="medication">
          <MedicationCalculator />
        </TabsContent>
        
        <TabsContent value="fluids">
          <FluidCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculator;
