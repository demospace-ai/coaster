import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis } from "recharts";
import { Loading } from "src/components/loading/Loading";
import { Analysis, AnalysisType, DashboardPanel } from "src/rpc/api";
import { useAnalysis, useFunnelResults, useTrendResults } from "src/rpc/data";
import { convertFunnelData, convertTrendData, FunnelResult, toTrendBreakdown, TrendSeries } from "src/utils/queryData";

type PanelProps = {
  panel: DashboardPanel;
};

export const Panel: React.FC<PanelProps> = props => {
  return (
    <div>
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
    <div className='tw-overflow-scroll'>
      <BarChart className="tw-mx-auto" data={funnelData} margin={{ top: 25, right: 30, left: 0, bottom: 0 }} width={Math.max(300 * funnelData.length, 900)} height={320}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" height={30} dy={5} />
        <YAxis ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={tick => tick + "%"} domain={[0, 100]} allowDataOverflow={true} />
        <RechartTooltip wrapperClassName='tw-rounded' labelClassName='tw-pb-1 tw-font-bold' />
        <Bar dataKey="percentage" barSize={200} fill="#639f63" background={{ fill: '#eee' }} radius={[5, 5, 0, 0]} />
        <Bar dataKey="count" barSize={0} />
      </BarChart>
    </div>
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
    <div className='tw-overflow-scroll'>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={trendData} margin={{ top: 20, right: 50, left: 10, bottom: 10 }} >
          <XAxis dataKey="date" height={30} allowDuplicatedCategory={false} minTickGap={30} dy={5} />
          <YAxis dataKey="count" />
          <RechartTooltip wrapperClassName='tw-rounded' labelClassName='tw-pb-1 tw-font-bold' />
          {trendData.map((s) => (
            <Line dataKey="count" data={s.data} name={s.name} key={s.name} connectNulls={false} stroke="#639f63" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CustomQueryPanel: React.FC<{ analysis: Analysis; }> = props => {
  return <></>;
};