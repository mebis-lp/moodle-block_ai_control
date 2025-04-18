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
 * External functions and service declaration for ai_control.
 *
 * Documentation: {@link https://moodledev.io/docs/apis/subsystems/external/description}
 *
 * @package    block_ai_control
 * @copyright  2024 ISB Bayern
 * @author     Philipp Memmel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = [
        'block_ai_control_get_aiconfig' => [
                'classname' => 'block_ai_control\external\get_aiconfig',
                'description' => 'Retrieve the current AI config for the given context',
                'type' => 'read',
                'ajax' => true,
                'capabilities' => 'block/ai_control:control',
        ],
        'block_ai_control_update_aiconfig' => [
                'classname' => 'block_ai_control\external\update_aiconfig',
                'description' => 'Updates the current AI config for the given context',
                'type' => 'write',
                'ajax' => true,
                'capabilities' => 'block/ai_control:control',
        ],
];
