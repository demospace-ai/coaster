import { useCallback } from "react";
import { sendRequest } from "src/rpc/ajax";
import { Analysis, AnalysisType, CreateAnalysis, CreateAnalysisRequest } from "src/rpc/api";

export const useCreateAnalysis = () => {
  // TODO: what should we do if no default connection ID is configured?
  return useCallback(async (analysisType: AnalysisType, defaultConnectionID?: number, defaultEventSetID?: number): Promise<Analysis | undefined> => {
    const payload: CreateAnalysisRequest = {
      connection_id: defaultConnectionID,
      event_set_id: defaultEventSetID,
      analysis_type: analysisType,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const analysis = await sendRequest(CreateAnalysis, payload);
      return analysis;
    } catch (e) {
      // TODO: handle error here
    }
  }, []);
};