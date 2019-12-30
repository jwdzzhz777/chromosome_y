// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportArticles from '../../../app/model/articles';
import ExportUsers from '../../../app/model/users';

declare module 'egg' {
  interface IModel {
    Articles: ReturnType<typeof ExportArticles>;
    Users: ReturnType<typeof ExportUsers>;
  }
}
