/**
 * 是否为交易日
 */
function isDealingDay() {
  const date = new Date();
  const day = date.getDay();

  if (day !== 0 && day !== 6) {
    return true;
  }
  return false;
}

/**
 * 是否为交易时间
 */
function isDealingTime() {
  const date = new Date();

  if (isDealingDay()) {
    const startAMTime = new Date(new Date().setHours(9, 30, 0, 0));
    const endAMTime = new Date(new Date().setHours(11, 30, 0, 0));
    const startPMTime = new Date(new Date().setHours(13, 0, 0, 0));
    const endPMTime = new Date(new Date().setHours(15, 0, 0, 0));
    if ((date >= startAMTime && date <= endAMTime) || (date >= startPMTime && date <= endPMTime)) {
      return true;
    }
  }
  return false
}

/**
 * 是否是今天
 * @param {日期字符串} str 
 */
function isToday(str) {
  if (str == null) {
    return false
  }

  const d = new Date(str.replace(/-/g, "/"));
  const todaysDate = new Date();
  if (d.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
    return true;
  }
  return false;
}

export default {
  isDealingDay,
  isDealingTime,
  isToday
};
