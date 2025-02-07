// constants/lottery.constants.ts
import { PrizeTier } from '../models/lotteryTicket.model';

/**
 * 定义各奖项的固定中奖积分
 * 一等奖：5200积分
 * 二等奖：3000积分
 * 三等奖：1000积分
 * 四等奖：500积分
 * 五等奖：400积分
 * 六等奖：300积分
 * 七等奖：随机（此处设置为 0，实际在兑换时随机生成 1～200）
 */
export const FIXED_PRIZE_AMOUNT: Record<PrizeTier, number> = {
  [PrizeTier.FIRST]: 5200,
  [PrizeTier.SECOND]: 3000,
  [PrizeTier.THIRD]: 1000,
  [PrizeTier.FOURTH]: 500,
  [PrizeTier.FIFTH]: 400,
  [PrizeTier.SIXTH]: 300,
  [PrizeTier.SEVENTH]: 0,
};
