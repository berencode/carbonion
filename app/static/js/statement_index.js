import { DayConsumptionManager } from "./day_consumption.js";
import { DebugForm } from "./debug.js";

function main() {
  //new DayConsumption();
  const day_consumption_manager = new DayConsumptionManager();
  if (document.querySelector(".debug-card")) {
    const debug = new DebugForm();
    debug.showResponse("");
  } 
}



main();