/**
 * 将金额拆分为 24 位数组，按照规则拆分并打乱顺序。
 * @param prizeAmount 奖项总金额
 * @returns 拆分后的 24 位数组
 */
export function getPrizeBreakdown(prizeAmount: number): number[] {
  if (prizeAmount <= 0) return new Array(24).fill(0);

  let parts: number[] = [];

  if (prizeAmount > 300) {
    // 拆分为 1000 的整数倍
    while (prizeAmount >= 1000) {
      parts.push(1000);
      prizeAmount -= 1000;
    }
    // 剩余部分
    if (prizeAmount > 0) {
      parts.push(prizeAmount);
    }
  } else {
    // 直接拆分为 24 位
    parts.push(prizeAmount);
    console.log("🚀 ~ getPrizeBreakdown ~ parts:", parts)
  }

  // 填充到 24 位，不足部分补 0
  while (parts.length < 24) {
    parts.push(0);
  }

  // 打乱数组顺序
  return shuffleArray(parts);
}

/**
 * 打乱数组顺序
 * @param array 原始数组
 * @returns 打乱顺序后的数组
 */
function shuffleArray(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
