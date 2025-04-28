import { apiRequest } from "./queryClient";

type Recommendation = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
};

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function getRecommendations(prompt: string): Promise<Recommendation[]> {
  try {
    // In a real implementation, this would call the OpenAI API directly
    // For this demo, we'll make a simulated request to our backend
    // which would handle the actual OpenAI API call
    
    const response = await apiRequest("POST", "/api/analyze-document", {
      image: null, // We're not analyzing an image
      prompt: prompt
    });
    
    // Simulate AI recommendations for demo purposes
    const demoRecommendations: Recommendation[] = [
      {
        title: "Stay Hydrated",
        description: "Aim for 8-10 glasses of water daily. Staying well-hydrated helps maintain amniotic fluid levels and supports your body's increased blood volume during pregnancy.",
        priority: "high"
      },
      {
        title: "Gentle Movement",
        description: "Incorporate 30 minutes of gentle activity like walking, swimming, or prenatal yoga most days of the week to improve circulation and manage weight gain.",
        priority: "medium"
      },
      {
        title: "Nutrient-Rich Foods",
        description: "Focus on iron-rich foods like leafy greens, beans, and lean meats to support blood volume expansion and your baby's development.",
        priority: "high"
      },
      {
        title: "Sleep Position",
        description: "Try sleeping on your left side to improve circulation to your heart, kidneys, and uterus, which enhances blood flow and nutrient delivery to your baby.",
        priority: "medium"
      },
      {
        title: "Mindfulness Practice",
        description: "Spend 10 minutes daily on mindfulness meditation or deep breathing exercises to reduce stress hormones that can affect both you and your baby.",
        priority: "low"
      }
    ];
    
    return demoRecommendations;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw new Error("Failed to get recommendations");
  }
}

export async function analyzeSentiment(text: string): Promise<{
  mood: string;
  suggestions: string[];
}> {
  try {
    // In a real implementation, this would call the OpenAI API
    // For this demo, we'll make a simulated request
    
    const response = await apiRequest("POST", "/api/analyze-document", {
      image: null,
      text: text
    });
    
    // Simulate sentiment analysis for demo purposes
    return {
      mood: text.toLowerCase().includes("happy") || text.toLowerCase().includes("excited") 
        ? "positive" 
        : text.toLowerCase().includes("worried") || text.toLowerCase().includes("anxious")
        ? "concerned"
        : "neutral",
      suggestions: [
        "Try keeping a gratitude journal to focus on positive aspects of your journey",
        "Consider joining a community of expectant mothers for support and shared experiences",
        "Speak with your healthcare provider about any concerns you have"
      ]
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw new Error("Failed to analyze sentiment");
  }
}

export async function generateHealthTips(category: 'hydration' | 'sleep' | 'exercise' | 'nutrition', pregnancyWeek?: number): Promise<string[]> {
  try {
    // In a real implementation, this would call the OpenAI API
    // For this demo, we'll return static responses
    
    const healthTips: { [key: string]: string[] } = {
      hydration: [
        "Start your day with a glass of water before anything else",
        "Use a marked water bottle to track your daily intake",
        "Add natural flavors like lemon or cucumber to make water more appealing",
        "Eat water-rich fruits and vegetables like watermelon and celery"
      ],
      sleep: [
        "Use pillows to support your belly and back while sleeping",
        "Maintain a consistent sleep schedule",
        "Avoid screens an hour before bedtime",
        "Create a relaxing bedtime routine with gentle stretching or reading"
      ],
      exercise: [
        "Take short walks after meals to aid digestion",
        "Try prenatal yoga classes designed for your trimester",
        "Swimming provides excellent low-impact exercise that reduces joint pressure",
        "Perform pelvic floor exercises (Kegels) throughout the day"
      ],
      nutrition: [
        "Include a source of protein with every meal",
        "Eat smaller, more frequent meals if experiencing nausea",
        "Choose complex carbohydrates for sustained energy",
        "Include omega-3 rich foods like walnuts and flaxseeds for baby's brain development"
      ]
    };

    return healthTips[category] || [
      "Consult with your healthcare provider for personalized recommendations",
      "Keep track of your symptoms and discuss any concerns at your next appointment",
      "Join pregnancy support groups to connect with others at the same stage"
    ];
  } catch (error) {
    console.error("Error generating health tips:", error);
    throw new Error("Failed to generate health tips");
  }
}
