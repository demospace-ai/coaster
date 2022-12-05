import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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
      <div className="tw-flex tw-flex-row tw-items-center">
        <span className="tw-font-bold">{props.panel.title}</span>
      </div>
      <AnalysisPanel analysisID={props.panel.analysis_id!} />
    </div>
  );
};

type AnalysisPanelProps = {
  analysisID: number;
};

export const AnalysisPanel: React.FC<AnalysisPanelProps> = props => {
  const { analysis } = useAnalysis(props.analysisID.toString());
  let panel: React.ReactElement;
  let link: string;
  switch (analysis?.analysis_type) {
    case AnalysisType.Trend:
      panel = <TrendPanel analysis={analysis} />;
      link = `/trend/${analysis.id}`;
      break;
    case AnalysisType.Funnel:
      panel = <FunnelPanel analysis={analysis} />;
      link = `/funnel/${analysis.id}`;
      break;
    default:
      return <></>;
  }

  return (
    <>
      <NavLink to={link}><ArrowTopRightOnSquareIcon className="tw-h-4 tw-ml-3 tw-cursor-pointer" /></NavLink>
      {panel}
    </>
  );
};

export const FunnelPanel: React.FC<{ analysis: Analysis; }> = props => {
  const { funnelResults } = useFunnelResults(props.analysis);
  const [funnelData, setFunnelData] = useState<FunnelResult | undefined>(undefined);
  useEffect(() => {
    if (funnelResults) {
      setFunnelData(convertFunnelData(funnelResults));
    }
  }, [funnelResults]);

  if (!funnelData) {
    return <Loading />;
  }

  return (
    <FunnelChart funnelData={funnelData} breakdown={props.analysis.breakdown !== undefined} />
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