// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportGit from '../../../app/service/git';
import ExportMain from '../../../app/service/main';

declare module 'egg' {
  interface IService {
    git: ExportGit;
    main: ExportMain;
  }
}
