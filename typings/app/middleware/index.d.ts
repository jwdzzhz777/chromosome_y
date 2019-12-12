// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportRespones from '../../../app/middleware/respones';

declare module 'egg' {
  interface IMiddleware {
    respones: typeof ExportRespones;
  }
}
