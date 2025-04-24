import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecommendations } from "@/lib/open-ai";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm text-xs">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary-foreground">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Insights() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });

  const { data: fertilityData, isLoading: isFertilityDataLoading } = useQuery({
    queryKey: ['/api/users/1/fertility-data'],
    enabled: !!user,
  });

  const { data: healthData, isLoading: isHealthDataLoading } = useQuery({
    queryKey: ['/api/users/1/health-data'],
    enabled: !!user,
  });
  
  // Load AI recommendations
  const loadRecommendations = async () => {
    if (!user) return;
    
    setIsLoadingRecommendations(true);
    try {
      let prompt = user.pregnancyStatus 
        ? `Generate health recommendations for a pregnant woman in week ${user.pregnancyWeek}.`
        : "Generate fertility health recommendations for a woman tracking her menstrual cycle.";
      
      const recs = await getRecommendations(prompt);
      setRecommendations(recs);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Could not load personalized recommendations. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  // Prepare temperature chart data
  const prepareTemperatureData = () => {
    if (!fertilityData || fertilityData.length === 0) return [];
    
    return fertilityData
      .filter(entry => entry.basalBodyTemperature)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temperature: parseFloat(entry.basalBodyTemperature || "0"),
        ovulation: entry.ovulationTestResult
      }));
  };
  
  // Prepare health trends data
  const prepareHealthData = () => {
    if (!healthData || healthData.length === 0) return { latest: [], trends: [] };
    
    // Get latest health data for each category
    const categoriesData = {};
    
    healthData.forEach(entry => {
      const entryDate = new Date(entry.date).getTime();
      
      if (!categoriesData[entry.category] || 
          entryDate > new Date(categoriesData[entry.category].date).getTime()) {
        categoriesData[entry.category] = entry;
      }
    });
    
    const latest = Object.values(categoriesData);
    
    // Prepare trend data for each category
    const categoryTypes = ['hydration', 'sleep', 'exercise', 'nutrition'];
    const trends = categoryTypes.map(category => {
      const categoryData = healthData
        .filter(entry => entry.category === category)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7); // Get last 7 entries for trend
      
      return {
        category,
        data: categoryData.map(entry => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: entry.value
        }))
      };
    });
    
    return { latest, trends };
  };
  
  // Prepare cycle analysis data
  const prepareCycleAnalysis = () => {
    if (!fertilityData || fertilityData.length === 0) return { 
      mucusTypes: [], 
      ovulationStats: { positive: 0, negative: 0 } 
    };
    
    // Count mucus types
    const mucusCount = fertilityData.reduce((acc, entry) => {
      if (entry.cervicalMucus) {
        acc[entry.cervicalMucus] = (acc[entry.cervicalMucus] || 0) + 1;
      }
      return acc;
    }, {});
    
    const mucusTypes = Object.keys(mucusCount).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: mucusCount[type]
    }));
    
    // Count ovulation test results
    const positiveTests = fertilityData.filter(entry => entry.ovulationTestResult).length;
    const negativeTests = fertilityData.filter(entry => entry.ovulationTestResult === false).length;
    
    return {
      mucusTypes,
      ovulationStats: { 
        positive: positiveTests, 
        negative: negativeTests 
      }
    };
  };
  
  const isLoading = isUserLoading || isFertilityDataLoading || isHealthDataLoading;
  const temperatureData = prepareTemperatureData();
  const { latest: latestHealthData, trends: healthTrends } = prepareHealthData();
  const { mucusTypes, ovulationStats } = prepareCycleAnalysis();
  
  const COLORS = ['#D8C6F0', '#FFCDB2', '#FFAFCC', '#A9D6AF'];
  
  // Load recommendations when user data is available
  React.useEffect(() => {
    if (user && recommendations.length === 0 && !isLoadingRecommendations) {
      loadRecommendations();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-white">
        <Header />
        
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
          <Skeleton className="h-12 w-60 mb-4" />
          <Skeleton className="h-6 w-40 mb-8" />
          
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-72" />
            <Skeleton className="h-96" />
          </div>
        </main>
        
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-white">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
        <div className="mb-8">
          <h2 className="font-lora text-2xl md:text-3xl font-semibold text-neutral-dark mb-2">Insights & Analysis</h2>
          <p className="text-neutral-medium font-poppins">Track your health trends and receive personalized insights</p>
        </div>
        
        {/* Health Dashboard */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <CardTitle>Health Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {latestHealthData.map((item: any) => (
                <div key={item.id} className={`rounded-lg p-4 ${
                  item.category === 'hydration' ? 'bg-primary-light' :
                  item.category === 'sleep' ? 'bg-secondary-light' :
                  item.category === 'exercise' ? 'bg-accent-light' : 'bg-status-success'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className="bg-white p-2 rounded-full mr-3">
                      <i className={`ri-${
                        item.category === 'hydration' ? 'water-flash-line' :
                        item.category === 'sleep' ? 'rest-time-line' :
                        item.category === 'exercise' ? 'heart-pulse-line' : 'nutrition-line'
                      } text-primary-dark text-lg`}></i>
                    </div>
                    <h3 className="font-medium capitalize">{item.category}</h3>
                  </div>
                  <div className="progress-bar w-full h-2 mb-1">
                    <div className="progress-value" style={{ width: `${item.value}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">{item.value}%</span>
                    <span className="text-xs text-neutral-medium">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Weekly Trends</h4>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" allowDuplicatedCategory={false} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {healthTrends.map((s, i) => (
                      <Line 
                        key={s.category} 
                        data={s.data} 
                        dataKey="value" 
                        name={s.category.charAt(0).toUpperCase() + s.category.slice(1)} 
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        animationDuration={750}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Cycle and Fertility Analysis */}
        {!user.pregnancyStatus && (
          <Card className="shadow-soft mb-6">
            <CardHeader>
              <CardTitle>Cycle & Fertility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="temperature">
                <TabsList className="mb-4">
                  <TabsTrigger value="temperature">Temperature Chart</TabsTrigger>
                  <TabsTrigger value="patterns">Fertility Patterns</TabsTrigger>
                </TabsList>
                
                <TabsContent value="temperature">
                  {temperatureData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={temperatureData}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[35.5, 37.5]} ticks={[35.5, 36.0, 36.5, 37.0, 37.5]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            name="BBT (°C)"
                            stroke="#D8C6F0" 
                            strokeWidth={2}
                            dot={({ payload }) => (
                              <svg>
                                <circle 
                                  cx={0} 
                                  cy={0} 
                                  r={payload.ovulation ? 6 : 4}
                                  fill={payload.ovulation ? "#B69DE3" : "#D8C6F0"} 
                                  stroke="white"
                                  strokeWidth={1}
                                />
                              </svg>
                            )}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center mt-4 text-xs text-neutral-medium">
                        <div className="flex items-center mx-2">
                          <span className="inline-block w-3 h-3 bg-primary-dark rounded-full mr-1"></span>
                          <span>Positive Ovulation Test</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p>No temperature data available yet.</p>
                      <p className="text-sm text-neutral-medium mt-2">
                        Record your basal body temperature daily for fertility insights.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="patterns">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cervical Mucus Distribution */}
                    <div>
                      <h4 className="font-medium text-center mb-2">Cervical Mucus Patterns</h4>
                      {mucusTypes.length > 0 ? (
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={mucusTypes}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {mucusTypes.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-60 border rounded-lg">
                          <p className="text-neutral-medium">No cervical mucus data recorded</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Ovulation Test Results */}
                    <div>
                      <h4 className="font-medium text-center mb-2">Ovulation Test Results</h4>
                      {ovulationStats.positive > 0 || ovulationStats.negative > 0 ? (
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { name: "Positive", value: ovulationStats.positive },
                                { name: "Negative", value: ovulationStats.negative }
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" name="Tests" fill="#D8C6F0" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-60 border rounded-lg">
                          <p className="text-neutral-medium">No ovulation test data recorded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
        
        {/* AI Recommendations */}
        <Card className="shadow-soft mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personalized Recommendations</CardTitle>
            <button 
              onClick={loadRecommendations}
              className="text-sm text-primary-foreground"
              disabled={isLoadingRecommendations}
            >
              <i className="ri-refresh-line mr-1"></i>
              Refresh
            </button>
          </CardHeader>
          <CardContent>
            {isLoadingRecommendations ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                <p className="text-neutral-medium">Loading personalized recommendations...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium mb-2">{rec.title}</h4>
                    <p className="text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-neutral-medium mb-2">No recommendations available</p>
                <p className="text-sm">Click refresh to get personalized suggestions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
