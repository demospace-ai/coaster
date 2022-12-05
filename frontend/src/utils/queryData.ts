import { QueryResult, ResultRow, Schema } from "src/rpc/api";

export type TrendSeries = {
  name: string,
  data: TrendResultData[],
};

export type TrendResultData = {
  date: string,
  count: number,
};

export const convertTrendData = (breakdownResult: QueryResult): TrendSeries[] => {
  return breakdownResult.data.map(eventData => {
    const data: TrendResultData[] = [];
    // Start at index 1 since first column is the event name
    for (let i = 1; i < eventData.length; i++) {
      data.push({ date: breakdownResult.schema[i].name, count: eventData[i] as number });
    }

    // First column is the event name in the breakdown data
    const series: TrendSeries = { name: eventData[0] as string, data: data };

    return series;
  });
};

export const toTrendBreakdown = (results: QueryResult[]): QueryResult => {
  const { minDate, maxDate } = getDateRange(results);
  const range: Date[] = [];
  for (let d = new Date(minDate); d.getTime() <= maxDate.getTime(); d.setTime(d.getTime() + 86400000)) {
    range.push(new Date(d));
  }

  const schema: Schema = [{ name: "Event", type: "string" }, ...range.map(d => ({ name: getDateStringInUTC(d), type: "string" }))];
  const data: ResultRow[] = [];

  results.forEach(result => {
    const dataMap: Map<string, Map<number, number>> = new Map(result.data.map(row => {
      return [
        row[3] as string, // The fourth column should be the group by key
        new Map(),
      ];
    }));

    result.data.forEach(row => {
      dataMap.get(row[3] as string)?.set(new Date(row[2]).getTime(), row[1] as number);
    });

    const seriesList: ResultRow[] = [];
    dataMap.forEach((value, key) => {
      // All the rows should have the event name as the first column
      const eventName = result.data[0][0];
      // Key will be undefined if this result set doesn't have a breakdown
      const breakdownKey = key ? " (" + key + ")" : "";
      const series: ResultRow = [eventName + breakdownKey];
      range.forEach(d => {
        series.push(value.get(d.getTime()) || 0);
      });
      seriesList.push(series);
    });

    data.push(...seriesList);
  });

  return { success: true, error_message: "", schema: schema, data: data };
};

export type DateRange = {
  minDate: Date,
  maxDate: Date,
};

export const getDateRange = (results: QueryResult[]): DateRange => {
  // Min and max dates per RFC: http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1
  // TODO: use the date range specified in the query itself
  let minDate: Date = new Date(8640000000000000);
  let maxDate: Date = new Date(-8640000000000000);
  results.forEach(result => {
    result.data.forEach(row => {
      const date = new Date(row[2]);
      if (date < minDate) {
        minDate = date;
      }

      if (date > maxDate) {
        maxDate = date;
      }
    });
  });

  return { minDate, maxDate };
};

export const getDateStringInUTC = (d: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getUTCMonth()] + " " + d.getUTCDate() + " " + d.getUTCFullYear();
};

export interface FunnelResult {
  stepResults: FunnelStepResult[];
  breakdownValues: string[];
}

export interface FunnelStepResult extends Record<string, any> {
  name: string,
  count?: number,
  percentage?: number,
};

export type BreakdownResult = {
  name: string,
  count: number,
  percentage: number,
};

export const convertFunnelData = (results: QueryResult): FunnelResult => {
  const breakdown = results.schema.length > 4;
  const dataMap: Map<number, FunnelStepResult> = new Map(results.data.map(result => {
    return [result[2] as number, { name: result[1] as string, breakdown: [] }];
  }));

  results.data.forEach(result => {
    const data = dataMap.get(result[2] as number);
    if (data === undefined) {
      return;
    }

    if (breakdown) {
      data[result[4]] = {
        count: result[0] as number,
        percentage: +((result[3] as number) * 100).toFixed(2),
      };
    } else {
      data.count = result[0] as number;
      data.percentage = +((result[3] as number) * 100).toFixed(2);
    }
  });

  return {
    stepResults: Array.from(dataMap.values()),
    breakdownValues: breakdown ? Array.from(new Set(results.data.map(result => result[4] as string))) : [],
  };
};