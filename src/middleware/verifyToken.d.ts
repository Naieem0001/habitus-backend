import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: any;
}
export declare const verifyToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=verifyToken.d.ts.map