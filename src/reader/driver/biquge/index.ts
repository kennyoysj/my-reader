import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';

const DOMAIN = 'https://www.biqudu.net';
const DOMAIN2 = 'https://www.biqudu.net';

class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await request.send(DOMAIN2 + '/searchbook.php?keyword=' + encodeURI(keyword));
      const $ = cheerio.load(res.body);
      $('#main .novelslist2 li').each(function (i: number, elem: any) {
        const title = $(elem).find('span.s2 a').text();
        const author = $(elem).find('span.s4').text();
        const link = $(elem).find('span.s2 a').attr();
        if(link) {
          const path = link.href;
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: '.biquge',
                name: `${title} - ${author}`,
                isDirectory: true,
                path
              })
            )
          );
        }
      });
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getChapter(pathStr: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await request.send(DOMAIN + pathStr);
      const $ = cheerio.load(res.body);
      $('#list dd').each(function (i: number, elem: any) {
        const name = $(elem).find('a').text();
        const a = $(elem).find('a').attr();
        if(a) {
          const path = a.href;
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: '.biquge',
                name,
                isDirectory: false,
                path
              })
            )
          );
        }
      });
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getContent(pathStr: string): Promise<string> {
    let result = '';
    try {
      const res = await request.send(DOMAIN + pathStr);
      const $ = cheerio.load(res.body);
      const html = $('#content').html();
      result = html ? html : '';
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
