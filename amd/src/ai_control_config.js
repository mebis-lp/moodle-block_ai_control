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
 * Handler for the config area of block_ai_control.
 *
 * @module     block_ai_control/ai_control_config
 * @copyright  2024 ISB Bayern
 * @author     Philipp Memmel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {updateAiconfig} from 'block_ai_control/repository';
import {convertTargetUnixTimeToCountdown} from 'block_ai_control/ai_control';
import Templates from 'core/templates';
import {getString} from 'core/str';

let baseElement = null;

/**
 * Init the handler for the control area of block_ai_control.
 *
 * @param {HTMLElement} element the HTML element of the control area
 * @param {object} aiconfig the aiconfig which has been fetched from the external function
 */
export const init = async(element, aiconfig) => {
    baseElement = element;
    const templateContext = {};
    templateContext.identifier = 'aiconfig_enabled';
    templateContext.text = await getString('toggleai', 'block_ai_control');
    templateContext.checked = aiconfig.enabled;

    templateContext.expiresat = new Date(parseInt(aiconfig.expiresatLocaltime) * 1000).toISOString().slice(0, 16);

    const {days, hours, minutes} = convertTargetUnixTimeToCountdown(templateContext.expiresat);
    templateContext.durationDays = days;
    templateContext.durationHours = hours;
    templateContext.durationMinutes = minutes;

    templateContext.purposes = [];
    aiconfig.purposes.forEach(purpose => {
        const purposeConfig = {
            checked: purpose.allowed,
            identifier: 'purpose_' + purpose.name,
            text: purpose.displayname
        };
        templateContext.purposes.push(purposeConfig);
    });

    const {html, js} = await Templates.renderForPromise('block_ai_control/ai_control_config', {...templateContext});
    Templates.replaceNodeContents(baseElement, html, js);

    baseElement.querySelectorAll('[data-aiconfig-item^="switchexpiryview"]').forEach(button => {
        button.addEventListener('click', () => {
            const elementsToToggleVisibility = baseElement.querySelectorAll('[data-aiconfig-show]');
            elementsToToggleVisibility.forEach(element => {
                element.dataset.aiconfigShow = element.dataset.aiconfigShow === '1' ? '0' : '1';
                element.classList.toggle('d-none');
            });
            // Important that we call this AFTER we changed the view. The function syncViews depends on that fact.
            syncViews();
        });
    });

    baseElement.querySelector('[data-ai-config="submitbutton"]').addEventListener('click', async() => {
        // If we are in date view, we just use the current date. If we are in duration view we need to sync the duration
        // into the date, because when submitting the data we are using the date.
        const currentExpiryView =
            baseElement.querySelector('[data-aiconfig-item="switchexpiryviewduration"]').dataset.aiconfigShow === '0'
                ? 'duration' : 'date';
        if (currentExpiryView === 'duration') {
            updateDateFromDuration();
        }
        const refreshedData = await updateAiconfig(buildUpdateAiconfigObject());
        dispatchChangedEvent(refreshedData);
    });
    baseElement.querySelector('[data-toggle-identifier="aiconfig_enabled"] input').addEventListener('change', () => {
        baseElement.querySelector('[data-ai-control="purposeslist"]').classList.toggle('d-none');
        baseElement.querySelector('[data-ai-control="expirydate"]').classList.toggle('d-none');
    });
};

/**
 * Collects information from the DOM and builds the new aiconfig object.
 *
 * This object then can be sent to the update external function.
 *
 * @returns {object} the aiconfig object which then can be used to send it to the update webservice.
 */
const buildUpdateAiconfigObject = () => {
    const purposeConfigElements = baseElement.querySelectorAll('[data-toggle-identifier^="purpose_"]');
    const enabledToggle = baseElement.querySelector('[data-toggle-identifier="aiconfig_enabled"]');
    const expiresat = baseElement.querySelector('[data-aiconfig-item="expiresat"]');

    const aiconfig = {};
    aiconfig.id = baseElement.parentElement.dataset.contextid;
    aiconfig.enabled = !!parseInt(enabledToggle.dataset.checked);
    aiconfig.expiresat = parseInt(+new Date(expiresat.value)) / 1000;
    aiconfig.purposes = [];
    purposeConfigElements.forEach(purposeConfigElement => {
        const purpose = {};
        purpose.id = purposeConfigElement.dataset.toggleIdentifier.replace(/^purpose_/, '');
        purpose.allowed = !!parseInt(purposeConfigElement.dataset.checked);
        aiconfig.purposes.push(purpose);
    });
    return aiconfig;
};

/**
 * Helper function to dispatch a changed event.
 *
 * The info area will react to this changed event so it knows when it has to rerender itself.
 *
 * @param {object} refreshedAiconfig the refreshed aiconfig object which has been received by the update external function.
 */
const dispatchChangedEvent = (refreshedAiconfig) => {
    baseElement.dispatchEvent(new CustomEvent('aiconfigUpdated', {
        detail: {
            aiconfig: refreshedAiconfig
        }
    }));
};

const updateDateFromDuration = () => {
    const expirydate = baseElement.querySelector('[data-aiconfig-item="expiresat"]');
    const expirydurationDays = baseElement.querySelector('[data-aiconfig-item="expiryduration_days"]');
    const expirydurationHours = baseElement.querySelector('[data-aiconfig-item="expiryduration_hours"]');
    const expirydurationMinutes = baseElement.querySelector('[data-aiconfig-item="expiryduration_minutes"]');

    const currentTime = new Date();
    currentTime.setTime(currentTime.getTime() - currentTime.getTimezoneOffset() * 60 * 1000
        + (expirydurationDays.value * 24 * 60 * 60 * 1000)
        + (expirydurationHours.value * 60 * 60 * 1000)
        + (expirydurationMinutes.value * 60 * 1000));
    expirydate.value = currentTime.toISOString().slice(0, 16);
};

const updateDurationFromDate = () => {
    const expirydate = baseElement.querySelector('[data-aiconfig-item="expiresat"]');
    const expirydurationDays = baseElement.querySelector('[data-aiconfig-item="expiryduration_days"]');
    const expirydurationHours = baseElement.querySelector('[data-aiconfig-item="expiryduration_hours"]');
    const expirydurationMinutes = baseElement.querySelector('[data-aiconfig-item="expiryduration_minutes"]');

    const unixtime = parseInt(+new Date(expirydate.value)) / 1000;
    const {days, hours, minutes} = convertTargetUnixTimeToCountdown(unixtime);
    expirydurationDays.value = days;
    expirydurationHours.value = hours;
    expirydurationMinutes.value = minutes;
};

const syncViews = () => {
    // Will be called AFTER the switch has been done. So we will see the new state.
    const currentExpiryView =
        baseElement.querySelector('[data-aiconfig-item="switchexpiryviewduration"]').dataset.aiconfigShow === '0'
            ? 'duration' : 'date';
    // Now keep date view and duration view in sync if user just changed view.
    if (currentExpiryView === 'duration') {
        // We just switched to duration, so update the duration from the date values.
        updateDurationFromDate();
    } else {
        updateDateFromDuration();
    }
};
