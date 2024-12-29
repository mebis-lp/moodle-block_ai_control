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

use local_ai_manager\local\userinfo;

/**
 * Block class for block_ai_control
 *
 * @package    block_ai_control
 * @copyright  2024 ISB Bayern
 * @author     Philipp Memmel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_ai_control extends block_base {

    /**
     * Initialize block
     *
     * @return void
     * @throws coding_exception
     */
    public function init(): void {
        $this->title = get_string('pluginname', 'block_ai_control');
    }

    /**
     * Allow the block to have a configuration page
     *
     * @return bool
     */
    #[\Override]
    public function has_config(): bool {
        return true;
    }

    /**
     * Returns the block content. Content is cached for performance reasons.
     *
     * @return stdClass
     * @throws coding_exception
     * @throws moodle_exception
     */
    #[\Override]
    public function get_content(): stdClass {
        global $OUTPUT, $USER;

        if ($this->content !== null) {
            return $this->content;
        }

        $this->content = new stdClass();
        $this->content->text = '';
        $this->content->footer = '';

        $context = \context_block::instance($this->instance->id);
        if (!has_capability('block/ai_control:view', $context) ||
                !has_capability('local/ai_manager:use', $context)) {
            return $this->content;
        }
        $tenant = \core\di::get(\local_ai_manager\local\tenant::class);
        $configmanager = \core\di::get(\local_ai_manager\local\config_manager::class);
        $aiconfig = \local_ai_manager\ai_manager_utils::get_ai_config($USER);
        $chatconfig = array_values(array_filter($aiconfig['purposes'], fn($purpose) => $purpose['purpose'] === 'chat'))[0];
        if (!$tenant->is_tenant_allowed()) {
            return $this->content;
        }
        if ($tenant->is_tenant_allowed() && !$configmanager->is_tenant_enabled()) {
            if ($aiconfig['role'] === userinfo::get_role_as_string(userinfo::ROLE_BASIC)) {
                return $this->content;
            }
        }
        if (!$chatconfig['isconfigured']) {
            if ($aiconfig['role'] === userinfo::get_role_as_string(userinfo::ROLE_BASIC)) {
                return $this->content;
            }
        }

        $this->content = new stdClass;

        $coursecontext = \local_ai_manager\ai_manager_utils::find_closest_parent_course_context($context);
        if (is_null($coursecontext)) {
            throw new \coding_exception('Could not find parent course context for block instance. '
                    . 'Other situations are not supported (yet).');
        }

        $this->content->text = $OUTPUT->render_from_template('block_ai_control/ai_control',
                ['contextid' => $coursecontext->id, 'cancontrol' => has_capability('block/ai_control:control', $context)]);

        return $this->content;
    }

    /**
     * Returns false as there can be only one ai_control block on one page to avoid collisions.
     *
     * @return bool
     */
    #[\Override]
    public function instance_allow_multiple(): bool {
        return false;
    }

    /**
     * Returns on which page formats this block can be added.
     *
     * @return array containing the page type config
     */
    #[\Override]
    public function applicable_formats(): array {
        return [
                'course-view' => true,
                'site' => false,
                'mod' => false,
                'my' => false,
        ];
    }

    /**
     * We don't want any user to manually create an instance of this block.
     *
     * @param \moodle_page $page the page to check if block can be added
     * @return bool if the user can add a block
     */
    #[\Override]
    public function user_can_addto($page) {
        return false;
    }
}
