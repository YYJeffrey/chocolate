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
 * @param str 时间字符串
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

/**
 * 数字位数补全
 * @param number 需要补全的数字
 * @param bit 补全为几位小数
 */
function changeDecimalAddZero(number, bit) {
  const f = parseFloat(number);
  if (isNaN(f)) {
    return 0;
  }
  let s = number.toString();
  let pos_decimal = s.indexOf('.');

  if (pos_decimal == -1) {
    pos_decimal = s.length;
    s += '.';
  }
  while (s.length <= pos_decimal + bit) {
    s += '0';
  }
  return s;
}

export default {
  isDealingDay,
  isDealingTime,
  isToday,
  changeDecimalAddZero
};
