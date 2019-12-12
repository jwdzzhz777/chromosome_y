// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportArticles from '../../../app/model/articles';

declare module 'egg' {
  interface IModel {
    Articles: ReturnType<typeof ExportArticles>;
  }
}
