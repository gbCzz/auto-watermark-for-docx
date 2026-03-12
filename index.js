import * as fs from 'fs';

import { FabricText, StaticCanvas } from 'fabric/node';
import { PDFDocument } from 'pdf-lib';

import { parseIni } from './utils.js';
import { registerFont } from 'canvas';

registerFont('./fonts/simsun.ttc', { family: 'SimSun' });

class AutoBatchWatermark {
  pdf_path = '';
  pdf_buffer = null;
  wm_txt_list = null;
  /**
   * @type {import('fabric').TextProps}
   */
  wm_font_opt = {};
  /**
   * 构造函数，读取 pdf 文档，读取水印文件转换为列表
   * @param {string} pdf_path 需要添加水印的文档的路径
   * @param {string} wm_txt_path 水印列表 txt 的路径
   * @param {*} font_opt 水印的文字样式
   * @returns
   */
  constructor(pdf_path, wm_txt_path, font_opt) {
    this.pdf_path = pdf_path;
    Object.assign(this.wm_font_opt, font_opt);
    console.log(`> 正在读取源文档：${pdf_path}`);
    try {
      fs.accessSync(pdf_path);
    } catch (err) {
      console.log(`> 未找到源文档：${pdf_path}`);
      console.log('> 初始化失败');
      process.exit(0);
    }

    try {
      this.pdf_buffer = fs.readFileSync(pdf_path);
    } catch (err) {
      console.log(`> 读取时遇到错误：${err}`);
      console.log('> 初始化失败');
      process.exit(0);
    }
    console.log('> 成功读取源文档');

    console.log(`> 正在读取水印列表：${wm_txt_path}`);
    try {
      fs.accessSync(wm_txt_path);
    } catch (err) {
      console.log(`> 未找到水印列表：${wm_txt_path}`);
      console.log('> 初始化失败');
      process.exit(0);
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

  async addWmToPDF() {
    if (this.wm_txt_list?.length == 0) return;

    console.log(`> 正在加载源 PDF`);
    const src_pdf_doc = await PDFDocument.load(this.pdf_buffer);

    for (const txt_str of this.wm_txt_list) {
      console.log(`> 正在生成水印图片：${txt_str}`);
      const wm_buffer = await this.generateFabricWm(txt_str);

      console.log(`> 正在将水印添加至文档`);
      const pdf_doc = await src_pdf_doc.copy();
      const png_img = await pdf_doc.embedPng(wm_buffer);
      const { width: img_w, height: img_h } = png_img.scale(1.0);

      const page_list = pdf_doc.getPages();

      for (const page of page_list) {
        const { width: page_w, height: page_h } = page.getSize();

        page.drawImage(png_img, {
          x: (page_w - img_w) / 2,
          y: (page_h - img_h) / 2,
          width: img_w,
          height: img_h,
          opacity: 1.0,
        });
      }

      const pdf_buf = await pdf_doc.save();
      fs.writeFileSync(`./${this.pdf_path.slice(0, this.pdf_path.length - 4)}-${txt_str}.pdf`, pdf_buf);
      console.log(`> 成功生成带水印的 PDF: ${this.pdf_path.slice(0, this.pdf_path.length - 4)}-${txt_str}.pdf`);
    }
  }
}

let raw_cfg = '';
console.log('> 正在读取配置文件');
try {
  raw_cfg = fs.readFileSync('./config.cfg').toString();
} catch (err) {
  console.log('> 读取配置文件失败');
  process.exit(0);
}

const { src_pdf_path, wm_list_path } = parseIni(raw_cfg);

const run = async () => {
  let abw = new AutoBatchWatermark(src_pdf_path, wm_list_path, {
    fontFamily: 'SimSun',
    fontSize: 108,
    fontWeight: 'normal',
    fill: 'rgba(180, 180, 180, 0.4)',
    angle: -30,
    originX: 'center',
    originY: 'center',
    left: 800 / 2,
    top: 1000 / 2,
  });

  abw.addWmToPDF();
};

run();

