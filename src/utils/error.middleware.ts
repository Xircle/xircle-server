import { NextFunction, Request, Response } from 'express';
import HttpException from './HttpException';
 
function errorMiddleware(error: HttpException, req: Request, res: Response, next: NextFunction) {
  const code = error.status || 500;
  const message = error.message || 'server error';
  return res.json({
    success:false,
    code,
    message,
  });
}
 
export default errorMiddleware;