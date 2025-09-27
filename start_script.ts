import { NS } from "@ns";
import { start_functions } from "library";

/** @param {NS} ns */
export async function main(ns: NS) {
  start_functions(ns);
  ns.tprintf("Network Map made and can be accessed by copying the content of network_map.txt to mermaid.live");

  const should_upgrade = ns.args[0];
  if (should_upgrade) {
    while (ns.singularity.upgradeHomeRam()) {
      ns.tprintf("Upgraded Home RAM: %s", ns.format.ram(ns.getServerMaxRam("home")));
    }
    if (ns.singularity.purchaseTor()) {
      const program_list = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "ServerProfiler.exe", "DeepscanV1.exe", "AutoLink.exe", "HTTPWorm.exe", "DeepscanV2.exe", "SQLInject.exe"];
      const purchased_programs = [];
      for (const program_name of program_list) {
        if (ns.singularity.purchaseProgram(program_name)) {
          purchased_programs.push(program_name)
        }
      }
      if (purchased_programs.length > 0) {
        ns.tprintf("Purchased %s of %s scripts:\n%s", purchased_programs.length, program_list.length, purchased_programs.join(", "));
      }
    }
  }

  const total_ram = ns.getServerMaxRam("home");
  const can_form_gang = ns.heart.break() <= -54000;
  let spare_ram;

  if (total_ram <= 128) {
    spare_ram = 0;
  } else {
    spare_ram = total_ram / 16;
  }
  let gang_script_ram;
  if (can_form_gang) {
    gang_script_ram = ns.getScriptRam("gang_manager.js");
    if (ns.getHackingLevel() < 100) { ns.singularity.universityCourse("Rothman University", "Algorithms", false); }
  } else {
    gang_script_ram = 0;
  }

  const home_script_ram = ns.getScriptRam("homehack.js");
  const distro_script_ram = ns.getScriptRam("distribute.js");
  //const scripts_to_kill = ["gang_manager.js", "homehack.js", "distribute.js"];
  const all_scripts_ram = gang_script_ram + home_script_ram + distro_script_ram;
  ns.tprintf("Killing all current scripts on home");
  ns.killall("home");
  ns.tprintf("Starting distribute.js");
  ns.run("distribute.js", { threads: 1 }, false, true);
  if (all_scripts_ram > total_ram) {
    ns.tprintf("Warning: not enough RAM to run all scripts, gang_manager won't be run");
    const needed_ram = spare_ram + distro_script_ram;
    const homehack_threads = thread_finder(total_ram, home_script_ram, needed_ram);
    if (homehack_threads > 0) {
      ns.tprintf("Starting homehack.js, with %d threads", homehack_threads);
      ns.spawn("homehack.js", homehack_threads);
    }
  } else {
    const needed_ram = spare_ram + gang_script_ram + distro_script_ram;
    const homehack_threads = thread_finder(total_ram, home_script_ram, needed_ram);
    if (can_form_gang) {
      ns.tprintf("Starting gang_manager.js");
      ns.run("gang_manager.js");
    } else {
      ns.tprintf("Can't form gang, karma is %i of -54000 or %s", ns.heart.break(), ns.format.percent(ns.heart.break() / -54000));
    }
    ns.tprintf("Starting homehack.js, with %d threads", homehack_threads);
    if (spare_ram >= 128) {
      const threads = Math.floor(((spare_ram / 16) * 15) / ns.getScriptRam("share.js"));
      ns.run("share.js", threads);
      ns.tprintf("Starting share.js, with %d threads", threads);
    }
    ns.spawn("homehack.js", { threads: homehack_threads, spawnDelay: 500 });
  }
}

function thread_finder(total_ram: number, threaded_script_ram: number, spare_ram: number) {
  return Math.floor((total_ram - spare_ram) / threaded_script_ram)
}
