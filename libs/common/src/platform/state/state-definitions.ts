import { StateDefinition } from "./state-definition";

/**
 * `StateDefinition`s comes with some rules, to facilitate a quick review from
 * platform of this file, ensure you follow these rules, the ones marked with (tested)
 * have unit tests that you can run locally.
 *
 * 1. (tested) Names should not be null or undefined
 * 2. (tested) Name and storage location should be unique
 * 3. (tested) Name and storage location can't differ from another export by only casing
 * 4. (tested) Name should be longer than 3 characters. It should be descriptive, but brief.
 * 5. (tested) Name should not contain spaces or underscores
 * 6. Name should be human readable
 * 7. Name should be in camelCase format (unit tests ensure the first character is lowercase)
 * 8. Teams should only use state definitions they have created
 * 9. StateDefinitions should only be used for keys relating to the state name they chose
 *
 */

export const ACCOUNT_MEMORY = new StateDefinition("account", "memory");
