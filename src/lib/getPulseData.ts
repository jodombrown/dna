import { metricsService } from "@/services/metricsService";

export const getPulseData = async ({ userId, useFake = false }) => {
  return await metricsService.getPulsePreview(userId, useFake);
};