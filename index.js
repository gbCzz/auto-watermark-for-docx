import * as fs from 'fs';

import { FabricText, StaticCanvas } from 'fabric/node';

import { parseIni } from './utils.js';
import { object } from 'webidl-conversions';

class AutoBatchWatermark {
  docx_buffer = null;
  wm_txt_list = null;
  /**
   * @type {import('fabric').TextProps}
   */
  wm_font_opt = {};
  /**
   * 构造函数，读取 docx 文档，读取水印文件转换为列表
   * @param {string} docx_path 需要添加水印的文档的路径
   * @param {string} wm_txt_path 水印列表 txt 的路径
   * @param {*} font_opt 水印的文字样式
   * @returns
   */
  constructor(docx_path, wm_txt_path, font_opt) {
    Object.assign(this.wm_font_opt, font_opt);
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

  async generateFabricWm(txt_str) {
    const width = 800;
    const height = 1000;

    const canvas = new StaticCanvas(null, { width, height });

    const text = new FabricText(txt_str, this.wm_font_opt);

    canvas.add(text);
    canvas.renderAll();

    const data_url = canvas.toDataURL({
      format: 'png',
      multiplier: 1,
    });

    return Buffer.from(data_url.replace(/^data:image\/png;base64,/, ''), 'base64');
  }

  
}

const run = async () => {
  let abw = new AutoBatchWatermark('./教育学.docx', './一期班名单.txt', {
    fontFamily: 'Microsoft YaHei',
    fontSize: 72,
    fontWeight: 'bold',
    fill: 'rgba(180, 180, 180, 0.4)',
    angle: -30,
    originX: 'center',
    originY: 'center',
    left: 800 / 2,
    top: 1000 / 2,
  });

  if (abw.wm_txt_list && abw.wm_txt_list.length > 0) {
    console.log(`\n> 开始为 "${abw.wm_txt_list[0]}" 生成水印图片...`);
    const imgBuffer = await abw.generateFabricWm(abw.wm_txt_list[0]);

    console.log(`> 水印图片生成成功！Buffer 大小: ${imgBuffer.length} bytes`);

    // 你可以在这里加一行 fs.writeFileSync('test.png', imgBuffer) 来在本地预览一下图片效果！
  }
};

run();
