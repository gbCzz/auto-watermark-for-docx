import * as fs from 'fs';

class WatermarkCfg {
	docx_buffer = null;
	wm_txt_list = null;

	constructor(docx_path, wm_txt_path) {
		console.log(`正在读取源文档：${docx_path}`);
		if (!fs.accessSync(docx_path)) {
			console.log(`未找到源文档：${docx_path}`);
		}

		try {
			this.docx_buffer = fs.readFileSync(docx_path);
		} catch (err) {
			console.log(`读取时遇到错误：${err}`);
			console.log('初始化失败');
			return;
		}

		try {
			let rawtxt = fs.readFileSync(wm_txt_path).toString();
			let reg = RegExp('(\w+)\s*=\s*(\S+)');
		} catch (err) {}
	}
}

