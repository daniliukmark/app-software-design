import { ApplianceLoader, App } from "./types/classes";
import { tryCatch } from "./utils";

async function main() {
	const { data: appliances, error } = await tryCatch(
		ApplianceLoader.loadAppliancesFromFile("./appliances.json"),
	);

	if (error) {
		console.error(error);
		return;
	}

	const app = new App(appliances);
	app.run();
}

await main();
