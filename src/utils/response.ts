export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

export class ResponseHandler {
  static success<T>(data?: T, msg: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      msg,
      data
    };
  }

  static error(msg: string = '操作失败', code: number = 500): ApiResponse {
    return {
      code,
      msg
    };
  }
} 