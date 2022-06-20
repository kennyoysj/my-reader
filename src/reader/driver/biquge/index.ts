import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';

const DOMAIN = 'https://www.ishubao.org/';
const DOMAIN2 = 'https://www.ishubao.org/';

class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await request.send(DOMAIN2 + '/modules/article/search.php?s=12839966820499815668&entry=1&ie=gbk&q=' + encodeURI(keyword));
      const $ = cheerio.load(res.body);
      $('.grid tr').each(function (i: number, elem: any) {
        try {
          const title = $(elem).find('td a:eq(0)').text();
          const author = $(elem).find('td:eq(2)').text();
          const path = $(elem).find('td a:eq(0)').attr('href');
          console.log(path)
          if(path) {
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
        } catch (error) {
          console.warn(error)
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
      const res = await request.send(pathStr);
      const $ = cheerio.load(res.body);
      $('#chapterlist li').each(function (i: number, elem: any) {
        const name = $(elem).find('a').text();
        const path = $(elem).find('a').attr('href');
        if(path) {
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
      const html = $('#book_text').html();
      result = html ? html : '';
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
