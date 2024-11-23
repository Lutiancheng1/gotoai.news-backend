import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GotoAI News API Documentation',
      version: '1.0.0',
      description: 'API documentation for GotoAI News platform',
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'user'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        News: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published'] },
            author: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Talent: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            position: { type: 'string' },
            summary: { type: 'string' },
            avatar: { $ref: '#/components/schemas/FileData' },
            skills: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['available', 'not-available'] },
            workExperience: { type: 'string' },
            education: { type: 'string' },
            contact: { type: 'string' },
            featured: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
        FileData: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            originalName: { type: 'string' },
            size: { type: 'number' },
            mimeType: { type: 'string' },
            path: { type: 'string' },
            url: { type: 'string' },
            _id: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
      },
      responses: {
        UnauthorizedError: {
          description: '未授权访问',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: '资源不存在',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: '请求参数验证失败',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // 路由文件的路径模式
};

export const specs = swaggerJsdoc(options); 