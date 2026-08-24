/** Shared return contract every collector produces, regardless of source type. */
export type CollectorResult<Row> = {
  rows: Row[];
  sourceUrl: string;
  snapshot: ArrayBuffer;
  collectedAt: string;
  collectorName: string;
};
