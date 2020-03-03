import * as path from 'path';
import * as Mocha from 'mocha';
export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd'
	});
	mocha.useColors(true);

	return new Promise((c, e) => {
		mocha.addFile(path.resolve(__dirname, "./extension.test"));
		try {
			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
}