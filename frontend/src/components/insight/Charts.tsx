import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { FunnelResult, TrendSeries } from "src/utils/queryData";

type FunnelChartProps = {
  funnelData: FunnelResult;
  breakdown: boolean;
};

export const FunnelChart: React.FC<FunnelChartProps> = ({ funnelData, breakdown }) => {
  if (breakdown) {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart className="tw-mx-auto" data={funnelData.stepResults} margin={{ top: 25, right: 50, left: 0, bottom: 0 }} >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" height={30} dy={5} />
          <YAxis ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={tick => tick + "%"} domain={[0, 100]} allowDataOverflow={true} />
          <RechartTooltip wrapperClassName='tw-rounded' labelClassName='tw-pb-1 tw-font-bold' content={<FunnelTooltip breakdown />} shared={false} />
          {funnelData.breakdownValues.map(b => <Bar key={b} dataKey={b + ".percentage"} fill="#639f63" background={{ fill: '#eee' }} radius={[5, 5, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  } else {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart className="tw-mx-auto" data={funnelData.stepResults} margin={{ top: 25, right: 50, left: 0, bottom: 0 }} >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" height={30} dy={5} />
          <YAxis ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={tick => tick + "%"} domain={[0, 100]} allowDataOverflow={true} />
          <RechartTooltip wrapperClassName='tw-rounded' filterNull={false} labelClassName='tw-pb-1 tw-font-bold' content={<FunnelTooltip />} shared={false} />
          <Bar dataKey={"percentage"} fill="#639f63" background={{ fill: '#eee' }} radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
};

const FunnelTooltip: React.FC<any> = ({ active, payload, breakdown }: any) => {
  if (active && payload && payload.length > 0) {
    if (breakdown) {
      const group = payload[0].dataKey.split(".")[0];
      return (
        <div className="tw-bg-white tw-p-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded">
          <p className="tw-font-bold tw-mb-1">{payload[0].payload.name} • {group}</p>
          <p className="tw-mb-1">percentage: {payload[0].payload[group].percentage}%</p>
          <p className="tw-mb-1">count: {payload[0].payload[group].count}</p>
        </div>
      );
    } else {
      return (
        <div className="tw-bg-white tw-p-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded">
          <p className="tw-font-bold tw-mb-1">{payload[0].payload.name}</p>
          <p className="tw-mb-1">percentage: {payload[0].payload.percentage}%</p>
          <p className="tw-mb-1">count: {payload[0].payload.count}</p>
        </div>
      );
    }
  }

  return null;
};

type TrendChartProps = {
  trendData: TrendSeries[];
};

export const TrendChart: React.FC<TrendChartProps> = ({ trendData }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={trendData} margin={{ top: 20, right: 50, left: 0, bottom: 10 }} >
        <XAxis dataKey="date" height={30} allowDuplicatedCategory={false} minTickGap={30} dy={5} />
        <YAxis dataKey="count" />
        <RechartTooltip wrapperClassName='tw-rounded' labelClassName='tw-pb-1 tw-font-bold' />
        {trendData.map((s) => (
          <Line dataKey="count" data={s.data} name={s.name} key={s.name} connectNulls={false} stroke="#639f63" />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};