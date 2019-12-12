// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportArticle from '../../../app/service/article';
import ExportGit from '../../../app/service/git';

declare module 'egg' {
  interface IService {
    article: ExportArticle;
    git: ExportGit;
  }
}
