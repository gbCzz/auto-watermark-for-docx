/**
 * parse string from ini/cfg files into object
 * @param {string} rawtxt string from ini/cfg files
 * @returns {any} object contains key-val pairs in the rawtxt
 */
function parseIni(rawtxt) {
	const result = {};
	const reg = /^([\w.-]+)\s*=\s*(.*)$/;
	const line_list = rawtxt.split(RegExp('\r?\n'));
	for(const line of line_list) {
		const trimmed = line.trim();

		if(!trimmed || trimmed[0] == '#' || trimmed[0] == ';')
			continue;

		const match = trimmed.match(reg);
		if (match)
			result[match[i]] = match[2].trim();
	}
	return result
}

export { parseIni };