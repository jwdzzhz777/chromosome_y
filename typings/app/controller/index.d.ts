// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportGit from '../../../app/controller/git';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    git: ExportGit;
    user: ExportUser;
  }
}
