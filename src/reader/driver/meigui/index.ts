import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';
import StreamZip = require("node-stream-zip")
import AdmZip = require('adm-zip');
import { each } from 'cheerio/lib/api/traversing';

const DOMAIN = 'https://api.meiguixsapp.com';

class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await request.send(DOMAIN + '/api/v1/novelsearch?content='+encodeURI(keyword)+'&pageIndex=1&pageSize=50&type=2');
      let obj  = eval( '('+ res.body + ')' );
      console.log(obj)
      if(obj.code === 200) {
        let datas = obj.data.list;
        for(let each_data of datas) {
          let zio = parseInt((1999+each_data.bookId)/2000+"")
          let path = `/static/book/zip/${zio}/${each_data.bookId}.zip`;
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: '.meigui',
                name: `${each_data.name} - ${each_data.author}`,
                isDirectory: true,
                path
              })
            )
          );
        }
      }
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getChapter(pathStr: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      console.log(DOMAIN + pathStr)
      const res = await request.send({url:DOMAIN + pathStr, responseType:'buffer',encoding: null});
      let zip = new AdmZip(res.body);
      let text = zip.readAsText('chapter.json');
      let data = JSON.parse(text);
      if(data.code === 200) {
        for(let each of data.data) {
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: '.meigui',
                name: each.name,
                isDirectory: false,
                path: each.content_url
              })
            )
          );
        }
      }
      // const zip = new StreamZip.async({ file: 'archive.zip' });
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getContent(pathStr: string): Promise<string> {
    let result = '';
    try {
      const res = await request.send(pathStr);
      const html = res.body;
      console.log(html)
      result = html ? html : '';
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
