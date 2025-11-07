import { NS, AutocompleteData } from "@ns";
import { connect_to_server, get_servers } from "library";

const alphabet_upper = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export async function main(ns: NS) {
  const args = ns.args;
  const contract_types = ns.codingcontract.getContractTypes();
  if (args.length > 0) {
    if (ns.serverExists(args[0].toString())) {
      connect_to_server(ns, args[0].toString());

    } else {
      let output_contract_types = contract_types;
      for (const arg of args) {
        output_contract_types = output_contract_types.filter(contract_type => contract_type.includes(arg.toString()));
      }
      if (output_contract_types.length > 1) {
        ns.tprintf("%s", output_contract_types.join(", "));
      } else {
        ns.codingcontract.createDummyContract(output_contract_types[0]);
        ns.tprintf("Created contract: %s", output_contract_types[0]);
      }

    }
  } else {
    const contract_servers = find_contract_servers(ns);
    const solvers: { solver_type: string, server_list: string[], have_solver: boolean }[] = [];
    for (const coding_type of Object.values(ns.enums.CodingContractName)) {
      solvers.push({ solver_type: coding_type, server_list: [], have_solver: false });
    }

    for (const server of contract_servers) {
      for (const contract_filename of ns.ls(server, "cct")) {
        const contract_type = ns.codingcontract.getContractType(contract_filename, server);
        const contract_data = ns.codingcontract.getData(contract_filename, server);
        let answer;
        let solved = false;
        switch (contract_type) {
          case "Unique Paths in a Grid I":
            answer = solver_grid_i(contract_data[0], contract_data[1]);
            solved = true;
            break;

          case "Find Largest Prime Factor":
            answer = solver_largest_prime_factor(contract_data);
            solved = true;
            break;

          case "Total Number of Primes":
            answer = solver_number_of_primes(contract_data);
            solved = true;
            break;

          case "Encryption I: Caesar Cipher":
            answer = solver_encryption_i(contract_data[0], contract_data[1]);
            solved = true;
            break;

          case "Encryption II: Vigenère Cipher":
            answer = solver_encryption_ii(contract_data[0], contract_data[1]);
            solved = true;
            break;

          case "Merge Overlapping Intervals":
            answer = solver_overlapping_intervals(contract_data);
            solved = true;
            break;

          case "Algorithmic Stock Trader I":
            answer = solver_stock_trader_i(contract_data);
            solved = true;
            break;

          case "Algorithmic Stock Trader II":
            answer = solver_stock_trader_ii(contract_data);
            solved = true;
            break;

          case "Array Jumping Game":
            answer = solver_array_jumping_game(contract_data);
            solved = true;
            break;

          case "Subarray with Maximum Sum":
            answer = solver_subarray_max_strings(contract_data);
            solved = true;
            break;

          default:
            break;
        }

        const solver_index = solvers.findIndex(a => a.solver_type === String(contract_type));
        solvers[solver_index].have_solver = solved;
        solvers[solver_index].server_list.push(server);

        if (solved) {
          const contract_message = ns.codingcontract.attempt(answer, contract_filename, server);
          if (contract_message) {
            ns.tprintf("Success for %s on %s: %s", contract_type, server, contract_message);
          } else {
            ns.tprintf("Failed to solve contract %s on %s with answer: %j", contract_type, server, answer);
          }
        }
      }
    }
    if (solvers.reduce((a, b) => Math.max(a, (!b.have_solver ? b.server_list.length : 0)), 0) > 0) {
      ns.tprintf("\nCould not find the following solvers:");
      for (const solver of solvers.sort((a, b) => a.solver_type.localeCompare(b.solver_type))) {
        if (solver.server_list.length > 0 && !solver.have_solver) {
          ns.tprintf("%s%s", solver.solver_type.padEnd(40, " "), solver.server_list.join(", "));
        }
      }
      ns.tprintf("\n%s", find_contract_servers(ns).join(", "));
    }
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}

function find_contract_servers(ns: NS) {
  const servers = get_servers(ns);
  const contract_servers = [];
  for (const server of servers) {
    if (ns.ls(server, "cct").length > 0) {
      contract_servers.push(server);
    }
  }
  return contract_servers;
}



function solver_grid_i(length: number, width: number): number {
  if (length == 1 || width == 1)
    return 1;

  return solver_grid_i(length - 1, width)
    + solver_grid_i(length, width - 1);
}

function solver_largest_prime_factor(number: number) {
  const factors: number[] = [];
  let divisor = 2;
  while (number > 1) {
    while (number % divisor == 0) {
      factors.push(divisor);
      number = number / divisor;
    }
    divisor += 1;
    if (divisor * divisor > number) {
      if (number > 1) { factors.push(number); }
      break;
    }
  }
  return factors.reduce((a, b) => Math.max(a, b));
}

function solver_number_of_primes(number_range: number[]) {
  const primes: number[] = [];
  for (let number = number_range[0]; number < number_range[1]; number++) {
    let divisor = 2;
    while (number > 1) {
      if (number % divisor == 0) {
        break;
      }
      divisor += 1;
      if (divisor * divisor > number) {
        if (number > 1) { primes.push(number); }
        break;
      }
    }
  }
  return primes.length;
}

function solver_encryption_i(plaintext: string, keyword: number): string {
  const plaintext_array = plaintext.split("");
  let encrypted_string = "";
  for (const character_index in plaintext_array) {
    const plaintext_character = plaintext_array[character_index];
    if (plaintext_character == " ") {
      encrypted_string = encrypted_string.concat(" ");
      continue;
    }
    const plaintext_index = alphabet_upper.indexOf(plaintext_character);
    encrypted_string = encrypted_string.concat(String(alphabet_upper.at((plaintext_index - keyword) % alphabet_upper.length)));
  }
  return encrypted_string;
}

function solver_encryption_ii(plaintext: string, keyword: string): string {
  const plaintext_array = plaintext.split("");
  const keyword_array = keyword.split("");
  let encrypted_string = "";
  for (const character_index in plaintext_array) {
    const plaintext_character = plaintext_array[character_index];
    const keyword_character = keyword_array[Number(character_index) % keyword_array.length];
    const plaintext_index = alphabet_upper.indexOf(plaintext_character);
    const keyword_index = alphabet_upper.indexOf(keyword_character);
    encrypted_string = encrypted_string.concat(alphabet_upper[(plaintext_index + keyword_index) % alphabet_upper.length]);
  }
  return encrypted_string;
}

function solver_overlapping_intervals(intervals: number[][]) {
  intervals.sort((a, b) => a[0] - b[0]);
  const index_list: number[] = [];
  for (const interval in intervals) {
    const merger_list = intervals.slice(Number(interval) + 1);
    for (const merge_interval_index in merger_list) {
      if (merger_list[merge_interval_index][0] <= intervals[interval][1]) {
        index_list.push(Number(interval) + 1 + Number(merge_interval_index));
      } else {
        break;
      }
    }
  }
  const output_list: number[][] = [];
  for (const interval in intervals) {
    if (index_list.includes(Number(interval))) {
      output_list[output_list.length - 1][1] = Math.max(intervals[interval][1], output_list[output_list.length - 1][1]);
    } else {
      output_list.push(intervals[interval]);
    }
  }
  return output_list;
}

function solver_stock_trader_i(trades: number[]) {
  const list_of_maxes: number[] = [];
  trades.forEach((current_cost, index) => {
    const largest_future_number = trades.slice(index).reduce((a, b) => Math.max(a, b));
    list_of_maxes.push(Math.max(0, (largest_future_number - current_cost)));
  });
  return list_of_maxes.reduce((a, b) => Math.max(a, b));
}

function solver_stock_trader_ii(trades: number[]) {
  let min_value = trades[0];
  let max_value = trades[0];
  let accumulator = 0;
  trades.forEach(current_element => {
    if (max_value >= current_element) {
      accumulator += max_value - min_value;
      min_value = current_element;
      max_value = current_element;
    }
    max_value = Math.max(max_value, current_element);
  });
  accumulator += max_value - min_value;
  return accumulator;
}

function solver_array_jumping_game(input_array: number[]) {
  if (input_array[0] >= input_array.length) return 1;
  for (let index = 1; index <= input_array[0]; index++) {
    const item = input_array[index];
    if (item >= input_array[0] - index) return solver_array_jumping_game(input_array.slice(index));
  }
  return 0;
}


function solver_subarray_max_strings(input_array: number[]) {
  const aggrigation_array: { "sum": number, "sub_array": number[] }[] = [];
  for (let start_index = 0; start_index < input_array.length; start_index++) {
    for (let end_index = 0; end_index + start_index < input_array.length; end_index++) {
      const sub_array = input_array.slice(start_index, start_index + end_index + 1);
      aggrigation_array.push({
        "sub_array": sub_array,
        "sum": sub_array.reduce((a, b) => a + b, 0),
      });
    }
  }
  aggrigation_array.sort((a, b) => b.sum - a.sum);
  return aggrigation_array[0]["sum"];
}
