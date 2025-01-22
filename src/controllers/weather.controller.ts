import { RequestHandler } from 'express';
import { Weather } from '../models/weather.model'; // 假设有一个Weather模型
import { ResponseHandler } from '../utils/response';
import axios from 'axios';

export class WeatherController {
  /**
   * @swagger
   * /api/weather:
   *   get:
   *     tags: [天气]
   *     summary: 获取每日天气
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: cityCode
   *         description: 城市代码
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 获取天气成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getDailyWeather: RequestHandler = async (req, res) => {
    try {
      const cityCode = req.query.cityCode as string || '101280601'; // 默认城市代码
      const today = new Date().toISOString().split('T')[0]; // 格式化为 yyyy-MM-dd

      // 查询数据库中是否已有当天的天气记录
      let weatherRecord = await Weather.findOne({ where: { date: today, cityCode } });

      if (!weatherRecord) {
        // 如果数据库中没有记录，请求天气API获取数据
        const apiUrl = `http://t.weather.itboy.net/api/weather/city/${cityCode}`;
        const imgUrl = `https://open.iciba.com/dsapi/`
        const [response, imgResponse] = await Promise.allSettled([
          axios.get(apiUrl),
          axios.get(imgUrl),
        ]);
        if (response.status === 'fulfilled' && imgResponse.status === 'fulfilled') {
          const { cityInfo, data: { forecast } } = response.value.data
          const { note, fenxiang_img } = imgResponse.value.data
          console.log('object', {
            cityCode,
            date: this.initDate(today),
            city: cityInfo.city,
            temperature: `${forecast[0].low} ~ ${forecast[0].high} ${forecast[0].notice}`,
            weather: '天气' + forecast[0].type + '-' + forecast[0].fx + forecast[0].fl,
            imageUrl: fenxiang_img, // 图片字段预留
            description: note // 文本字段
          })
          // 创建新的天气记录
          weatherRecord = await Weather.create({
            cityCode,
            date: this.initDate(today),
            city: cityInfo.city,
            temperature: `${forecast[0].low} ~ ${forecast[0].high} ${forecast[0].notice}`,
            weather: '天气' + forecast[0].type + '-' + forecast[0].fx + forecast[0].fl,
            imageUrl: fenxiang_img,
            description: note
          });
        } else {
          res.json(ResponseHandler.error('无法获取天气数据'));
          return;
        }
      }

      // 返回天气记录
      res.json(ResponseHandler.success(weatherRecord));
    } catch (error) {
      console.error('获取每日天气失败:', error);
      res.json(ResponseHandler.error('获取每日天气失败'));
    }
  };
  static initDate = (str: string) => {
    return str.replace('T', ' ').replace(/\.\d{3}Z$/, '')
  }
}