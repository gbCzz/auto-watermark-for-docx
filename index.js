import * as fs from 'fs';

import { parseIni } from './utils.js';

class AutoBatchWatermark {
  docx_buffer = null;
  wm_txt_list = null;

  /**
   * 构造函数，读取 docx 文档，读取水印文件转换为列表
   * @param {string} docx_path 需要添加水印的文档的路径
   * @param {string} wm_txt_path 水印列表 txt 的路径
   * @returns 
   */
  constructor(docx_path, wm_txt_path) {
    console.log(`> 正在读取源文档：${docx_path}`);
    try {
      fs.accessSync(docx_path);
    } catch (err) {
      console.log(`> 未找到源文档：${docx_path}`);
      console.log('> 初始化失败');
      return;
    }

    try {
      this.docx_buffer = fs.readFileSync(docx_path);
    } catch (err) {
      console.log(`> 读取时遇到错误：${err}`);
      console.log('> 初始化失败');
      return;
    }
    console.log('> 成功读取源文档');

    console.log(`> 正在读取水印列表：${wm_txt_path}`);
    try {
      fs.accessSync(wm_txt_path);
    } catch (err) {
      console.log(`> 未找到水印列表：${wm_txt_path}`);
      console.log('> 初始化失败');
	  return;
    }

    try {
      let rawtxt = fs.readFileSync(wm_txt_path).toString();
      this.wm_txt_list = rawtxt.split(/[\s*?\r?\n]+/);
    } catch (err) {
      console.log(`> 读取时遇到错误：${err}`);
      console.log('> 初始化失败');
      return;
    }
    console.log('> 成功读取水印列表，需要添加的水印如下：');
    for (const wm_txt of this.wm_txt_list) console.log(wm_txt);
  }
}

let abw = new AutoBatchWatermark('./教育学.docx', './一期班名单.txt');
