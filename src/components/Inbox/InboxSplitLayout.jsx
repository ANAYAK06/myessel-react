// InboxSplitLayout.jsx - Switches an inbox page between split (Outlook-style) and list (classic) view
import React from 'react';
import LeftPanel from './LeftPanel';
import RightDetailPanel from './RightDetailPanel';
import InboxListPanel from './InboxListPanel';
import { useInboxView } from '../../contexts/InboxViewContext';

/**
 * InboxSplitLayout Component
 *
 * Wraps the grid layout each verification page uses for its LeftPanel +
 * RightDetailPanel pair. When viewMode is 'split' (default), renders the
 * exact same grid markup pages already use, unchanged. When viewMode is
 * 'list', renders the full-width InboxListPanel instead, with no side
 * detail panel — detail is shown via a full-width popup on row click.
 *
 * @param {Object} left - Props to pass through to LeftPanel / InboxListPanel
 * @param {Object} right - Props to pass through to RightDetailPanel (split mode only)
 * @param {boolean} isLeftPanelCollapsed - Collapse state (split mode only)
 * @param {function} onLeftPanelCollapseToggle - Collapse toggle handler
 * @param {boolean} isLeftPanelHovered - Hover state (split mode only)
 * @param {function} onLeftPanelHoverChange - Hover change handler
 */
const InboxSplitLayout = ({
    left = {},
    right = {},
    isLeftPanelCollapsed = false,
    onLeftPanelCollapseToggle,
    isLeftPanelHovered = false,
    onLeftPanelHoverChange
}) => {
    const { viewMode } = useInboxView();

    if (viewMode === 'list') {
        return (
            <div className="grid grid-cols-1 gap-6">
                <InboxListPanel {...left} />
            </div>
        );
    }

    return (
        <div
            className={`grid transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                : 'grid-cols-1 lg:grid-cols-3 gap-6'
                }`}
            onMouseLeave={() => {
                if (left.selectedItem && isLeftPanelCollapsed && onLeftPanelHoverChange) {
                    onLeftPanelHoverChange(false);
                }
            }}
        >
            <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                <LeftPanel
                    {...left}
                    isCollapsed={isLeftPanelCollapsed}
                    onCollapseToggle={onLeftPanelCollapseToggle}
                    isHovered={isLeftPanelHovered}
                    onHoverChange={onLeftPanelHoverChange}
                />
            </div>

            <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                <RightDetailPanel {...right} />
            </div>
        </div>
    );
};

export default InboxSplitLayout;
