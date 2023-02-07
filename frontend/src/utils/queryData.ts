import { QueryResult, Schema } from "src/rpc/api";

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

export const formatSchema = (schema: Schema): Schema => {
  return schema.map(columnSchema => {
    return {
      name: columnSchema.name.replaceAll("_", " "),
      type: columnSchema.type,
    };
  });
};