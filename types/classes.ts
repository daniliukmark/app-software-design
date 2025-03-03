import { z } from "zod";
import { tryCatch } from "../utils";

export class Appliance {
	private _name: string;
	private _powerConsumption: number;
	private _embodiedEmissions: number;
	private _usageMode: UsageMode;
	private _parameters: Map<string, object>;

	constructor(
		name: string,
		powerConsumption: number,
		embodiedEmissions: number,
		usageMode: UsageMode,
		parameters: Map<string, object>,
	) {
		this._name = name;
		this._powerConsumption = powerConsumption;
		this._embodiedEmissions = embodiedEmissions;
		this._usageMode = usageMode;
		this._parameters = parameters;
	}

	get powerConsumption() {
		return this._powerConsumption;
	}

	get embodiedEmissions() {
		return this._embodiedEmissions;
	}

	get usageMode() {
		return this._usageMode;
	}

	get parameters() {
		return this._parameters;
	}

	toString(): string {
		return `${this._name}: Power consumption: ${this._powerConsumption}, Embodied emissions: ${this._embodiedEmissions}, Usage mode: ${this._usageMode}.`;
	}
}

export class Household {
	private _region: Region;
	private _timeWindow: TimeWindow;
	private _appliances: Appliance[];

	constructor(region: Region, timeWindow: TimeWindow, appliances: Appliance[]) {
		this._region = region;
		this._timeWindow = timeWindow;
		this._appliances = appliances;
	}

	get region() {
		return this._region;
	}

	get timeWindow() {
		return this._timeWindow;
	}

	get appliances() {
		return Array.from(this._appliances);
	}

	toString(): string {
		const formatedAppliances = this._appliances
			.map((a) => a.toString())
			.join("\n");
		return `${this._region}, ${this._timeWindow},\n${formatedAppliances}`;
	}
}

export class Scenario {
	private _name: string;
	private _household: Household;

	constructor(name: string, household: Household) {
		this._name = name;
		this._household = household;
	}

	get name() {
		return this._name;
	}

	get household() {
		return this._household;
	}

	set name(newName: string) {
		this._name = newName;
	}

	set household(newHousehold: Household) {
		this._household = newHousehold;
	}

	evaluate() {
		const contributions = this.household.appliances.map((a) => {
			return new CO2Contribution(a, Math.round(Math.random()) * 100);
		});
		return contributions;
	}

	toString(): string {
		return `Scenario: ${this._name}: Household: ${this.household.toString()}.`;
	}
}

export class CO2Contribution {
	private _appliance: Appliance;
	private _value: number;

	constructor(_appliance: Appliance, _value: number) {
		this._appliance = _appliance;
		this._value = _value;
	}

	get appliance() {
		return this._appliance;
	}

	get value() {
		return this._value;
	}
}

export class TimeWindow {
	private _start: Date;
	private _end: Date;

	constructor(start: Date, end: Date) {
		this._start = start;
		this._end = end;
	}

	get start() {
		return this._start;
	}

	get end() {
		return this._end;
	}

	toString(): string {
		return `${this._start.toLocaleString()} - ${this._end.toLocaleString()}`;
	}
}

export enum Region {
	US = "US",
	EU = "EU",
	ASIA = "ASIA",
	NOT_SPECIFIED = "Not Specified",
}

export enum UsageMode {
	ALWAYS_ON = "ALWAYS_ON",
	ON_DEMAND = "ON_DEMAND",
}

export class App {
	private _possibleAppliances: Appliance[];
	private _scenarios: Scenario[];

	constructor(possibleAppliances: Appliance[]) {
		this._possibleAppliances = possibleAppliances;
		this._scenarios = [];
	}

	async run() {
		const commands = new Map<string, () => void>();
		commands.set("list_appliances", () => this.listAppliances());
		commands.set("list_scenarios", () => this.listScenarios());
		commands.set("create_scenario", () => this.createScenario());
		commands.set("edit_scenario", () => this.editScenario());
		commands.set("delete_scenario", () => this.deleteScenario());
		commands.set("show_scenario_report", () => this.showScenarioReport());

		const allCommands = ["exit", ...commands.keys()];

		console.log(`Available commands: ${allCommands.join(", ")}\n`);

		while (true) {
			const input = prompt("Enter a command and press Enter:");
			if (!input) continue;
			const formattedInput = input.trim().toLowerCase();

			const command = commands.get(formattedInput);

			if (command) {
				command();
				continue;
			}

			if (formattedInput === "exit") {
				console.log("Goodbye!");
				break;
			}

			console.log(
				`Unknown command.\n Available commands: ${allCommands.join(", ")}\n`,
			);
		}
	}

	listAppliances() {
		if (this._possibleAppliances.length === 0) {
			console.log("No possible appliances found or error reading file");
			return;
		}

		console.log("\nPossible appliances:");
		for (const [index, appliance] of this._possibleAppliances.entries()) {
			console.log(`${index + 1}. ${appliance.toString()}`);
		}
	}

	listScenarios() {
		if (this._scenarios.length === 0) {
			console.log("No scenarios found or error reading file");
			return;
		}

		console.log("\nScenarios:");
		for (const [index, scenario] of this._scenarios.entries()) {
			console.log(`${index + 1}. ${scenario.toString()}`);
		}
	}

	createScenario() {
		const name = `scenario-${this._scenarios.length + 1}`;
		const household = new Household(
			Region.ASIA,
			new TimeWindow(new Date(), new Date()),
			[],
		);
		const newScenario = new Scenario(name, household);
		this._scenarios.push(newScenario);
		console.log("Scenario created.");
	}

	editScenario() {
		this.listScenarios();
		if (this._scenarios.length === 0) return;

		function getRegion() {
			console.log(
				"\nSelect a region:\n1. US\n2. EU\n3. ASIA\n4. Not Specified",
			);
			const regionInput = prompt("Enter region number (1-4):");
			if (!regionInput) return Region.NOT_SPECIFIED;

			if (regionInput === "1") return Region.US;
			if (regionInput === "2") return Region.EU;
			if (regionInput === "3") return Region.ASIA;
			return Region.NOT_SPECIFIED;
		}

		function getTimeWindow() {
			// Set up time window
			console.log("Setting time window...");
			const startDateInput = prompt(
				"Enter start date (YYYY-MM-DD):",
				new Date().toISOString().split("T")[0],
			);
			if (!startDateInput) return;

			const startTimeInput = prompt("Enter start time (HH:MM):", "00:00");
			if (!startTimeInput) return;

			const endDateInput = prompt(
				"Enter end date (YYYY-MM-DD):",
				new Date().toISOString().split("T")[0],
			);
			if (!endDateInput) return;

			const endTimeInput = prompt("Enter end time (HH:MM):", "23:59");
			if (!endTimeInput) return;

			const startDate = new Date(`${startDateInput}T${startTimeInput}`);
			const endDate = new Date(`${endDateInput}T${endTimeInput}`);

			if (
				Number.isNaN(startDate.getTime()) ||
				Number.isNaN(endDate.getTime())
			) {
				console.log("Invalid date or time format.");
				return;
			}

			return new TimeWindow(startDate, endDate);
		}

		function getScenarioName(scenario: Scenario) {
			// Create a duplicate of the scenario
			const newName = prompt(
				"Enter a new name for the scenario:",
				scenario.name,
			);
			if (!newName) return scenario.name;
			return newName;
		}

		function getAppliances(possibleAppliances: Appliance[]) {
			const selectedAppliances: Appliance[] = [];

			while (true) {
				const applianceIndexInput = prompt("Enter appliance number or 'done:");
				if (
					!applianceIndexInput ||
					applianceIndexInput.toLowerCase() === "done"
				) {
					break;
				}

				const applianceIndex = parseInt(applianceIndexInput) - 1;
				if (
					Number.isNaN(applianceIndex) ||
					applianceIndex < 0 ||
					applianceIndex >= possibleAppliances.length
				) {
					console.log("Invalid appliance number. Please try again.");
					continue;
				}

				selectedAppliances.push(possibleAppliances[applianceIndex]);
				console.log(`Added ${possibleAppliances[applianceIndex].toString()}`);
			}
			return selectedAppliances;
		}

		const input = prompt("Enter the name of the scenario to edit:");
		if (!input) return;

		const scenarioIndex = this._scenarios.findIndex((s) => s.name === input);
		if (scenarioIndex === -1) {
			console.log(`Scenario ${input} not found.`);
			return;
		}

		// Create a duplicate of the scenario
		const originalScenario = this._scenarios[scenarioIndex];

		const name = getScenarioName(originalScenario);
		const timeWindow = getTimeWindow();
		if (!timeWindow) return;
		const region = getRegion();

		this.listAppliances();
		if (this._possibleAppliances.length === 0) {
			console.log("No appliances available to add.");
			return;
		}
		console.log(
			"\nAdd appliances to the scenario (enter 'done' when finished):",
		);

		const appliances = getAppliances(this._possibleAppliances);
		const household = new Household(region, timeWindow, appliances);
		const editedScenario = new Scenario(name, household);

		this._scenarios.push(editedScenario);

		console.log(
			`Scenario ${name} created as a duplicate of ${originalScenario.name} with your changes.`,
		);
	}

	deleteScenario() {
		this.listScenarios();
		if (this._scenarios.length === 0) return;

		const input = prompt("Enter the name of the scenario to delete:");
		if (!input) return;

		const scenario = this._scenarios.find((s) => s.name === input);
		if (!scenario) {
			console.log(`Scenario ${input} not found.`);
			return;
		}

		const newScenarios = this._scenarios.filter(
			(s) => s.name !== scenario.name,
		);

		console.log(`Scenario ${scenario.name} deleted.`);

		return newScenarios;
	}

	showScenarioReport() {
		this.listScenarios();
		if (this._scenarios.length === 0) return;

		const input = prompt("Enter the name of the scenario to show report:");
		if (!input) return;

		const scenario = this._scenarios.find((s) => s.name === input);
		if (!scenario) {
			console.log(`Scenario ${input} not found.`);
			return;
		}

		console.log(scenario.evaluate());
	}
}

const ApplianceSchema = z.object({
	name: z.string().trim().min(1),
	powerConsumption: z.number().min(0),
	embodiedEmissions: z.number().min(0),
	usageMode: z.nativeEnum(UsageMode),
	parameters: z.record(z.any()).optional(),
});

const AppliancesSchema = z.array(ApplianceSchema);

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ApplianceLoader {
	static async loadAppliancesFromFile(filePath: string) {
		const fileResult = await tryCatch(Bun.file(filePath).text());
		if (fileResult.error) {
			throw new Error(`Error reading file ${filePath}:`, fileResult.error);
		}

		const jsonData = JSON.parse(fileResult.data);

		const validatedData = AppliancesSchema.safeParse(jsonData);
		if (!validatedData.success) {
			throw new Error(`Zod validation error:${validatedData.error?.message}`);
		}

		const appliances: Appliance[] = validatedData.data.map((applianceData) => {
			const parametersMap = new Map<string, object>();
			if (applianceData.parameters) {
				for (const key in applianceData.parameters) {
					if (Object.hasOwn(applianceData.parameters, key)) {
						parametersMap.set(key, applianceData.parameters[key]);
					}
				}
			}

			return new Appliance(
				applianceData.name,
				applianceData.powerConsumption,
				applianceData.embodiedEmissions,
				applianceData.usageMode,
				parametersMap,
			);
		});

		return appliances;
	}
}
