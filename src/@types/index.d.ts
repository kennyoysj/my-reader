import { ViewColumn } from 'vscode';
import { TreeNode } from '../explorer/TreeNode';

export interface IReader {
  type: string;
  name: string;
  isDirectory: boolean;
  path: string;
  children: IReader[];
}

export interface IWebviewOption {
  title: string;
  viewColumn: ViewColumn;
  preserveFocus?: boolean;
}

interface IWebViewMessage {
  command: string;
  data: any;
}

interface ReaderDriver {
  hasChapter: (path: string) => void;
  getChapter: (pathStr: string) => void;
  getContent: (path: string) => Promise<string>;
  search?: (keyword: string) => Promise<TreeNode[]>;
}
