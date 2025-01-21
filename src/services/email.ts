import nodemailer from 'nodemailer';

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  service: 'qq', // 使用 Gmail 服务，也可以配置其他 SMTP 服务
  auth: {
    user: process.env.MAIL_USER, // 邮箱用户名
    pass: process.env.MAIL_PASS, // 邮箱密码或应用专用密码
  },
});

// 封装邮件发送功能
export const sendMail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('邮件发送成功');
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error; // 抛出错误，便于后续处理
  }
};