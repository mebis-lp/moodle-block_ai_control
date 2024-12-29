// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Data retrieve and update function for the AI config for a given context.
 *
 * @module     block_ai_control/repository
 * @copyright  2024 ISB Bayern
 * @author     Philipp Memmel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {call as fetchMany} from 'core/ajax';

/**
 * Get the current AI config.
 *
 * @param {Number} contextid The id of the context the AI config is operating on
 * @return {Promise<Object>} The AI config object
 */
export const getAiconfig = (contextid) => fetchMany([{
    methodname: 'block_ai_control_get_aiconfig',
    args: {id: contextid},
}])[0];

/**
 * Updates the AI config object.
 *
 * @param {object} aiconfig The AI config object to update.
 * @return {Promise<Object>} The complete updated AI config object.
 */
export const updateAiconfig = (aiconfig) => fetchMany([{
    methodname: 'block_ai_control_update_aiconfig',
    args: {aiconfig: aiconfig},
}])[0];
