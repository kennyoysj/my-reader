import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';
import AdmZip = require('adm-zip');
import got = require('got');

const DOMAIN = 'https://app.yqzw5.net';

class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      let request_url = `${DOMAIN}/json/api_search.php?searchkey=${encodeURI(keyword)}`;
      console.log(request_url)
      let body = {"page": 0,"pageSize":20,"search_value":keyword,"search_type": "novel"}
      let options:got.GotJSONOptions = {
        baseUrl: request_url,
        method: "POST",
        body: body,
        json: true
      }
      const res = await request.send(request_url);
      let obj  = eval( '('+ res.body + ')' );
      console.log(obj)
      // if(obj.code === 200) {
      let datas = obj.result_rows
      for(let each_data of datas) {
        let path = `/json/api_indexlist.php?aid=${each_data.articleid}`;
        result.push(
          new TreeNode(
            Object.assign({}, defaultTreeNode, {
              type: '.meigui',
              name: `${each_data.articlename} - ${each_data.author}`,
              isDirectory: true,
              path
            })
          )
        );
        // }
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
      const res = await request.send({url:DOMAIN + pathStr});
      // let zip = new AdmZip(res.body);
      // let text = zip.readAsText('chapter.json');
      let data = JSON.parse(res.body);
      for(let each of data.chapterrows) {
        const each_data = {
          type: '.meigui',
          name: each.chaptername,
          isDirectory: false,
          path: `${DOMAIN}/json/api_read.php?aid=${pathStr.split("?aid=")[1]}&cid=${each.chapterid}`
        }
        result.push(
          new TreeNode(
            Object.assign({}, defaultTreeNode, each_data)
          )
        );
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
      const html = JSON.parse(res.body);
      console.log(html)
      result = html.content ? html.content : '';
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
