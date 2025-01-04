import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '积分系统 API',
    version: '1.0.0',
    description: '用户签到积分系统的API文档',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '开发服务器',
    },
  ],
  components: {
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200
          },
          msg: {
            type: 'string',
            example: '操作成功'
          },
          data: {
            type: 'object'
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{
    bearerAuth: []
  }]
};

const options = {
  swaggerDefinition,
  apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options); 