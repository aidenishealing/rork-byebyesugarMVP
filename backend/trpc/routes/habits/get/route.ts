import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({
    userId: z.string(),
    date: z.string().optional(),
  }))
  .query(async ({ input }) => {
    // In a real app, this would fetch from a database
    // For now, we'll just return mock data
    
    // If a specific date is requested
    if (input.date) {
      return {
        date: input.date,
        weightCheck: "yes",
        morningAcvWater: "yes",
        championWorkout: "yes",
        meal10am: "Protein smoothie with berries",
        hungerTimes: "noon and 6pm",
        outdoorTime: "45 minute walk",
        energyLevel2pm: 8,
        meal6pm: "Grilled salmon with vegetables",
        energyLevel8pm: 7,
        wimHof: "yes",
        trackedSleep: "yes",
        dayDescription: "Had an important meeting in the morning, then worked from home. Felt energetic all day."
      };
    }
    
    // Otherwise return all habits for this user
    return {
      habits: {
        "2023-06-15": {
          date: "2023-06-15",
          weightCheck: "yes",
          morningAcvWater: "yes",
          championWorkout: "yes",
          meal10am: "Protein smoothie with berries",
          hungerTimes: "noon and 6pm",
          outdoorTime: "45 minute walk",
          energyLevel2pm: 8,
          meal6pm: "Grilled salmon with vegetables",
          energyLevel8pm: 7,
          wimHof: "yes",
          trackedSleep: "yes",
          dayDescription: "Had an important meeting in the morning, then worked from home. Felt energetic all day."
        },
        "2023-06-14": {
          date: "2023-06-14",
          weightCheck: "yes",
          morningAcvWater: "no",
          championWorkout: "yes",
          meal10am: "Avocado toast",
          hungerTimes: "1pm and 8pm",
          outdoorTime: "30 minute jog",
          energyLevel2pm: 6,
          meal6pm: "Chicken salad",
          energyLevel8pm: 8,
          wimHof: "no",
          trackedSleep: "yes",
          dayDescription: "Traveling for work, had to adjust my routine but managed to stay on track."
        }
      }
    };
  });