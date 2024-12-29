<?php
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
 * Hook listener callbacks.
 *
 * @package    block_ai_control
 * @copyright  2024 ISB Bayern
 * @author     Philipp Memmel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$callbacks = [
        [
                'hook' => \local_ai_manager\hook\additional_user_restriction::class,
                'callback' => \block_ai_control\local\hook_callbacks::class . '::handle_additional_user_restriction',
        ],
        [
                'hook' => \core_course\hook\after_form_definition::class,
                'callback' => \block_ai_control\local\hook_callbacks::class . '::handle_after_form_definition',
            // We try to hook directly below block_ai_chat if present.
                'priority' => 499,
        ],
        [
                'hook' => \core_course\hook\after_form_submission::class,
                'callback' => \block_ai_control\local\hook_callbacks::class . '::handle_after_form_submission',
        ],
        [
                'hook' => \core_course\hook\after_form_definition_after_data::class,
                'callback' => \block_ai_control\local\hook_callbacks::class . '::handle_after_form_definition_after_data',
        ],
];
