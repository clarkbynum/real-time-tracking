/**
 * @typedef EventDefinition
 * @property {string} together_word
 * 
 */

/**
 * @typedef Entity
 * @property {string} name
 * 
 */

/**
 * @typedef Area
 * @property {string} name
 * 
 */

/**
* @param {EventDefinition} eventDef
* @param {Entity} entity
* @param {Entity} [entity2]
* @param {Area} [area]
* @returns {string}
*/
function makeName(args) {
  return args.entity.name + " " + args.eventDef.together_word + " " + (args.entity2 ? args.entity2.name : args.area.name)
}