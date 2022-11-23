import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { FunnelResult, TrendSeries } from "src/utils/queryData";

type FunnelChartProps = {
  funnelData: FunnelResult[];
};

export const FunnelChart: React.FC<FunnelChartProps> = ({ funnelData }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart className="tw-mx-auto" data={funnelData} margin={{ top: 25, right: 50, left: 0, bottom: 0 }} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" height={30} dy={5} />
        <YAxis ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={tick => tick + "%"} domain={[0, 100]} allowDataOverflow={true} />
        <RechartTooltip wrapperClassName='tw-rounded' labelClassName='tw-pb-1 tw-font-bold' content={<FunnelTooltip />} />
        <Bar dataKey="percentage" fill="#639f63" background={{ fill: '#eee' }} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const FunnelTooltip: React.FC<any> = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="tw-bg-white tw-p-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded">
        <p className="tw-font-bold tw-mb-1">{label}</p>
        <p className="tw-mb-1">percentage: {payload[0].payload.percentage}%</p>
        <p className="tw-mb-1">count: {payload[0].payload.count}</p>
      </div>
    );
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