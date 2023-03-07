//操作符
export const enum TrackOpTypes {
  GET,
}

export const enum TriggerOpTypes {
  ADD,
  SET,
}
export const haseChange = (value, oldvalue) => {
  return value == oldvalue;
};
