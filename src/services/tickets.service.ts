// services/lottery.service.ts
import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from '../models/user.model';
import { LotteryBook } from '../models/lotteryBook.model';
import { LotteryTicket, PrizeTier } from '../models/lotteryTicket.model';
import { FIXED_PRIZE_AMOUNT } from '../constants/tickets.constants';
import { getPrizeBreakdown } from '../utils/tickets.utils';
import cron from 'node-cron';
/**
 * 定义一个接口表示返回给前端的彩票信息
 */
export interface TicketDTO {
  id: number;
  lotteryBookId: number;
  prizeTier: PrizeTier;
  prizeAmount: number;
  breakdown?: number[] | null;
  scratched: boolean;
  scratchAt?: Date | null;
  winnerName?: string | null;
  winnerAvatar?: string | null;
}

export class LotteryService {
  constructor() {
    // 注册定时任务：每月 1 号 00:00 自动重置彩票
    cron.schedule('0 0 1 * *', async () => {
      console.log("🎰 每月彩票重置任务开始...");
      await this.generateNewBook();
      console.log("✅ 彩票重置完成！");
    });
  }
  /**
   * 生成新的彩票集：创建一条 LotteryBook 记录，
   * 然后生成 20 张 LotteryTicket 记录（一等奖～六等奖各 1 张，七等奖 14 张），
   * 同时保证整套彩票总积分至少 3000 分（不足则对七等奖补差）。
   * 最后将彩票顺序随机打乱。
   */
  async generateNewBook(): Promise<LotteryBook> {
    return await sequelize.transaction(async (t: Transaction) => {
      // 要把之前的状态都改为closed
      await LotteryBook.update({ status: 'closed' }, { where: { status: 'active' }, transaction: t });
      // 创建新的彩票集记录，状态设置为 'active'
      const book = await LotteryBook.create({ status: 'active' }, { transaction: t });
      const tickets: Partial<LotteryTicket>[] = [];

      // 添加一等奖到六等奖（各 1 张）
      for (let tier = PrizeTier.FIRST; tier <= PrizeTier.SIXTH; tier++) {
        tickets.push({
          lotteryBookId: book.id,
          prizeTier: tier,
          prizeAmount: FIXED_PRIZE_AMOUNT[tier],
          breakdown: getPrizeBreakdown(FIXED_PRIZE_AMOUNT[tier]),
          scratched: false,
        });
      }

      // 添加七等奖 14 张，每张随机 1～200
      for (let i = 0; i < 14; i++) {
        const amount = Math.floor(Math.random() * 200) + 1;
        tickets.push({
          lotteryBookId: book.id,
          prizeTier: PrizeTier.SEVENTH,
          breakdown: getPrizeBreakdown(amount),
          prizeAmount: amount,
          scratched: false,
        });
      }

      // 保底 3000 分：若总积分不足 3000，则对所有七等奖均摊补差
      const total = tickets.reduce((sum, ticket) => sum + (ticket.prizeAmount || 0), 0);
      if (total < 3000) {
        const deficit = 3000 - total;
        const sevenTickets = tickets.filter(ticket => ticket.prizeTier === PrizeTier.SEVENTH);
        const addPerTicket = Math.ceil(deficit / sevenTickets.length);
        sevenTickets.forEach(ticket => {
          ticket.prizeAmount! += addPerTicket;
        });
      }

      // 随机打乱数组顺序（Fisher-Yates 洗牌算法）
      for (let i = tickets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tickets[i], tickets[j]] = [tickets[j], tickets[i]];
      }

      // 批量创建彩票记录到数据库
      await LotteryTicket.bulkCreate(tickets, { transaction: t });
      return book;
    });
  }

  /**
   * 获取当前激活状态的彩票集对应的所有彩票
   */
  async getTickets(): Promise<TicketDTO[]> {
    // 查找状态为 active 的 LotteryBook（假设只有一套当前激活的彩票）
    let book = await LotteryBook.findOne({ where: { status: 'active' } });
    if (!book) {
      // 若不存在，则先生成一套新的彩票集
      book = await this.generateNewBook();
    }
    console.log("🚀 ~ LotteryService ~ getTickets ~ book:", book.id)
    const tickets = await LotteryTicket.findAll({ where: { lotteryBookId: book.id } });
    return tickets.map(ticket => ticket.toJSON() as TicketDTO);
  }

  /**
   * 用户兑换指定彩票接口：
   * 用户支付 300 积分后，可以指定兑换一张彩票（通过 ticketId）。
   * 若该彩票未被兑换，则将其标记为已兑换，记录刮奖时间及中奖用户信息，
   * 同时将中奖积分追加到用户积分中。整个过程在事务中执行。
   *
   * @param userId 用户ID
   * @param userAvatar 用户头像
   * @param userName 用户昵称
   * @param ticketId 指定要兑换的彩票ID
   * @returns 返回兑换后的彩票信息及更新后的用户积分
   */
  async exchangeTicketWithPoints(userId: number, userAvatar: string, userName: string, ticketId: number): Promise<{ ticket: TicketDTO; updatedPoints: number }> {
    return await sequelize.transaction(async (t: Transaction) => {
      // 查询用户记录
      const user = await User.findOne({ where: { id: userId }, transaction: t });
      if (!user) {
        throw new Error('用户不存在');
      }
      // 判断用户积分是否足够（兑换需扣 300 积分）
      if (user.points < 300) {
        throw new Error('积分不足');
      }

      // 查找指定的彩票
      const ticket = await LotteryTicket.findOne({ where: { id: ticketId }, transaction: t });
      if (!ticket) {
        throw new Error('指定的彩票不存在');
      }
      if (ticket.scratched) {
        throw new Error('该彩票已被兑换');
      }

      // 扣除用户 300 积分
      user.points -= 300;

      // 更新彩票状态：标记为已兑换，记录刮奖时间及中奖用户信息
      ticket.scratched = true;
      ticket.scratchAt = new Date();
      ticket.winnerAvatar = userAvatar;
      ticket.winnerName = userName;
      await ticket.save({ transaction: t });

      // 将彩票中奖积分追加到用户积分中
      user.points += ticket.prizeAmount;
      await user.save({ transaction: t });

      return { ticket: ticket.toJSON() as TicketDTO, updatedPoints: user.points };
    });
  }
}
