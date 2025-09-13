import { NS, AutocompleteData } from "@ns";
import { connect_to_server, get_servers } from "library";

const alphabet_upper = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const alphabet_lower = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

export async function main(ns: NS) {
  const args = ns.args;
  if (args.length > 0) {
    connect_to_server(ns, args[0].toString())
  } else {
    const contract_servers = find_contract_servers(ns)
    for (const server of contract_servers) {
      for (const contract_filename of ns.ls(server, "cct")) {
        const contract_type = ns.codingcontract.getContractType(contract_filename, server);
        const contract_data = ns.codingcontract.getData(contract_filename, server);
        let answer;
        let solved = false;
        switch (contract_type) {
          case "Unique Paths in a Grid I":
            answer = solver_grid_i(contract_data[0], contract_data[1])
            solved = true;
            break;

          case "Find Largest Prime Factor":
            answer = solver_largest_prime_factor(contract_data);
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

          default:
            ns.tprintf("Could not find solver for: %s on %s", contract_type, server)
            break;
        }
        if (solved) {
          const contract_message = ns.codingcontract.attempt(answer, contract_filename, server)
          ns.tprintf("Success for %s on %s: %s", contract_type, server, contract_message)
        }
      }
    }
    ns.tprintf("%s", find_contract_servers(ns).join(", "))
  }
}

export function autocomplete(data: AutocompleteData, args: string[]) {
  return data.servers
}

function find_contract_servers(ns: NS) {
  const servers = get_servers(ns);
  const contract_servers = [];
  for (const server of servers) {
    if (ns.ls(server, "cct").length > 0) {
      contract_servers.push(server)
    }
  }
  return contract_servers
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
      factors.push(divisor)
      number = number / divisor
    }
    divisor += 1;
    if (divisor * divisor > number) {
      if (number > 1) { factors.push(number) }
      break
    }
  }
  return factors.reduce((a, b) => Math.max(a, b))
}

function solver_encryption_ii(plaintext: string, keyword: string): string {
  const plaintext_array = plaintext.split("");
  const keyword_array = keyword.split("");
  let encrypted_string = "";
  for (const character_index in plaintext_array) {
    const plaintext_character = plaintext_array[character_index]
    const keyword_character = keyword_array[Number(character_index) % keyword_array.length]
    const plaintext_index = alphabet_upper.indexOf(plaintext_character);
    const keyword_index = alphabet_upper.indexOf(keyword_character);
    encrypted_string = encrypted_string.concat(alphabet_upper[(plaintext_index + keyword_index) % alphabet_upper.length])
  }
  return encrypted_string;
}

function solver_overlapping_intervals(intervals: number[][]) {
  intervals.sort((a, b) => a[0] - b[0])
  const index_list: number[] = [];
  for (const interval in intervals) {
    const merger_list = intervals.slice(Number(interval) + 1)
    for (const merge_interval_index in merger_list) {
      if (merger_list[merge_interval_index][0] <= intervals[interval][1]) {
        index_list.push(Number(interval) + 1 + Number(merge_interval_index))
      } else {
        break;
      }
    }
  }
  const output_list: number[][] = [];
  for (const interval in intervals) {
    if (index_list.includes(Number(interval))) {
      output_list[output_list.length - 1][1] = Math.max(intervals[interval][1], output_list[output_list.length - 1][1])
    } else {
      output_list.push(intervals[interval])
    }
  }
  return output_list
}
