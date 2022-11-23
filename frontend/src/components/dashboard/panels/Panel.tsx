import { useEffect, useState } from "react";
import { FunnelChart, TrendChart } from "src/components/insight/Charts";
import { Loading } from "src/components/loading/Loading";
import { Analysis, AnalysisType, DashboardPanel } from "src/rpc/api";
import { useAnalysis, useFunnelResults, useTrendResults } from "src/rpc/data";
import { convertFunnelData, convertTrendData, FunnelResult, toTrendBreakdown, TrendSeries } from "src/utils/queryData";

type PanelProps = {
  panel: DashboardPanel;
};

export const Panel: React.FC<PanelProps> = props => {
  return (
    <div className="tw-mb-8">
      <span className="tw-font-bold">{props.panel.title}</span>
      <AnalysisPanel analysisID={props.panel.analysis_id!} />
    </div>
  );
};

type AnalysisPanelProps = {
  analysisID: number;
};

export const AnalysisPanel: React.FC<AnalysisPanelProps> = props => {
  const { analysis } = useAnalysis(props.analysisID.toString());
  switch (analysis?.analysis_type) {
    case AnalysisType.Trend:
      return <TrendPanel analysis={analysis} />;
    case AnalysisType.Funnel:
      return <FunnelPanel analysis={analysis} />;
    default:
      return <></>;
  }
};

export const FunnelPanel: React.FC<{ analysis: Analysis; }> = props => {
  const { funnelResults } = useFunnelResults(props.analysis);
  const [funnelData, setFunnelData] = useState<FunnelResult[]>([]);
  useEffect(() => {
    if (funnelResults) {
      setFunnelData(convertFunnelData(funnelResults));
    }
  }, [funnelResults]);

  if (!funnelResults) {
    return <Loading />;
  }

  return (
    <FunnelChart funnelData={funnelData} />
  );
};

export const TrendPanel: React.FC<{ analysis: Analysis; }> = props => {
  const { trendResults } = useTrendResults(props.analysis);
  const [trendData, setTrendData] = useState<TrendSeries[]>([]);
  useEffect(() => {
    if (trendResults) {
      const breakdown = toTrendBreakdown(trendResults);
      setTrendData(convertTrendData(breakdown));
    }
  }, [trendResults]);

  if (!trendResults) {
    return <Loading />;
  }

  return (
    <TrendChart trendData={trendData} />
  );
};

export const CustomQueryPanel: React.FC<{ analysis: Analysis; }> = props => {
  return <></>;
};