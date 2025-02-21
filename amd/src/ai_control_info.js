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
 * Renders the info part of the block_ai_control.
 *
 * @module     block_ai_control/ai_control_info
 * @copyright  2024 ISB Bayern
 * @author     Philipp Memmel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getAiconfig} from 'block_ai_control/repository';
import Templates from 'core/templates';
import {convertTargetUnixTimeToCountdown} from "./ai_control";

let baseElement = null;
let contextId = null;
let countdownTimer = null;

/**
 * Handler main function for the info area.
 *
 * @param {HTMLElement} element the HTML element of the info area
 * @param {object} aiconfig the aiconfig object retrieved by the external function
 */
export const init = async(element, aiconfig) => {
    baseElement = element;
    contextId = aiconfig.id;
    await renderWidget(aiconfig);

    const controlArea = baseElement.parentElement.querySelector('[data-aicontrol="config"]');
    if (controlArea) {
        controlArea.addEventListener('aiconfigUpdated', async(event) => {
            const aiconfig = event.detail.aiconfig;
            const templateContext = {
                enabled: aiconfig.enabled,
                expiresat: aiconfig.expiresat,
                expiresatFormatted: aiconfig.expiresatFormatted
            };
            await renderWidget(templateContext);
        });
    }
};

/**
 * Helper function to render the info widget based on the template Context.
 *
 * @param {object} templateContext the template context to use for rendering
 */
const renderWidget = async(templateContext) => {
    const targetTime = templateContext.expiresat;
    // JavaScript Date object is in milliseconds, our expiresat being used in the context and stores in the database is in
    // seconds.
    const distance = targetTime * 1000 - Date.now();
    // For the last 5 minutes add a warning color.
    templateContext.warning = distance < 5 * 60 * 1000;
    const {html, js} = await Templates.renderForPromise('block_ai_control/ai_control_info', {...templateContext});
    Templates.replaceNodeContents(baseElement, html, js);

    const countdownElement = baseElement.querySelector('[data-aicontrol="countdown"]');

    clearInterval(countdownTimer);
    countdownTimer = setInterval(async() => {
        const {days, hours, minutes, seconds} = convertTargetUnixTimeToCountdown(targetTime);
        const countdownContext = {
            days,
            hours,
            minutes,
            seconds
        };
        countdownContext.showDays = countdownContext.days > 0;
        countdownContext.showHours = countdownContext.showDays ? true : countdownContext.hours > 0;
        countdownContext.showMinutes = countdownContext.showHours ? true : countdownContext.minutes > 0;
        countdownContext.showSeconds = countdownContext.showMinutes ? true : countdownContext.seconds > 0;

        const {html, js} = await Templates.renderForPromise('block_ai_control/ai_control_countdown', countdownContext);
        Templates.replaceNodeContents(countdownElement, html, js);

        // We have to recalculate the distance, because "Date.now()" changes every second.
        const distance = targetTime * 1000 - Date.now();
        // In the case that the AI is enabled, but the countdown has run to 0, we have to reload the whole info widget.
        if (templateContext.enabled && distance <= 0) {
            clearInterval(countdownTimer);
            const aiconfig = await getAiconfig(contextId);
            // We clone the aiconfig object just as precaution, so it will not be altered by the init function.
            await init(baseElement, {...aiconfig});
        }
    }, 1000);
};
