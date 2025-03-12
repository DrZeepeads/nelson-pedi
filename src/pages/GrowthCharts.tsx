
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  LineChart as LineChartIcon, 
  Info, 
  Plus,
  Save
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// WHO Weight-for-age percentiles (0-24 months, boys)
const weightForAgeData = [
  {
    ageMonths: 0,
    p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.7, p97: 4.0
  },
  {
    ageMonths: 3,
    p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.2, p97: 7.8
  },
  {
    ageMonths: 6,
    p3: 6.4, p15: 7.1, p50: 8.0, p85: 9.0, p97: 9.7
  },
  {
    ageMonths: 9,
    p3: 7.4, p15: 8.2, p50: 9.2, p85: 10.3, p97: 11.1
  },
  {
    ageMonths: 12,
    p3: 8.1, p15: 9.0, p50: 10.1, p85: 11.3, p97: 12.2
  },
  {
    ageMonths: 15,
    p3: 8.7, p15: 9.7, p50: 10.9, p85: 12.2, p97: 13.2
  },
  {
    ageMonths: 18,
    p3: 9.2, p15: 10.2, p50: 11.5, p85: 12.9, p97: 14.0
  },
  {
    ageMonths: 21,
    p3: 9.7, p15: 10.7, p50: 12.1, p85: 13.6, p97: 14.7
  },
  {
    ageMonths: 24,
    p3: 10.1, p15: 11.2, p50: 12.6, p85: 14.2, p97: 15.4
  }
];

// WHO Height-for-age percentiles (0-24 months, boys)
const heightForAgeData = [
  {
    ageMonths: 0,
    p3: 47.8, p15: 49.1, p50: 50.8, p85: 52.5, p97: 53.8
  },
  {
    ageMonths: 3,
    p3: 57.2, p15: 58.8, p50: 61.1, p85: 63.4, p97: 65.0
  },
  {
    ageMonths: 6,
    p3: 63.3, p15: 65.1, p50: 67.6, p85: 70.1, p97: 71.9
  },
  {
    ageMonths: 9,
    p3: 68.0, p15: 69.9, p50: 72.6, p85: 75.3, p97: 77.2
  },
  {
    ageMonths: 12,
    p3: 71.7, p15: 73.8, p50: 76.7, p85: 79.6, p97: 81.7
  },
  {
    ageMonths: 15,
    p3: 75.0, p15: 77.2, p50: 80.2, p85: 83.2, p97: 85.4
  },
  {
    ageMonths: 18,
    p3: 77.8, p15: 80.2, p50: 83.4, p85: 86.6, p97: 89.0
  },
  {
    ageMonths: 21,
    p3: 80.5, p15: 83.0, p50: 86.3, p85: 89.6, p97: 92.1
  },
  {
    ageMonths: 24,
    p3: 82.9, p15: 85.5, p50: 89.0, p85: 92.5, p97: 95.1
  }
];

// WHO Head Circumference-for-age percentiles (0-24 months, boys)
const hcForAgeData = [
  {
    ageMonths: 0,
    p3: 32.4, p15: 33.3, p50: 34.5, p85: 35.7, p97: 36.6
  },
  {
    ageMonths: 3,
    p3: 38.0, p15: 39.0, p50: 40.3, p85: 41.6, p97: 42.6
  },
  {
    ageMonths: 6,
    p3: 41.2, p15: 42.2, p50: 43.6, p85: 45.0, p97: 46.0
  },
  {
    ageMonths: 9,
    p3: 43.3, p15: 44.3, p50: 45.8, p85: 47.3, p97: 48.3
  },
  {
    ageMonths: 12,
    p3: 44.8, p15: 45.8, p50: 47.3, p85: 48.8, p97: 49.8
  },
  {
    ageMonths: 15,
    p3: 45.8, p15: 46.8, p50: 48.3, p85: 49.8, p97: 50.8
  },
  {
    ageMonths: 18,
    p3: 46.5, p15: 47.6, p50: 49.1, p85: 50.6, p97: 51.7
  },
  {
    ageMonths: 21,
    p3: 47.1, p15: 48.2, p50: 49.7, p85: 51.2, p97: 52.3
  },
  {
    ageMonths: 24,
    p3: 47.6, p15: 48.7, p50: 50.2, p85: 51.7, p97: 52.8
  }
];

// Patient data type
interface PatientMeasurement {
  ageMonths: number;
  weight?: number; // in kg
  height?: number; // in cm
  headCircumference?: number; // in cm
}

const GrowthCharts = () => {
  const [patientData, setPatientData] = useState<PatientMeasurement[]>([]);
  const [currentGender, setCurrentGender] = useState("male");
  const [newMeasurement, setNewMeasurement] = useState<PatientMeasurement>({
    ageMonths: 0,
  });
  const { toast } = useToast();

  // Add a new measurement to the patient data
  const addMeasurement = () => {
    // Validate inputs
    if (
      newMeasurement.ageMonths === undefined ||
      (newMeasurement.weight === undefined && 
       newMeasurement.height === undefined && 
       newMeasurement.headCircumference === undefined)
    ) {
      toast({
        title: "Incomplete measurement",
        description: "Please provide age and at least one measurement",
        variant: "destructive",
      });
      return;
    }

    // Check if age already exists in measurements
    const existingIndex = patientData.findIndex(
      (data) => data.ageMonths === newMeasurement.ageMonths
    );

    if (existingIndex !== -1) {
      // Update existing measurement
      const updatedData = [...patientData];
      updatedData[existingIndex] = {
        ...updatedData[existingIndex],
        ...newMeasurement
      };
      setPatientData(updatedData);
      
      toast({
        title: "Measurement updated",
        description: `Updated measurements for age ${newMeasurement.ageMonths} months`
      });
    } else {
      // Add new measurement
      setPatientData((prev) => [...prev, { ...newMeasurement }]);
      
      toast({
        title: "Measurement added",
        description: `Added new measurements for age ${newMeasurement.ageMonths} months`
      });
    }

    // Reset form
    setNewMeasurement({ ageMonths: 0 });
  };

  // Get patient's percentile for a specific measurement
  const getPercentile = (age: number, value: number, chartData: typeof weightForAgeData, dataKey: string) => {
    // Find the closest age in reference data
    const ageData = chartData.reduce((prev, curr) => 
      Math.abs(curr.ageMonths - age) < Math.abs(prev.ageMonths - age) ? curr : prev
    );

    // Determine percentile
    if (value < ageData.p3) return "< 3rd";
    if (value < ageData.p15) return "3rd-15th";
    if (value < ageData.p50) return "15th-50th";
    if (value < ageData.p85) return "50th-85th";
    if (value < ageData.p97) return "85th-97th";
    return "> 97th";
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{`Age: ${label} months`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pediatric Growth Charts</h1>
      
      <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Growth Charts
            </CardTitle>
            <CardDescription>WHO growth standards for infants and children</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="gender" className="w-24">Gender:</Label>
                <Select value={currentGender} onValueChange={setCurrentGender}>
                  <SelectTrigger id="gender" className="w-[180px]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Tabs defaultValue="weight" className="w-full">
                <TabsList>
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="height">Height/Length</TabsTrigger>
                  <TabsTrigger value="head">Head Circumference</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weight" className="pt-4">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={weightForAgeData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="ageMonths" 
                          label={{ value: 'Age (months)', position: 'insideBottomRight', offset: -5 }} 
                        />
                        <YAxis 
                          label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="p3" 
                          stroke="#8884d8" 
                          name="3rd percentile" 
                          strokeDasharray="5 5" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p15" 
                          stroke="#82ca9d" 
                          name="15th percentile" 
                          strokeDasharray="3 3" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p50" 
                          stroke="#ff7300" 
                          name="50th percentile" 
                          strokeWidth={2} 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p85" 
                          stroke="#0088FE" 
                          name="85th percentile" 
                          strokeDasharray="3 3" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p97" 
                          stroke="#FF0000" 
                          name="97th percentile" 
                          strokeDasharray="5 5" 
                          dot={false}
                        />
                        
                        {/* Patient data plotting */}
                        {patientData.length > 0 && (
                          <Line
                            data={patientData.filter(d => d.weight !== undefined)}
                            type="monotone"
                            dataKey="weight"
                            stroke="#000000"
                            strokeWidth={2}
                            name="Patient"
                            activeDot={{ r: 8 }}
                            dot={{ r: 6 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="height" className="pt-4">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={heightForAgeData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="ageMonths" 
                          label={{ value: 'Age (months)', position: 'insideBottomRight', offset: -5 }} 
                        />
                        <YAxis 
                          label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} 
                          domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="p3" 
                          stroke="#8884d8" 
                          name="3rd percentile" 
                          strokeDasharray="5 5" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p15" 
                          stroke="#82ca9d" 
                          name="15th percentile" 
                          strokeDasharray="3 3" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p50" 
                          stroke="#ff7300" 
                          name="50th percentile" 
                          strokeWidth={2} 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p85" 
                          stroke="#0088FE" 
                          name="85th percentile" 
                          strokeDasharray="3 3" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p97" 
                          stroke="#FF0000" 
                          name="97th percentile" 
                          strokeDasharray="5 5" 
                          dot={false}
                        />
                        
                        {/* Patient data plotting */}
                        {patientData.length > 0 && (
                          <Line
                            data={patientData.filter(d => d.height !== undefined)}
                            type="monotone"
                            dataKey="height"
                            stroke="#000000"
                            strokeWidth={2}
                            name="Patient"
                            activeDot={{ r: 8 }}
                            dot={{ r: 6 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="head" className="pt-4">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={hcForAgeData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="ageMonths" 
                          label={{ value: 'Age (months)', position: 'insideBottomRight', offset: -5 }} 
                        />
                        <YAxis 
                          label={{ value: 'Head Circumference (cm)', angle: -90, position: 'insideLeft' }} 
                          domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="p3" 
                          stroke="#8884d8" 
                          name="3rd percentile" 
                          strokeDasharray="5 5" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p15" 
                          stroke="#82ca9d" 
                          name="15th percentile" 
                          strokeDasharray="3 3" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p50" 
                          stroke="#ff7300" 
                          name="50th percentile" 
                          strokeWidth={2} 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p85" 
                          stroke="#0088FE" 
                          name="85th percentile" 
                          strokeDasharray="3 3" 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="p97" 
                          stroke="#FF0000" 
                          name="97th percentile" 
                          strokeDasharray="5 5" 
                          dot={false}
                        />
                        
                        {/* Patient data plotting */}
                        {patientData.length > 0 && (
                          <Line
                            data={patientData.filter(d => d.headCircumference !== undefined)}
                            type="monotone"
                            dataKey="headCircumference"
                            stroke="#000000"
                            strokeWidth={2}
                            name="Patient"
                            activeDot={{ r: 8 }}
                            dot={{ r: 6 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Measurement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (months)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="24"
                    value={newMeasurement.ageMonths}
                    onChange={(e) => setNewMeasurement({
                      ...newMeasurement,
                      ageMonths: Number(e.target.value)
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Optional"
                    value={newMeasurement.weight || ""}
                    onChange={(e) => setNewMeasurement({
                      ...newMeasurement,
                      weight: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Height/Length (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="Optional"
                    value={newMeasurement.height || ""}
                    onChange={(e) => setNewMeasurement({
                      ...newMeasurement,
                      height: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="head">Head Circumference (cm)</Label>
                  <Input
                    id="head"
                    type="number"
                    step="0.1"
                    placeholder="Optional"
                    value={newMeasurement.headCircumference || ""}
                    onChange={(e) => setNewMeasurement({
                      ...newMeasurement,
                      headCircumference: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
                
                <Button className="w-full" onClick={addMeasurement}>
                  Add Measurement
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              {patientData.length === 0 ? (
                <p className="text-muted-foreground">No measurements added yet</p>
              ) : (
                <div className="space-y-4">
                  {patientData
                    .sort((a, b) => a.ageMonths - b.ageMonths)
                    .map((measurement, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <h4 className="font-medium">{measurement.ageMonths} months</h4>
                        <div className="space-y-1 mt-2 text-sm">
                          {measurement.weight !== undefined && (
                            <div className="flex justify-between">
                              <span>Weight:</span>
                              <span className="font-medium">
                                {measurement.weight.toFixed(1)} kg 
                                <span className="text-muted-foreground ml-2">
                                  ({getPercentile(measurement.ageMonths, measurement.weight, weightForAgeData, 'weight')})
                                </span>
                              </span>
                            </div>
                          )}
                          
                          {measurement.height !== undefined && (
                            <div className="flex justify-between">
                              <span>Height:</span>
                              <span className="font-medium">
                                {measurement.height.toFixed(1)} cm
                                <span className="text-muted-foreground ml-2">
                                  ({getPercentile(measurement.ageMonths, measurement.height, heightForAgeData, 'height')})
                                </span>
                              </span>
                            </div>
                          )}
                          
                          {measurement.headCircumference !== undefined && (
                            <div className="flex justify-between">
                              <span>Head:</span>
                              <span className="font-medium">
                                {measurement.headCircumference.toFixed(1)} cm
                                <span className="text-muted-foreground ml-2">
                                  ({getPercentile(measurement.ageMonths, measurement.headCircumference, hcForAgeData, 'headCircumference')})
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                  <Button className="w-full" variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save Patient Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground flex items-start mt-2">
        <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <span>
          Growth charts are based on WHO Child Growth Standards. For clinical use, always verify with official growth charts and consult with a healthcare provider.
        </span>
      </div>
    </div>
  );
};

export default GrowthCharts;
