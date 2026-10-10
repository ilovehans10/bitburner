import { NS, DarknetServerDetails } from "@ns";

const password_solvers = {
  "110100100": binary_solver,
  "AccountsManager_4.2": null, // given a number range and guess all numbers in that range
  "BellaCuore": null, // the data is a string represending a number in romal numerials: CDLXXVIII or a range CDLXXXVII,DCXCV
  "CloudBlare(tm)": cloud_blare,
  "DeepGreen": null,
  "DeskMemo_3.1": desk_memo,
  "EuroZone Free": euro_zone,
  "Factori-Os": null, // Guess numbers of a certain length
  "FreshInstall_1.0": fresh_install,
  "KingOfTheHill": null,
  "Laika4": null,
  "NIL": null,
  "OctantVoxel": octant_voxel,
  "OpenWebAccessPoint": null,
  "PHP 5.4": null, // data is digits that should be used in each permutation
  "Pr0verFl0": overflow,
  "PrimeTime 2": null, // return the largest prime factor of a number
  "RateMyPix.Auth": null,
  "(The Labyrinth)": null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  "ZeroLogon": () => { return [""]; },
};

const alpha_to_numbers = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const eu_contries = ["Austria", "Bielgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Swieden"];

export async function main(ns: NS) {

  const debug_printing = false;
  const solver_models = Object.keys(password_solvers);
  const missing_solvers: string[] = [];
  const printed_missing_solvers: string[] = [];

  const files = ns.ls(ns.getHostname());
  for (const file of files) {
    if (/\.cache/.test(file)) {
      ns.tprintf("%s", file);
      ns.dnet.openCache(file);
    }
  }

  while (true) {
    const nearby_servers = ns.dnet.probe();

    for (const dark_net_server of nearby_servers) {
      const details = ns.dnet.getServerDetails(dark_net_server);
      if (!details.isConnectedToCurrentServer || !details.isOnline) {
        continue;
      }

      if (!solver_models.includes(details.modelId)) {
        if (!missing_solvers.includes(details.modelId) && !printed_missing_solvers.includes(details.modelId)) {
          missing_solvers.push(details.modelId);
          continue;
        }
      }

      if (debug_printing) ns.tprintf("%s: %i", dark_net_server.slice(0, 15).padEnd(15, " "), ns.getServer(dark_net_server).ramUsed);

      if (ns.dnet.isDarknetServer(dark_net_server)) {
        if (ns.getServer(dark_net_server).ramUsed - ns.dnet.getBlockedRam(dark_net_server) > 0) {
          continue;
        }
      }

      const solver = password_solvers[details.modelId as keyof typeof password_solvers];

      if (solver) {
        const password_attempts = solver(details);
        let successful = false;
        for (const password_atempt of password_attempts) {
          if (debug_printing) ns.tprintf("%s", details.modelId);
          try {
            const attempt_result = await ns.dnet.authenticate(dark_net_server, password_atempt as string);
            if (attempt_result.success) {
              successful = true;
              break;
            } else {
              console.log(attempt_result, dark_net_server);
            }
          } catch (error) {
            ns.tprintf("%s %s: %s", dark_net_server, details.modelId, password_atempt);
          }
        }
        if (successful) {
          ns.scp("dark_net.js", dark_net_server);
          await ns.dnet.memoryReallocation(dark_net_server);
          ns.exec("dark_net.js", dark_net_server);
          //ns.tprintf("running on %s now", dark_net_server);
        } else {
          ns.tprintf("solver for %s was unsuccessful on %s: %s", details.modelId, dark_net_server, password_attempts.join(", "));
        }
      }

    }
    ns.tprintf("%s", missing_solvers.join());
    missing_solvers.map((solver) => { printed_missing_solvers.push(solver); });
    missing_solvers.length = 0; // empty the array
    await ns.asleep(5_000);
  }
}

function desk_memo(auth_details: DarknetServerDetails): RegExpMatchArray {
  const re = new RegExp(`\\d{${auth_details.passwordLength}}`);
  const results = auth_details.passwordHint.match(re);
  if (results != null) {
    return results;
  }
  throw "could not find string in desk_memo hint";
}

function cloud_blare(auth_details: DarknetServerDetails): string[] {
  const numbers = auth_details.data.match(/\d+/g);
  if (numbers) {
    return [numbers.join("")];
  }
  throw "missing numbers in data";
}

function fresh_install(auth_details: DarknetServerDetails): string[] {
  const possible_passwords = ["password", "default", "admin", "0000", "1234", "12345"];
  const filtered_passwords = possible_passwords.filter(guess => guess.length == auth_details.passwordLength);
  if (!filtered_passwords.length) console.log();
  return filtered_passwords;
}

function overflow(auth_details: DarknetServerDetails): string[] {
  const overflow_password = ["11".repeat(auth_details.passwordLength)];
  return overflow_password;
}

function octant_voxel(auth_details: DarknetServerDetails) {
  const data = auth_details.data.split(",").map(Number);
  return [base_conversion(data[0], data[1])];
}

function binary_solver(auth_details: DarknetServerDetails) {
  console.log(auth_details.data.split(" ").map(a => base_conversion(2, Number(a))).join())
  return [auth_details.data.split(" ").map(a => String.fromCharCode(base_conversion(2, Number(a)))).join()];
}

function euro_zone(auth_details: DarknetServerDetails) {
  return eu_contries.filter(a => a.length == auth_details.passwordLength)
}

function base_conversion(base: number, convertee: number): number {
  var accumulator = 0
  const convertee_list = String(convertee).split("")
  for (const [index, digit] of convertee_list.reverse().entries()) {
    var digit_number: number = Number(digit)
    if (isNaN(digit_number)) {
      digit_number = alpha_to_numbers.indexOf(digit) + 10
    }
    accumulator += digit_number * (base ** index)
  }
  return accumulator
}

function range(min: number, max: number): number[] {
  return Array.from({ length: (max - min) + 1 }, (_, i) => min + i);
}
